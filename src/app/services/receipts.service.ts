import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { IReceipt, IReview } from '../model/receipt';
import { IUser } from '../model/user';

@Injectable({
  providedIn: 'root',
})
export class ReceiptsService {
  /**
   * Minden recept lekérése.
   * Jelenleg egy üres tömböt ad vissza.
   *
   * @returns Observable recept tömb
   */
  getReceipts(): Observable<IReceipt[]> {
    return of([]);
  }

  /**
   * Egy recept lekérése azonosító alapján.
   *
   * @param id A recept egyedi azonosítója
   * @returns Observable a recepttel, ha megtalálható, különben `null`
   */
  getReceiptById(id: number): Observable<IReceipt | null> {
    return of(null);
  }

  /**
   * Több recept lekérése azonosítók alapján.
   *
   * @param ids Azonosítók listája
   * @returns Observable a receptek tömbjével
   */
  getReceiptsByIds(ids: number[]): Observable<IReceipt[]> {
    return of([]);
  }

  /**
   * A legjobbra értékelt receptek lekérése.
   *
   * @returns Observable a top receptekkel
   */
  getTopReceipts(): Observable<IReceipt[]> {
    return of([]);
  }

  /**
   * A legújabb receptek lekérése.
   *
   * @returns Observable az új receptekkel
   */
  getNewReceipts(): Observable<IReceipt[]> {
    return of([]);
  }

  /**
   * Új recept létrehozása egy adott felhasználó által.
   *
   * @param newReceipt Az új recept objektum
   * @param user A felhasználó, aki létrehozta
   * @returns Observable a frissített felhasználóval (vagy `null` ha sikertelen)
   */
  createReceipt(newReceipt: IReceipt, user: IUser): Observable<IUser | null> {
    return of(null);
  }

  /**
   * Egy meglévő recept módosítása.
   *
   * @param receipt A módosított recept objektum
   * @returns Observable a frissített recepttel (vagy `null`)
   */
  updateReceipt(receipt: IReceipt): Observable<IReceipt | null> {
    return of(null);
  }

  /**
   * Új értékelés hozzáadása egy recepthez.
   *
   * @param review Az új értékelés objektum
   * @param receiptId A recept azonosítója, amihez az értékelés tartozik
   * @returns Observable a frissített recepttel (vagy `null`)
   */
  addReview(review: IReview, receiptId: number): Observable<IReceipt | null> {
    return of(null);
  }

  /**
   * Egy meglévő értékelés módosítása egy adott recepthez.
   *
   * @param review A módosított értékelés
   * @param receiptId A recept azonosítója
   * @returns Observable a frissített recepttel (vagy `null`)
   */
  updateReview(review: IReview, receiptId: number): Observable<IReceipt | null> {
    return of(null);
  }
}
