import { Injectable } from '@angular/core';
import { MOCK_USERDATA } from '../mocks/mock-user-data';
import { IUser } from '../model/user';
import { Observable, of } from 'rxjs';

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
}
