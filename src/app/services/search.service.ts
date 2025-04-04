import { effect, Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IReceipt } from '../model/receipt';
import { ISearch } from '../model/shared';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private originalList = new BehaviorSubject<IReceipt[]>([]);
  originalList$ = this.originalList.asObservable();

  private filteredListSubject = new BehaviorSubject<IReceipt[]>([]);
  filteredList$ = this.filteredListSubject.asObservable();

  searchData = signal<ISearch>({
    searchText: '',
    categories: [],
    difficulties: [],
    prepTime: [],
    rating: [],
  });

  constructor() {
    effect(() => {
      this.applyFilter(this.originalList.getValue(), this.searchData());
    });
  }

  // Beállítja az eredeti listát
  setOriginalList(newList: IReceipt[]) {
    //receptre váltáskor majd vissza így marad meg az adat
    if (this.filteredListSubject.getValue().length === 0) {
      this.originalList.next(newList);
      this.filteredListSubject.next(newList);
    } else {
      const updatedFilteredList = this.filteredListSubject.getValue().map((item) => {
        const updatedItem = newList.find((r) => r.id === item.id);
        return updatedItem ? { ...item, ...updatedItem } : item;
      });

      this.filteredListSubject.next(updatedFilteredList);
    }
  }

  // szűrt lista
  setFilteredList(list: IReceipt[]): void {
    this.filteredListSubject.next(list);
  }

  changeSearchData(updatedValues: Partial<ISearch>) {
    this.searchData.set({
      ...this.searchData(),
      ...updatedValues,
    });
  }
  /**
   * Szűrés beállítása
   * @param list A lista ammiben szűrni kell
   * @param search Szűrési értékek
   */
  private applyFilter(list: IReceipt[], search: ISearch) {
    let filteredList = list;

    /* Ha van kategória */
    if (search.categories.length > 0) {
      filteredList = filteredList.filter((item) =>
        search.categories.some((category) => item.category.includes(category)),
      );
    }

    /* Ha van nehézség */
    if (search.difficulties.length > 0) {
      filteredList = filteredList.filter((item) =>
        search.difficulties.some((difficulty) => item.difficulty.includes(difficulty)),
      );
    }

    /* Ha van elkészítési idő */
    if (search.prepTime.length > 0 && !search.prepTime.includes('Mind')) {
      filteredList = filteredList.filter((item) => {
        const totalTime = item.prepTime + (item.cookingTime || 0);

        if (search.prepTime.includes('Gyors')) {
          return totalTime <= 30;
        } else if (search.prepTime.includes('Közepes')) {
          return totalTime <= 60 && totalTime > 30;
        } else if (search.prepTime.includes('Hosszadalmas')) {
          return totalTime > 60;
        }

        return false;
      });
    }

    /* Ha van értékelés */
    if (search.rating.length > 0) {
      filteredList = filteredList.filter((item) =>
        search.rating.includes(Number(item.averageRating).toString()),
      );
    }

    /* Ha van keresési szöveg szűr a név és a tagek alapján */
    if (search.searchText.trim() !== '') {
      filteredList = filteredList.filter(
        (item) =>
          item.name.toLowerCase().includes(search.searchText) ||
          item.tags.some((tag) => tag.toLowerCase().includes(search.searchText)),
      );
    }

    this.setFilteredList(filteredList);
  }
}
