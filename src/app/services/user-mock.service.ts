import { Injectable } from '@angular/core';
import { MOCK_USERDATA } from '../mocks/mock-user-data';
import { IUser } from '../model/user';
import { Observable, of } from 'rxjs';
import { MOCK_RECEIPTS } from '../mocks/mock-recipe-data';

@Injectable({
  providedIn: 'root',
})
export class UserMockService {
  getUserById(id: number): Observable<IUser | undefined> {
    const user = MOCK_USERDATA.find((u) => u.userId === id.toString());
    return of(user);
  }

  getUserByUsername(name: string): Observable<IUser | undefined> {
    const user = MOCK_USERDATA.find((u) => u.username === name);
    return of(user);
  }

  getTopThreeUsers(): Observable<IUser[]> {
    const userLikesMap = MOCK_USERDATA.map((user) => {
      const createdReceipts = MOCK_RECEIPTS.filter(
        (receipt) => receipt.createdById.toString() === user.userId,
      );

      const totalLikes = createdReceipts.reduce((acc, receipt) => acc + (receipt.likes || 0), 0);

      return {
        user,
        totalLikes,
      };
    });

    const sortedUsers = userLikesMap
      .sort((a, b) => b.totalLikes - a.totalLikes)
      .slice(0, 3) // Top 3
      .map((entry) => entry.user);

    return of(sortedUsers);
  }
}
