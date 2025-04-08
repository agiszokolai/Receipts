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

  /**
   * Segédfüggvény a felhasználó állapotának visszatöltésére például a localStorage-ből.
   */
  private getUserFromStorage(): IUser | null {
    return null; // Ha nincs authToken, akkor null
  }

  /**
   * Bejelentkezteti a felhasználót az adott email és jelszó alapján.
   *
   * @param email A felhasználó e-mail címe
   * @param password A felhasználó jelszava
   * @returns Observable, ami a bejelentkezett felhasználót (vagy `null`-t) adja vissza
   */
  logIn(email: string, password: string): Observable<IUser | null> {
    return of(null);
  }

  /**
   * Frissíti a jelenlegi felhasználó adatait.
   *
   * @param updatedUser A frissített felhasználói adatok
   * @returns Observable, ami az új felhasználói adatokat (vagy `null`-t) adja vissza
   */
  updateUser(updatedUser: IUser): Observable<IUser | null> {
    return of(null);
  }

  /**
   * Kijelentkezteti a felhasználót az alkalmazásból.
   *
   *
   * @returns
   */
  logOut(): Observable<void> {
    return of();
  }

  /**
   * Regisztrál egy új felhasználót az alkalmazásba.
   *
   * @param email A felhasználó e-mail címe
   * @param name A felhasználó neve
   * @param username A felhasználó felhasználóneve
   * @param password A felhasználó jelszava
   * @returns Observable, ami a regisztrált felhasználót (vagy `null`-t) adja vissza
   */
  registration(
    email: string,
    name: string,
    username: string,
    password: string,
  ): Observable<IUser | null> {
    return of(null);
  }

  setNewPassword(email: string, password: string): Observable<boolean> {
    return of(true);
  }
}
