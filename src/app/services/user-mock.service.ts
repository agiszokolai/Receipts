import { Injectable } from '@angular/core';
import { LOGIN_DATA, MOCK_USERDATA } from '../mocks/mock-user-data';
import { IUser } from '../model/user';
import { BehaviorSubject, catchError, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root',
})
export class UserMockService {
  /**
   * Bejelenkezett felhasználó adtai
   */
  private _userSubject = new BehaviorSubject<IUser | null>(this.getUserFromStorage());
  user$ = this._userSubject.asObservable();

  private getUserFromStorage(): IUser | null {
    const storedUserToken = sessionStorage.getItem('authToken');

    if (storedUserToken) {
      const jwtHelper = new JwtHelperService();
      const decodedToken = jwtHelper.decodeToken(storedUserToken);

      if (decodedToken?.nameId) {
        // Keresés a MOCK_USERDATA-ban a decodedToken.nameId alapján
        const user = MOCK_USERDATA.find((u) => u.userId === decodedToken.nameId);

        if (user) {
          return user;
        } else {
          console.log('User not found in MOCK_USERDATA');
          return null; // Ha nincs ilyen felhasználó, akkor null-t adunk vissza
        }
      }
    }

    return null; // Ha nincs authToken, akkor null
  }

  updateUser(updatedUser: IUser): Observable<IUser | null> {
    this._userSubject.next(updatedUser);
    return this._userSubject.asObservable();
  }

  getUserById(id: number): Observable<IUser | undefined> {
    const user = MOCK_USERDATA.find((u) => u.userId === id.toString());
    return of(user);
  }

  getUserByUsername(name: string): Observable<IUser | undefined> {
    const user = MOCK_USERDATA.find((u) => u.username === name);
    return of(user);
  }
  /* LOGIN_DATA-ban findolnok, visszaadom a tokent, letárolok a sessionben, switchmappelek, visszafejtem a tokent megvan a userid (nameId) lekérdezem a usert és 
      mentem a user$-be
    */
  /*  logIn(email: string, password: string): Observable<User | null> {
    const user = MOCK_USERDATA.find(
      (u) => u.email === email && u.password === password
    );
    if (user) {
      user.loggedIn = true;
      return of(user);
    }
    return throwError(() => new Error('Hibás bejelentkezési adatok!'));
  } */

  logIn(email: string, password: string): Observable<IUser | null> {
    return of(LOGIN_DATA.find((u) => u.email === email && u.password === password)).pipe(
      switchMap((foundUser) => {
        if (!foundUser) {
          return throwError(() => new Error('Hibás email vagy jelszó!'));
        }

        // Token mentése sessionStorage-ba
        sessionStorage.setItem('authToken', foundUser.token);

        // Token dekódolása
        const jwtHelper = new JwtHelperService();
        const decodedToken = jwtHelper.decodeToken(foundUser.token);

        if (!decodedToken?.nameId) {
          return throwError(() => new Error('Érvénytelen token!'));
        }

        const user = MOCK_USERDATA.find((u) => u.userId === decodedToken.nameId);

        return of(user || null);
      }),
      tap((foundUser) => this._userSubject.next(foundUser)), // Frissíti a BehaviorSubject-et
      catchError((error) => {
        console.error('Hiba a bejelentkezés során:', error);
        return throwError(() => new Error('Bejelentkezési hiba!'));
      }),
    );
  }
  logOut(): Observable<boolean> {
    // Kijelentkezés: töröljük a sessionStorage-ból
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
    this._userSubject.next(null); // Kiürítjük a felhasználót
    return of(true);
  }

  registration(email: string, name: string, username: string, password: string): Observable<IUser> {
    const newUser: IUser = {
      userId: (Math.random() * 100).toFixed(0),
      email,
      username,
      password,
      name,
      receipts: {
        saved: [],
        liked: [],
        created: [],
        collections: [],
      },
    };

    MOCK_USERDATA.push(newUser);

    return of(newUser);
  }

  addLikedReceipt(userId: number, receptId: number): Observable<IUser | undefined> {
    const userIndex = MOCK_USERDATA.findIndex((u) => u.userId === userId.toString());

    if (userIndex !== -1) {
      const user = { ...MOCK_USERDATA[userIndex] };

      user.receipts.liked = user.receipts.liked ? [...user.receipts.liked] : [];

      if (!user.receipts.liked.includes(receptId)) {
        user.receipts.liked.push(receptId);
      }

      // Frissítés a mock adatbázisban
      MOCK_USERDATA[userIndex] = user;

      return of(user);
    }

    return of(undefined);
  }

  removeLikedReceipt(userId: number, receptId: number): Observable<IUser | undefined> {
    const userIndex = MOCK_USERDATA.findIndex((u) => u.userId === userId.toString());

    if (userIndex !== -1) {
      const user = { ...MOCK_USERDATA[userIndex] };

      user.receipts.liked = user.receipts.liked
        ? user.receipts.liked.filter((id) => id !== receptId)
        : [];

      MOCK_USERDATA[userIndex] = user;

      return of(user);
    }
    return of(undefined);
  }

  addSavedReceipt(userId: number, receptId: number): Observable<IUser | undefined> {
    const userIndex = MOCK_USERDATA.findIndex((u) => u.userId === userId.toString());

    if (userIndex !== -1) {
      const user = { ...MOCK_USERDATA[userIndex] };

      // Ha nincs inicializálva, hozzunk létre egy üres tömböt
      user.receipts.saved = user.receipts.saved ? [...user.receipts.saved] : [];

      // Ellenőrizzük, hogy már benne van-e
      if (!user.receipts.saved.includes(receptId)) {
        user.receipts.saved.push(receptId);
      }

      MOCK_USERDATA[userIndex] = user;

      return of(user);
    }
    return of(undefined);
  }

  removeSavedReceipt(userId: number, receptId: number): Observable<IUser | undefined> {
    const userIndex = MOCK_USERDATA.findIndex((u) => u.userId === userId.toString());

    if (userIndex !== -1) {
      const user = { ...MOCK_USERDATA[userIndex] };

      user.receipts.saved = user.receipts.saved
        ? user.receipts.saved.filter((id) => id !== receptId)
        : [];

      MOCK_USERDATA[userIndex] = user;

      return of(user);
    }
    return of(undefined);
  }

  /*   getAllCreatedReceiptsLikes(userId: number){

  } */
}
