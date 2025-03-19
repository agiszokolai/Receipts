import {
  Component,
  EventEmitter,
  inject,
  OnChanges,
  Output,
  SimpleChanges,
  signal,
  input,
} from '@angular/core';
import { IReceipt } from '../../../model/receipt';
import { ISavedReceiptCollection, IUser } from '../../../model/user';
import { ReceiptsService } from '../../../services/receipts.service';
import { blankFood } from '../../../helpers/constants';
import { RecipeCreateComponent } from '../recipe-create/recipe-create.component';

@Component({
  selector: 'app-user-receipts',
  standalone: true,
  templateUrl: './user-receipts.component.html',
  styleUrl: './user-receipts.component.scss',
  imports: [RecipeCreateComponent],
})
export class UserReceiptsComponent implements OnChanges {
  activeMenu = input<string>('');
  menuList = input<IReceipt[]>([]);
  userSavedReceipts = input<IReceipt[]>([]);
  userCollections = input<ISavedReceiptCollection[]>([]);
  clickedFolder = input<number[] | null>(null);
  user = input.required<IUser>();
  isOwnPage = input.required<boolean>();

  @Output() folderClicked = new EventEmitter<ISavedReceiptCollection>();
  @Output() clickedFolderChange = new EventEmitter<null>();
  @Output() navigateToReceipt = new EventEmitter<IReceipt>();
  @Output() editReceipt = new EventEmitter<IReceipt>();

  // Lokális változók Signal API-val
  selectedFolder = signal<number[] | null>(null);

  /**oldal a mentett recepteknél */
  page = signal<number>(0);
  list = signal<IReceipt[]>([]);

  blankFood = blankFood;

  private receiptService = inject(ReceiptsService);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['menuList'] && changes['menuList'].currentValue) {
      this.list.set([...changes['menuList'].currentValue]);
    }

    if (changes['clickedFolder'] && changes['clickedFolder'].currentValue) {
      this.selectedFolder.set(changes['clickedFolder'].currentValue);
    }

    if (changes['activeMenu']) {
      this.page.set(0);
    }
  }

  onFolderClick(folder: ISavedReceiptCollection) {
    if (folder.receipts && folder.receipts.length > 0) {
      this.selectedFolder.set(folder.receipts);
      this.folderClicked.emit(folder);

      this.receiptService.getReceiptsByIds(folder.receipts).subscribe({
        next: (receipts) => {
          this.list.set([...receipts]); // Signal frissítés listába
        },
        error: (err) => console.error('Error fetching folder receipts:', err),
      });
    } else {
      this.list.set([]); // Üres lista, ha nincs recept
    }
  }
}
