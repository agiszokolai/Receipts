import { Injectable } from '@angular/core';
import { MOCK_USERDATA } from '../mocks/mock-user-data';
import { User } from '../model/user';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  /**
   * Bejelenkezett felhasználó datai
   */
  user$ = new BehaviorSubject<User | null>(null);

  /* getActiveUser(): Observable<User | null> {
    return of(null);
  } */
  getUserById(id: number): Observable<User> {
    return of(MOCK_USERDATA[0]);
  }

  logIn(email: string, password: string): Observable<User | null> {
    return of(null);
  }
  logOut(user: User): Observable<boolean> {
    return of(true);
  }

  registration(
    email: string,
    username: string,
    password: string
  ): Observable<User> {
    return of(MOCK_USERDATA[0]);
  }

  /* 
  getLikedReceipts(): Observable<number[]> {
    return of([0]);
  }

  getSavedReceipts(): Observable<number[]> {
    return of([0]);
  } */

  addLikedReceipt(receptId: number): Observable<boolean> {
    return of(true);
  }

  removeLikedReceipt(receptId: number): Observable<boolean> {
    return of(true);
  }

  addSavedReceipt(receptId: number): Observable<boolean> {
    return of(true);
  }

  removeSavedReceipt(receptId: number): Observable<boolean> {
    return of(true);
  }
}
