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
  getUserById(id: number): Observable<IUser | undefined> {
    return of(undefined);
  }

  getUserByUsername(name: string): Observable<IUser | undefined> {
    return of(undefined);
  }

  getTopThreeUsers(): Observable<IUser[]> {
    return of([]);
  }
}
