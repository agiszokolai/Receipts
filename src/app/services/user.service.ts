/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@angular/core';
import { LOGIN_DATA, MOCK_USERDATA } from '../mocks/mock-user-data';
import { IUser, IUserReceipts } from '../model/user';
import { BehaviorSubject, catchError, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  /**
   * Bejelenkezett felhasználó adtai
   */
  private _userSubject = new BehaviorSubject<IUser | null>(this.getUserFromStorage());
  user$ = this._userSubject.asObservable();

  private getUserFromStorage(): IUser | null {
    return null; // Ha nincs authToken, akkor null
  }

  updateUser(updatedUser: IUser): Observable<IUser | null> {
    return of(null);
  }

  getUserById(id: number): Observable<IUser | undefined> {
    return of(undefined);
  }

  getUserByUsername(name: string): Observable<IUser | undefined> {
    return of(undefined);
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
    return of(null);
  }
  logOut(): Observable<void> {
    return of();
  }

  registration(email: string, name: string, username: string, password: string): Observable<IUser> {
    const newUser: IUser = {
      userId: (Math.random() * 100).toFixed(0),
      email,
      username,
      name,
      password,
      /*  loggedIn: true,  */
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

  addLikedReceipt(userId: string, receptId: number): Observable<IUser | undefined> {
    const userIndex = MOCK_USERDATA.findIndex((u) => u.userId === userId.toString());

    if (userIndex !== -1) {
      const user = { ...MOCK_USERDATA[userIndex] };

      /*   user.likedReceipts = user.likedReceipts ? [...user.likedReceipts] : []; */

      /* if (!user.likedReceipts.includes(receptId)) {
        user.likedReceipts.push(receptId);
      } */

      // Frissítés a mock adatbázisban
      MOCK_USERDATA[userIndex] = user;

      return of(user);
    }

    return of(undefined);
  }

  removeLikedReceipt(userId: string, receptId: number): Observable<IUser | undefined> {
    const userIndex = MOCK_USERDATA.findIndex((u) => u.userId === userId.toString());

    if (userIndex !== -1) {
      const user = { ...MOCK_USERDATA[userIndex] };

      /*  user.likedReceipts = user.likedReceipts
        ? user.likedReceipts.filter((id) => id !== receptId)
        : []; */

      MOCK_USERDATA[userIndex] = user;

      return of(user);
    }
    return of(undefined);
  }

  addSavedReceipt(
    userId: string,
    receptId: number,
    collectionId?: number,
  ): Observable<IUserReceipts | undefined> {
    return of(undefined);
  }

  //TODO: ezt átnézni miért nem jó
  removeSavedReceipt(userId: string, receptId: number): Observable<IUser | undefined> {
    return of(undefined);
  }

  /*   getAllCreatedReceiptsLikes(userId: number){
  
    } */
}
