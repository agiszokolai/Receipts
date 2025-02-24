import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Receipt } from '../model/receipt';
import { MOCK_RECEIPTS } from '../mocks/mock-recipe-data';

@Injectable({
  providedIn: 'root',
})
export class ReceiptsMockService {
  constructor() {}

  getReceipts(): Observable<Receipt[]> {
    return of(MOCK_RECEIPTS);
  }

  getReceiptById(id: number): Observable<Receipt | null> {
    const receipt = MOCK_RECEIPTS.find((r) => Number(r.id) === Number(id));

    return of(receipt ?? null);
  }

  getReceiptsByIds(ids: number[]): Observable<Receipt[]> {
    const receipts = MOCK_RECEIPTS.filter((r) => ids.includes(r.id));
    return of(receipts);
  }
}
