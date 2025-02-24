import { Injectable } from '@angular/core';
import { LOGIN_DATA, MOCK_USERDATA } from '../mocks/mock-user-data';
import { User } from '../model/user';
import {
  BehaviorSubject,
  catchError,
  Observable,
  of,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root',
})
export class UserMockService {
  /**
   * Bejelenkezett felhasználó datai
   */
  user$ = new BehaviorSubject<User | null>(null);

  /*  getActiveUser(): Observable<User | null> {
    const user = MOCK_USERDATA.find((u) => u.loggedIn === true);

    return of(user ? user : null);
  } */

  getUserById(id: number): Observable<User | undefined> {
    const user = MOCK_USERDATA.find((u) => u.userId === id.toString());
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

  logIn(email: string, password: string): Observable<User | null> {
    return of(
      LOGIN_DATA.find((u) => u.email === email && u.password === password)
    ).pipe(
      switchMap((foundUser) => {
        if (!foundUser) {
          return throwError(() => new Error('Hibás email vagy jelszó!'));
        }

        // Token mentése sessionStorage-ba
        sessionStorage.setItem('authToken', foundUser.token);

        // Token dekódolása
        const jwtHelper = new JwtHelperService();
        const decodedToken = jwtHelper.decodeToken(foundUser.token);
        console.log(decodedToken);

        if (!decodedToken?.nameId) {
          return throwError(() => new Error('Érvénytelen token!'));
        }
        console.log(
          MOCK_USERDATA.find((u) => u.userId === decodedToken.nameId) || null
        );

        return of(
          MOCK_USERDATA.find((u) => u.userId === decodedToken.nameId) || null
        );
      }),
      tap((foundUser) => this.user$.next(foundUser)), // Frissíti a BehaviorSubject-et
      catchError((error) => {
        console.error('Hiba a bejelentkezés során:', error);
        return throwError(() => new Error('Bejelentkezési hiba!'));
      })
    );
  }

  logOut(user: User): Observable<boolean> {
    if (user) {
      return of(true);
    }
    return of(false);
  }

  registration(
    email: string,
    username: string,
    password: string
  ): Observable<User> {
    const newUser: User = {
      userId: (Math.random() * 100).toFixed(0),
      email,
      username,
      password,
      /*  loggedIn: true, */
      savedReceipts: [],
      likedReceipts: [],
    };

    MOCK_USERDATA.push(newUser);

    return of(newUser);
  }

  addLikedReceipt(
    userId: number,
    receptId: number
  ): Observable<User | undefined> {
    const userIndex = MOCK_USERDATA.findIndex(
      (u) => u.userId === userId.toString()
    );

    if (userIndex !== -1) {
      const user = { ...MOCK_USERDATA[userIndex] };

      user.likedReceipts = user.likedReceipts ? [...user.likedReceipts] : [];

      if (!user.likedReceipts.includes(receptId)) {
        user.likedReceipts.push(receptId);
      }

      // Frissítés a mock adatbázisban
      MOCK_USERDATA[userIndex] = user;

      return of(user);
    }

    return of(undefined);
  }

  removeLikedReceipt(
    userId: number,
    receptId: number
  ): Observable<User | undefined> {
    const userIndex = MOCK_USERDATA.findIndex(
      (u) => u.userId === userId.toString()
    );

    if (userIndex !== -1) {
      const user = { ...MOCK_USERDATA[userIndex] };

      user.likedReceipts = user.likedReceipts
        ? user.likedReceipts.filter((id) => id !== receptId)
        : [];

      MOCK_USERDATA[userIndex] = user;

      return of(user);
    }
    return of(undefined);
  }

  addSavedReceipt(
    userId: number,
    receptId: number
  ): Observable<User | undefined> {
    const userIndex = MOCK_USERDATA.findIndex(
      (u) => u.userId === userId.toString()
    );

    if (userIndex !== -1) {
      const user = { ...MOCK_USERDATA[userIndex] };

      // Ha nincs inicializálva, hozzunk létre egy üres tömböt
      user.savedReceipts = user.savedReceipts ? [...user.savedReceipts] : [];

      // Ellenőrizzük, hogy már benne van-e
      if (!user.savedReceipts.includes(receptId)) {
        user.savedReceipts.push(receptId);
      }

      MOCK_USERDATA[userIndex] = user;

      return of(user);
    }
    return of(undefined);
  }

  removeSavedReceipt(
    userId: number,
    receptId: number
  ): Observable<User | undefined> {
    const userIndex = MOCK_USERDATA.findIndex(
      (u) => u.userId === userId.toString()
    );

    if (userIndex !== -1) {
      const user = { ...MOCK_USERDATA[userIndex] };

      user.savedReceipts = user.savedReceipts
        ? user.savedReceipts.filter((id) => id !== receptId)
        : [];

      MOCK_USERDATA[userIndex] = user;

      return of(user);
    }
    return of(undefined);
  }

  /*   getAllCreatedReceiptsLikes(userId: number){

  } */
}
