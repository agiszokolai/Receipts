/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { IUser, IUserReceipts } from '../model/user';

@Injectable({
  providedIn: 'root',
})
export class UserReceiptsService {
  addLikedReceipt(userId: string, receptId: number): Observable<IUser | undefined> {
    return of(undefined);
  }

  removeLikedReceipt(userId: string, receptId: number): Observable<IUser | undefined> {
    return of(undefined);
  }

  addSavedReceipt(
    userId: string,
    receptId: number,
    collectionId?: number,
  ): Observable<IUserReceipts | undefined> {
    return of(undefined);
  }

  removeSavedReceipt(userId: string, receptId: number): Observable<IUser | undefined> {
    return of(undefined);
  }
}
