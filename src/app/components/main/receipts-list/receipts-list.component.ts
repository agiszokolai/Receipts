import { Component, HostListener, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { IReceipt } from '../../../model/receipt';
import { Observable, of, ReplaySubject, switchMap, take, takeUntil } from 'rxjs';
import { ReceiptsService } from '../../../services/receipts.service';
import { SearchService } from '../../../services/search.service';
import { AsyncPipe, CommonModule } from '@angular/common';
import { ReceiptCardComponent } from './receipt-card/receipt-card.component';
import { UserService } from '../../../services/user.service';
import { IUser } from '../../../model/user';
import { ReceiptListItemComponent } from './receipt-list-item/receipt-list-item.component';
import { FadeDirective } from '../../../directives/fade.directive';
import { getFilterLabel, getPrepTimeCategory } from '../../../helpers/helpers';
import { blankFood, CategoryEnum, DifficultyEnum } from '../../../helpers/constants';
import { SelectFilterComponent } from '../../shared/select-filter/select-filter.component';
import { FormsModule } from '@angular/forms';
import { SaveRecipeComponent } from './save-recipe/save-recipe.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-receipts-list',
  standalone: true,
  templateUrl: './receipts-list.component.html',
  imports: [
    CommonModule,
    ReceiptCardComponent,
    ReceiptListItemComponent,
    FadeDirective,
    AsyncPipe,
    SelectFilterComponent,
    FormsModule,
    SaveRecipeComponent,
  ],
})
export class ReceiptsListComponent implements OnInit, OnDestroy {
  /**  Belépett felhasználó  */
  public user: IUser | null = null;

  //TODO: kiszervezni servce-be
  screenWidth!: number;
  categoryEnum = Object.values(CategoryEnum);
  difficultyEnum = Object.values(DifficultyEnum);

  isSaveModalOpen = signal(false);

  underSaveRecipe: IReceipt | null = null;

  isDropdownOpen = false;
  selectedOption = { label: 'Alapértelmezett', value: 'default' };

  sortOptions = [
    { label: 'Alapértelmezett', value: 'default' },
    { label: 'Újak elől', value: 'newest' },
    { label: 'Régiek elől', value: 'oldest' },
    { label: 'Népszerűek elől', value: 'popular' },
  ];

  showAll = false;

  selectedCookingTime = 0;

  bubblePosition = '';

  prepTimeOptions = ['Mind', 'Gyors', 'Közepes', 'Hosszadalmas'];

  /** Keresett szöveg */
  searchText = '';

  /**
   * Szűrt receptek listája (keresés, kategória választás)
   */
  public filterdReceipts$!: Observable<IReceipt[]>;

  /** Listák megjelenítésének típusa  */
  public gridMode = true;

  private readonly destroyed$ = new ReplaySubject<void>(1);

  private readonly receiptsService = inject(ReceiptsService);
  public readonly searchService = inject(SearchService);
  private readonly userService = inject(UserService);
  private readonly toastr = inject(ToastrService);

  get searchData() {
    return this.searchService.searchData();
  }

  ngOnInit(): void {
    this.screenWidth = window.innerWidth;

    this.getActiveUser();
    this.loadFilteredList();
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  getActiveUser(): void {
    this.userService.user$
      .pipe(
        switchMap((u) => {
          this.user = u;
          return this.receiptsService.getReceipts();
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe({
        next: (receipts) => this.getReceiptData(receipts),
        error: (err) => console.error('Hiba:', err),
      });
  }

  loadFilteredList(): void {
    this.filterdReceipts$ = this.searchService.filteredList$.pipe(
      switchMap((receipts) => of(this.sortReceipts(receipts))),
    );
  }

  getReceiptData(receipts: IReceipt[]): void {
    const updatedReceipts = receipts.map((receipt) => ({
      ...receipt,
      imageUrl: receipt.imageUrl?.length ? receipt.imageUrl : blankFood,
      isLikedByUser: this.user?.receipts.liked.includes(receipt.id) ?? false,
      isSavedByUser:
        (this.user?.receipts?.saved?.includes(receipt.id) ||
          this.user?.receipts?.collections?.some((collection) =>
            collection.receipts.includes(receipt.id),
          )) ??
        false,
    }));

    this.searchService.setOriginalList(updatedReceipts);
  }
  /**
   * Kezeli egy recept mentett vagy kedvelt állapotának változását a felhasználónál.
   *
   * @param {{ receiptId: number; action: 'like' | 'save'; state: boolean }} event - Az esemény objektum, amely tartalmazza a recept azonosítóját és a mentési/kedvelést és az állapotot.
   * @returns {void}
   */
  handleUserAction(event: { receiptId: number; action: 'like' | 'save'; state: boolean }): void {
    const currentUser = this.user;
    if (!currentUser) return;
    console.log(event);

    if (event.action === 'save') {
      this.receiptsService
        .getReceiptById(event.receiptId)
        .pipe(take(1))
        .subscribe({
          next: (receipt) => {
            this.underSaveRecipe = receipt;

            if (event.state) {
              this.isSaveModalOpen.set(true);
            } else {
              this.isSaveModalOpen.set(false);
              this.userService.removeSavedReceipt(currentUser.userId, event.receiptId).subscribe({
                next: (user) => {
                  if (user) {
                    this.userService.updateUser(user);
                    this.getActiveUser();
                    this.toastr.success('Sikeresen kikerült a recept a mentettek közül');
                  }
                },
              });
            }
          },
          error: () => {
            console.log('Hiba a recept lekérdezésekor');
          },
        });
    }

    if (event.action === 'like') {
      if (event.state) {
        this.userService.addLikedReceipt(currentUser.userId, event.receiptId).subscribe({
          next: (user) => {
            if (user) {
              this.userService.updateUser(user);
              this.toastr.success('Sikeresen kedvencnek jelölve!');
            }
          },
        });
      } else {
        this.userService.removeLikedReceipt(currentUser.userId, event.receiptId).subscribe({
          next: (user) => {
            if (user) {
              this.userService.updateUser(user);
              this.toastr.success('Sikeresen eltávolítva a kedvencek közül!');
            }
          },
        });
      }
    }
  }

  handleSaveEvent(updatedUser: IUser) {
    this.isSaveModalOpen.set(false);
    this.user = updatedUser;
    this.getActiveUser();
  }
  /**
   * Keresési szöveg változik
   */
  onSearchChange() {
    this.searchService.changeSearchData({ searchText: this.searchService.searchData().searchText });
  }

  /**Keresési kategóriák neve magyarul */
  filterLabel(item: string) {
    return getFilterLabel(item);
  }

  /**
   * ha változik a keresési adat
   * @param filterType keresési típus
   * @param selectedValues Kiválasztott értékek
   */
  onFilterChange(filterType: string, selectedValues: string[]) {
    if (filterType === 'prepTime') {
      const prepTime = getPrepTimeCategory(selectedValues[0]);
      selectedValues = prepTime;
    }
    this.searchService.changeSearchData({ [filterType]: [...selectedValues] });
  }

  /**
   * ha változik a keresés adat (törlésre kerül)
   * @param type keresési típus
   * @param value Kiválasztott érték
   */
  removeSelectedFilter(type: string, value: string | number) {
    if (type === 'prepTime') {
      this.selectedCookingTime = 0;
    }
    const originalList = this.searchData[type as keyof typeof this.searchData];

    if (Array.isArray(originalList)) {
      const modifiedList = originalList.filter((item) => item !== value);
      this.searchService.changeSearchData({ ...this.searchData, [type]: modifiedList });
    }
  }

  /**
   * Beállítja a rendezési értéket
   * @param option a kiválasztott érték
   */
  selectOption(option: { label: string; value: string }) {
    this.selectedOption = option;
    this.isDropdownOpen = false;
    this.loadFilteredList();
  }

  /**
   * Sorrendbe rendezi a kiválasztott érték alapján a recepteket
   * @param receipts Receptek listája
   * @returns
   */
  sortReceipts(receipts: IReceipt[]): IReceipt[] {
    const sortedReceipts = (() => {
      switch (this.selectedOption.value) {
        case 'newest':
          return [...receipts].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
        case 'oldest':
          return [...receipts].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          );
        case 'popular':
          return [...receipts].sort((a, b) => b.likes - a.likes);
        default:
          return receipts;
      }
    })();

    return sortedReceipts;
  }

  /**
   * Elkészítési időhöz szükséges megjelenítő buborék pozícionálása
   * @param event
   */
  updateBubblePosition(event: Event) {
    const input = event.target as HTMLInputElement;
    this.bubblePosition =
      ((Number(input.value) - Number(input.min)) / (Number(input.max) - Number(input.min))) * 100 +
      '%';
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.screenWidth = window.innerWidth;
  }

  @HostListener('document:click', ['$event'])
  handleClick(event: MouseEvent) {
    const targetElement = event.target as HTMLElement;

    const isClickInsideDropdown =
      targetElement.closest('.custom-select-order') || targetElement.closest('.options');

    if (!isClickInsideDropdown) {
      this.isDropdownOpen = false;
    }
  }
}
