import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private originalList = new BehaviorSubject<any[]>([]);
  originalList$ = this.originalList.asObservable();

  private filteredListSubject = new BehaviorSubject<any[]>([]);
  filteredList$ = this.filteredListSubject.asObservable();

  searchedText = signal('');

  change(value: string) {
    this.searchedText.set(value);
  }

  setOriginalList(newList: any[]) {
    this.originalList.next(newList);
    console.log(this.originalList);
  }

  setFilteredList(list: any[]): void {
    this.filteredListSubject.next(list);
  }
}
