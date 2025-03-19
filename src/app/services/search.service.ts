import { effect, Injectable, signal } from '@angular/core';
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
  selectedCategories = signal<string[]>([]);

  constructor() {
    effect(() => {
      this.applyFilter(
        this.originalList.getValue(),
        this.searchedText(),
        this.selectedCategories(),
      );
    });
  }

  // Beállítja az eredeti listát
  setOriginalList(newList: any[]) {
    this.originalList.next(newList);
  }

  // szűrt lista
  setFilteredList(list: any[]): void {
    this.filteredListSubject.next(list);
  }

  // Keresési szöveg változik
  changeSearchText(value: string) {
    this.searchedText.set(value);
  }

  // Kiválasztott kategóriák változnak
  changeSelectedCategories(categories: string[]) {
    this.selectedCategories.set(categories);
  }

  // Szűrés
  private applyFilter(list: any[], searchText: string, categories: string[]) {
    let filteredList = list;

    if (categories.length > 0) {
      filteredList = filteredList.filter((item) =>
        categories.some((category) => item.category.includes(category)),
      );
    }

    if (searchText.trim() !== '') {
      filteredList = filteredList.filter((item) =>
        item.name.toLowerCase().includes(searchText.toLowerCase()),
      );
    }

    this.setFilteredList(filteredList); // Hívjuk a setFilteredList-t, hogy biztosítsuk a frissítést
  }
}
