import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { IUser } from '../model/user';
/* eslint-disable @typescript-eslint/no-unused-vars */

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  /**
   * Bejelenkezett felhasználó adtai
   */
  private _userSubject = new BehaviorSubject<IUser | null>(this.getUserFromStorage());
  user$ = this._userSubject.asObservable();

  private getUserFromStorage(): IUser | null {
    return null; // Ha nincs authToken, akkor null
  }

  logIn(email: string, password: string): Observable<IUser | null> {
    return of(null);
  }

  updateUser(updatedUser: IUser): Observable<IUser | null> {
    return of(null);
  }

  logOut(): Observable<void> {
    return of();
  }

  registration(
    email: string,
    name: string,
    username: string,
    password: string,
  ): Observable<IUser | null> {
    return of(null);
  }
}
