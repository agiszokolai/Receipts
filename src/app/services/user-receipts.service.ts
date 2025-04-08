/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { IUser, IUserReceipts } from '../model/user';

@Injectable({
  providedIn: 'root',
})
export class UserReceiptsService {
  /**
   * Hozzáad egy receptet a felhasználó kedvelt (liked) receptjeihez.
   *
   * @param userId A felhasználó azonosítója
   * @param receptId A kedvelendő recept azonosítója
   * @returns Observable a frissített felhasználói objektummal (vagy `undefined`)
   */
  addLikedReceipt(userId: string, receptId: number): Observable<IUser | undefined> {
    return of(undefined);
  }

  /**
   * Eltávolít egy receptet a felhasználó kedvencei közül.
   *
   * @param userId A felhasználó azonosítója
   * @param receptId A törlendő kedvenc recept azonosítója
   * @returns Observable a frissített felhasználói objektummal (vagy `undefined`)
   */
  removeLikedReceipt(userId: string, receptId: number): Observable<IUser | undefined> {
    return of(undefined);
  }

  /**
   * Elment egy receptet a felhasználó számára, opcionálisan egy adott gyűjteménybe.
   *
   * @param userId A felhasználó azonosítója
   * @param receptId A mentendő recept azonosítója
   * @param collectionId (opcionális) Gyűjtemény azonosító, ahová a recept kerül
   * @returns Observable a frissített mentett receptek struktúrával (vagy `undefined`)
   */
  addSavedReceipt(
    userId: string,
    receptId: number,
    collectionId?: number,
  ): Observable<IUserReceipts | undefined> {
    return of(undefined);
  }

  /**
   * Eltávolít egy receptet a felhasználó mentett receptjei közül.
   *
   * @param userId A felhasználó azonosítója
   * @param receptId A törlendő recept azonosítója
   * @returns Observable a frissített felhasználói objektummal (vagy `undefined`)
   */
  removeSavedReceipt(userId: string, receptId: number): Observable<IUser | undefined> {
    return of(undefined);
  }
}
