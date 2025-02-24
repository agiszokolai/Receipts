import {
  Component,
  EventEmitter,
  inject,
  Input,
  input,
  OnChanges,
  Output,
  SimpleChanges,
  signal,
} from '@angular/core';
import { Receipt } from '../../../model/receipt';
import { SavedReceiptCollection, User } from '../../../model/user';
import { ReceiptsService } from '../../../services/receipts.service';

@Component({
  selector: 'app-user-receipts',
  standalone: true,
  templateUrl: './user-receipts.component.html',
  styleUrl: './user-receipts.component.scss',
})
export class UserReceiptsComponent implements OnChanges {
  @Input() activeMenu!: string;
  @Input() menuList: Receipt[] = [];
  @Input() userSavedReceipts: Receipt[] = [];
  @Input() userCollections: SavedReceiptCollection[] = [];
  @Input() clickedFolder: number[] | null = null;

  @Output() folderClicked = new EventEmitter<SavedReceiptCollection>();
  @Output() clickedFolderChange = new EventEmitter<null>();
  @Output() navigateToReceipt = new EventEmitter<Receipt>();

  private receiptService = inject(ReceiptsService);

  // Lokális változók Signal API-val
  selectedFolder = signal<number[] | null>(null);
  page = signal<number>(0);
  list = signal<Receipt[]>([]);

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

  onFolderClick(folder: SavedReceiptCollection) {
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
