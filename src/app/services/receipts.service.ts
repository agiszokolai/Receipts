import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { IReceipt, IReview } from '../model/receipt';

@Injectable({
  providedIn: 'root',
})
export class ReceiptsService {
  getReceipts(): Observable<IReceipt[]> {
    return of([]);
  }

  getReceiptById(id: number): Observable<IReceipt | null> {
    return of(null);
  }
  getReceiptByName(name: string): Observable<IReceipt | null> {
    return of(null);
  }
  getReceiptsByIds(ids: number[]): Observable<IReceipt[]> {
    return of([]);
  }

  createReceipt(newReceipt: IReceipt): Observable<IReceipt | null> {
    return of(null);
  }

  updateReceipt(receipt: IReceipt): Observable<IReceipt | null> {
    return of(null);
  }
  addReview(review: IReview, receiptId: number): Observable<IReceipt | null> {
    return of(null);
  }

  // Az értékelés frissítése
  updateReview(review: IReview, receiptId: number): Observable<IReceipt | null> {
    return of(null);
  }
}
