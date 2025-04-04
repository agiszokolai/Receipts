import { Component, inject, signal, input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { IReceipt } from '../../../model/receipt';
import { ISavedReceiptCollection, IUser } from '../../../model/user';
import { ReceiptsService } from '../../../services/receipts.service';
import { blankFood } from '../../../helpers/constants';
import { take } from 'rxjs';
import { SubMenuItem } from '../../../model/shared';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { generateSlug } from '../../../helpers/validators';
import { ToastrService } from 'ngx-toastr';
import { RecipeCreateComponent } from '../recipe-create/recipe-create.component';

@Component({
  selector: 'app-user-receipts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RecipeCreateComponent],
  templateUrl: './user-receipts.component.html',
})
export class UserReceiptsComponent implements OnInit, OnChanges {
  user = input.required<IUser>();

  isOwnPage = input.required<boolean>();

  isNewRecipe = input<boolean>();

  activeMenu = signal<string>('own');

  receiptList = signal<IReceipt[]>([]);

  collectionsList = signal<ISavedReceiptCollection[]>([]);

  savedViewMode = signal<'saved' | 'collections' | 'collection-contents'>('saved');

  isDropdownOpen = false;
  selectedMenuItem: SubMenuItem = new SubMenuItem('Saját receptek', 'own');

  /** Menük */
  readonly menuItems: SubMenuItem[] = [
    new SubMenuItem('Saját receptek', 'own'),
    new SubMenuItem('Kedvenc receptek', 'favorite'),
    new SubMenuItem('Mentett receptek', 'saved'),
  ];

  editModalOpen = false;
  editedRecipe: IReceipt | null = null;

  blankFood = blankFood;

  private receiptService = inject(ReceiptsService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    this.getReceiptsById(this.user().receipts.created);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && changes['user'].currentValue) {
      this.onMenuItemClick('own');
    }
  }

  getReceiptsById(receipts: number[]) {
    this.receiptService
      .getReceiptsByIds(receipts)
      .pipe(take(1))
      .subscribe({
        next: (r) => {
          this.receiptList.set(r);
        },
      });
  }

  showCollections() {
    this.savedViewMode.set('collections');
    this.collectionsList.set(this.user().receipts.collections!);
  }

  openCollection(collection: ISavedReceiptCollection) {
    this.getReceiptsById(this.user().receipts.collections![collection.id].receipts);
    this.savedViewMode.set('collection-contents');
    this.getReceiptsById(collection.receipts);
  }

  editReceipt(receipt: IReceipt) {
    this.receiptService
      .updateReceipt(receipt)
      .pipe(take(1))
      .subscribe({
        next: (updatedReceipt) => {
          if (!updatedReceipt) return;

          const updatedList = [...this.receiptList()];
          const index = updatedList.findIndex((r) => r.id === updatedReceipt.id);

          if (index !== -1) {
            updatedList[index] = { ...updatedReceipt };
            this.receiptList.set(updatedList);

            if (this.activeMenu() === 'own') {
              this.user().receipts.created = updatedList.map((r) => r.id);
            }
          }

          this.toastr.success('Recept sikeresen frissítve!');
          this.editModalOpen = false;
        },
        error: () => {
          this.toastr.error('Hiba történt a recept frissítésekor!');
        },
      });
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  onDropdownMenuItemClick(menuName: string): void {
    this.selectedMenuItem =
      this.menuItems.find((item) => item.name === menuName) || new SubMenuItem('', '');
    this.onMenuItemClick(menuName);

    this.isDropdownOpen = false;
  }

  /**
   * Menüválasztás
   * - Az aktuális menüpont alapján beállítja a megfelelő listát és keresési adatokat
   *
   * @param {string} item - A menüpont, amelyre kattintottak ('own', 'favorite', 'saved')
   */
  onMenuItemClick(item: string) {
    switch (item) {
      case 'own':
        this.activeMenu.set('own');
        this.getReceiptsById(this.user().receipts.created);
        break;
      case 'favorite':
        this.activeMenu.set('favorite');
        this.getReceiptsById(this.user().receipts.liked);
        break;

      case 'saved':
        this.activeMenu.set('saved');
        this.savedViewMode.set('saved');
        this.getReceiptsById(this.user().receipts.saved);
        break;
    }
  }

  /**
   * Navigálás egy adott receptre
   * - A recept `id` paraméterével átirányítja a felhasználót a megfelelő oldalra
   *
   * @param {IReceipt} receipt - A navigálandó recept objektuma
   */
  navigateToReceipt(receipt: IReceipt): void {
    this.router.navigate(['/recept', generateSlug(receipt.name)], {
      state: { id: receipt.id, direction: `/profil/${this.user()?.username}` },
    });
  }

  onNavigateBackSavedReceipts() {
    this.savedViewMode.set(
      this.savedViewMode() === 'collection-contents' ? 'collections' : 'saved',
    );
    if (this.savedViewMode() === 'saved') {
      this.onMenuItemClick('saved');
    }
  }
}
