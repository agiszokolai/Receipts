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
}
