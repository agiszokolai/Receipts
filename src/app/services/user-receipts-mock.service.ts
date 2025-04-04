import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MOCK_USERDATA } from '../mocks/mock-user-data';
import { IUser, IUserReceipts } from '../model/user';

@Injectable({
  providedIn: 'root',
})
export class UserReceiptsMockService {
  addLikedReceipt(userId: string, receptId: number): Observable<IUser | undefined> {
    const userIndex = MOCK_USERDATA.findIndex((u) => u.userId === userId.toString());

    if (userIndex !== -1) {
      const user = { ...MOCK_USERDATA[userIndex] };

      user.receipts.liked = user.receipts.liked ? [...user.receipts.liked] : [];

      if (!user.receipts.liked.includes(receptId)) {
        user.receipts.liked.push(receptId);
      }

      // Frissítés a mock adatbázisban
      MOCK_USERDATA[userIndex] = user;

      return of(user);
    }

    return of(undefined);
  }

  removeLikedReceipt(userId: string, receptId: number): Observable<IUser | undefined> {
    const userIndex = MOCK_USERDATA.findIndex((u) => u.userId === userId.toString());

    if (userIndex !== -1) {
      const user = { ...MOCK_USERDATA[userIndex] };

      user.receipts.liked = user.receipts.liked
        ? user.receipts.liked.filter((id) => id !== receptId)
        : [];

      MOCK_USERDATA[userIndex] = user;

      return of(user);
    }
    return of(undefined);
  }

  addSavedReceipt(
    userId: string,
    receptId: number,
    collectionId?: number,
  ): Observable<IUserReceipts | undefined> {
    const userIndex = MOCK_USERDATA.findIndex((u) => u.userId === userId);

    if (userIndex !== -1) {
      const user = { ...MOCK_USERDATA[userIndex] };

      if (!collectionId) {
        user.receipts.saved = user.receipts.saved ?? [];

        if (!user.receipts.saved.includes(receptId)) {
          user.receipts.saved = [...user.receipts.saved, receptId];
        }
      } else {
        const collection = user.receipts.collections?.find((c) => c.id === collectionId);

        if (collection) {
          if (!collection.receipts.includes(receptId)) {
            collection.receipts = [...collection.receipts, receptId];
          }
        }
      }

      // Frissítjük a felhasználót a MOCK_USERDATA-ban
      MOCK_USERDATA[userIndex] = user;

      return of(user.receipts);
    }
    return of(undefined);
  }

  removeSavedReceipt(userId: string, receptId: number): Observable<IUser | undefined> {
    const userIndex = MOCK_USERDATA.findIndex((u) => u.userId === userId.toString());

    if (userIndex !== -1) {
      const user = { ...MOCK_USERDATA[userIndex] };

      user.receipts.saved = user.receipts.saved.filter((id) => id !== receptId);
      user.receipts.collections?.forEach((collection) => {
        collection.receipts = collection.receipts.filter((id) => id !== receptId);
      });

      MOCK_USERDATA[userIndex] = user;

      return of(user);
    }
    return of(undefined);
  }

  /*   getAllCreatedReceiptsLikes(userId: number){

  } */
}
