import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Receipt } from '../model/receipt';

@Injectable({
  providedIn: 'root',
})
export class ReceiptsService {
  constructor() {}

  getReceipts(): Observable<Receipt[]> {
    return of([]);
  }

  getReceiptById(id: number): Observable<Receipt | null> {
    return of(null); // Ha nincs adat, null-t adunk vissza
  }

  getReceiptsByIds(ids: number[]): Observable<Receipt[]> {
    return of([]);
  }
}
