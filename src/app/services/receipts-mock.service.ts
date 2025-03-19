import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { IReceipt, IReview } from '../model/receipt';
import { MOCK_RECEIPTS } from '../mocks/mock-recipe-data';
import { generateSlug } from '../helpers/validators';

@Injectable({
  providedIn: 'root',
})
export class ReceiptsMockService {
  getReceipts(): Observable<IReceipt[]> {
    return of(MOCK_RECEIPTS);
  }

  getReceiptById(id: number): Observable<IReceipt | null> {
    const receipt = MOCK_RECEIPTS.find((r) => Number(r.id) === Number(id));

    return of(receipt ?? null);
  }

  getReceiptByName(name: string): Observable<IReceipt | null> {
    const receipt = MOCK_RECEIPTS.find((r) => generateSlug(r.name) === name);

    return of(receipt ?? null);
  }

  getReceiptsByIds(ids: number[]): Observable<IReceipt[]> {
    const receipts = MOCK_RECEIPTS.filter((r) => ids.includes(r.id));
    return of(receipts);
  }

  createReceipt(newReceipt: IReceipt): Observable<IReceipt | null> {
    const createdReceipt: IReceipt = { ...newReceipt };

    // Hozzáadjuk az új receptet a MOCK_RECEIPTS tömbhöz
    MOCK_RECEIPTS.push(createdReceipt);

    // Visszaadjuk az új receptet
    return of(createdReceipt);
  }

  updateReceipt(receipt: IReceipt): Observable<IReceipt | null> {
    const index = MOCK_RECEIPTS.findIndex((r) => r.id === receipt.id);
    if (index !== -1) {
      MOCK_RECEIPTS[index] = receipt;
    }

    return of(receipt);
  }

  addReview(review: IReview, receiptId: number): Observable<IReceipt | null> {
    const receipt = MOCK_RECEIPTS.find((r) => r.id === receiptId);
    if (receipt) {
      // Ha megtaláltuk a receptet, hozzáadjuk az értékelést
      receipt.reviews = receipt.reviews || [];
      receipt.reviews.push(review);

      // Visszaadjuk a frissített receptet az Observable-ben
      return of(receipt); // A receptet most visszaadjuk
    }
    // Ha nem találjuk a receptet, akkor null-t adunk vissza
    return of(null);
  }

  // Az értékelés frissítése
  updateReview(review: IReview, receiptId: number): Observable<IReceipt | null> {
    const receipt = MOCK_RECEIPTS.find((r) => r.id === receiptId);
    if (receipt) {
      const existingReview = receipt.reviews?.find((r) => r.userId === review.userId);
      if (existingReview) {
        // Módosítjuk a létező értékelést
        Object.assign(existingReview, review);
      }
      return of(receipt);
    }
    return of(null);
  }
}
