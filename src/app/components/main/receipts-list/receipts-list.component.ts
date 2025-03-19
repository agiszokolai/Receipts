import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { IReceipt } from '../../../model/receipt';
import { ReplaySubject, take, takeUntil } from 'rxjs';
import { ReceiptsService } from '../../../services/receipts.service';
import { SearchService } from '../../../services/search.service';
import { CommonModule } from '@angular/common';
import { ReceiptCardComponent } from './receipt-card/receipt-card.component';
import { UserService } from '../../../services/user.service';
import { IUser } from '../../../model/user';
import { ReceiptListItemComponent } from './receipt-list-item/receipt-list-item.component';
import { FadeDirective } from '../../../directives/fade.directive';

@Component({
  selector: 'app-receipts-list',
  standalone: true,
  templateUrl: './receipts-list.component.html',
  styleUrl: './receipts-list.component.scss',
  imports: [CommonModule, ReceiptCardComponent, ReceiptListItemComponent, FadeDirective],
})
export class ReceiptsListComponent implements OnInit, OnDestroy {
  /**  Belépett felhasználó  */
  user = signal<IUser | null>(null);

  /** Receptek listája */
  receipts: IReceipt[] = [];

  /**
   * Szűrt receptek listája (keresés, kategória választás)
   */
  filteredList: IReceipt[] = [];

  /** Listák megjelenítésének típusa  */
  viewMode: 'grid' | 'list' = 'grid';

  /**  Nézet közötti átváltás  */
  fadeSwitchState = true;

  private readonly destroyed$ = new ReplaySubject<void>(1);

  private receiptsService = inject(ReceiptsService);
  private searchService = inject(SearchService);
  private userService = inject(UserService);

  ngOnInit(): void {
    this.userService.user$.pipe(takeUntil(this.destroyed$)).subscribe((u) => {
      this.user.set(u);
      console.log(this.user());

      this.getReceipts();
    });
    this.searchService.filteredList$.subscribe((list) => {
      this.filteredList = list;
    });
  }

  /**
   * Receptek lekérdezése
   */
  getReceipts(): void {
    this.receiptsService
      .getReceipts()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (r: IReceipt[]) => {
          console.log('receptek');

          this.receipts = r;
          this.searchService.setOriginalList(this.receipts);
        },
        error: (err) => {
          console.error('Error ', err);
        },
      });
  }

  /**
   * Ellenőrzi, hogy az aktuális receptet a bejelentkezett felhasználó mentette-e.
   *
   * @param {number} receiptId - Az ellenőrizendő recept azonosítója.
   * @returns {boolean} `true`, ha a recept mentve van, különben `false`.
   */
  isSavedByUser(receiptId: number): boolean {
    return this.user()?.receipts?.saved?.includes(receiptId) ?? false;
  }

  /**
   * Ellenőrzi, hogy az aktuális receptet a bejelentkezett felhasználó kedvelte-e.
   *
   * @param {number} receiptId - Az ellenőrizendő recept azonosítója.
   * @returns {boolean} `true`, ha a recept kedvelve van, különben `false`.
   */
  isLikedByUser(receiptId: number): boolean {
    return this.user()?.receipts?.liked?.includes(receiptId) ?? false;
  }

  /**
   * Kezeli egy recept mentett állapotának változását a felhasználónál.
   *
   * @param {{ receiptId: number; saved: boolean }} event - Az esemény objektum, amely tartalmazza a recept azonosítóját és a mentési állapotot.
   * @returns {void}
   */
  handleSavedChange(event: { receiptId: number; saved: boolean }): void {
    console.log(`Receipt ID: ${event.receiptId}, saved: ${event.saved}`);

    const currentUser = this.user();
    if (!currentUser) return;

    const updatedUser = {
      ...currentUser,
      receipts: {
        ...currentUser.receipts,
        saved: event.saved
          ? [...currentUser.receipts.saved, event.receiptId]
          : currentUser.receipts.saved.filter((id) => id !== event.receiptId),
      },
    };

    this.userService.updateUser(updatedUser).subscribe(() => {
      this.user.set(updatedUser);
    });
    console.log('mentettek:', this.user()?.receipts.saved);
  }

  /**
   * Kezeli egy recept kedvelt állapotának változását a felhasználónál.
   *
   * @param {{ receiptId: number; saved: boolean }} event - Az esemény objektum, amely tartalmazza a recept azonosítóját és a kedvelési állapotot.
   * @returns {void}
   */
  handleLikedChange(event: { receiptId: number; liked: boolean }): void {
    console.log(`Receipt ID: ${event.receiptId}, liked: ${event.liked}`);

    this.userService.user$.pipe(take(1)).subscribe((user) => {
      if (user) {
        const updatedUser = {
          ...user,
          receipts: {
            ...user.receipts,
            liked: event.liked
              ? [...user.receipts.liked, event.receiptId]
              : user.receipts.liked.filter((id) => id !== event.receiptId),
          },
        };

        this.userService.updateUser(updatedUser).subscribe(() => {
          this.user.set(updatedUser);
        });
      }
    });
  }

  /**
   * Nézet beállítása
   */
  toggleViewMode() {
    this.fadeSwitchState = false;

    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
    this.fadeSwitchState = true;
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
