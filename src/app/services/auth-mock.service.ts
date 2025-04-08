import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable, of, switchMap, throwError, tap, catchError, BehaviorSubject } from 'rxjs';
import { LOGIN_DATA, MOCK_USERDATA } from '../mocks/mock-user-data';
import { IUser } from '../model/user';

@Injectable({
  providedIn: 'root',
})
export class AuthMockService {
  private _userSubject = new BehaviorSubject<IUser | null>(this.getUserFromStorage());
  user$ = this._userSubject.asObservable();

  logIn(email: string, password: string): Observable<IUser | null> {
    console.log('adatok:', email, password);
    console.log('data:', LOGIN_DATA);

    console.log(LOGIN_DATA.find((u) => u.email === email && u.password === password));

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

  updateUser(updatedUser: IUser): Observable<IUser | null> {
    this._userSubject.next(updatedUser);
    return this._userSubject.asObservable();
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
      userId: (MOCK_USERDATA.length + 1).toString(),
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

  //TODO: valamiért undefined a jelszó
  setNewPassword(email: string, password: string): Observable<boolean> {
    /*  console.log('LOGINDATA', LOGIN_DATA);
    console.log('MOCK_USERDATA', MOCK_USERDATA);
    console.log('Beállítás előtt:', JSON.stringify(MOCK_USERDATA, null, 2)); */

    const userIndex = MOCK_USERDATA.findIndex((u) => u.email === email);
    const loginIndex = LOGIN_DATA.findIndex((u) => u.email === email);
    /* console.log('userIndex', userIndex);
    console.log('loginIndex', loginIndex);
 */
    if (userIndex !== -1 && loginIndex !== -1) {
      // Módosítjuk a jelszót mindkét tömbben
      MOCK_USERDATA[userIndex] = {
        ...MOCK_USERDATA[userIndex],
        password: password,
      };
      LOGIN_DATA[loginIndex].password = password;
      /*   console.log('Beállítás után:', JSON.stringify(MOCK_USERDATA[userIndex], null, 2));
      console.log('Frissített jelszó MOCK_USERDATA:', MOCK_USERDATA[userIndex]);

      console.log('Frissített jelszó LOGIN_DATA:', LOGIN_DATA[loginIndex]); */
      return of(true);
    } else {
      console.log('Felhasználó nem található');
      return of(false); // Ha nem található a felhasználó, false-t adunk vissza
    }
  }
}
