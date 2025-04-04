import { Component, EventEmitter, inject, input, OnDestroy, Output } from '@angular/core';
import { ModalComponent } from '../../../shared/modal/modal.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ISavedReceiptCollection, IUser } from '../../../../model/user';
import { IReceipt } from '../../../../model/receipt';
import { UserService } from '../../../../services/user.service';
import { ReplaySubject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { UserReceiptsService } from '../../../../services/user-receipts.service';

@Component({
  selector: 'app-save-recipe',
  standalone: true,
  imports: [ModalComponent, CommonModule, FormsModule],
  templateUrl: './save-recipe.component.html',
  styleUrl: './save-recipe.component.scss',
})
export class SaveRecipeComponent implements OnDestroy {
  isModalOpen = input(false);

  user = input.required<IUser>();
  recipe = input.required<IReceipt>();

  isDropdownOpen = false;

  @Output() closeEvent = new EventEmitter<any>();

  @Output() saveEvent = new EventEmitter<any>();

  saveOption: 'simple' | 'collection' = 'simple';

  selectedCollection: ISavedReceiptCollection | null = null;

  private readonly destroyed$ = new ReplaySubject<void>(1);
  private userService = inject(UserService);
  private userReceiptsService = inject(UserReceiptsService);
  private toastr = inject(ToastrService);

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  saveReceipt() {
    console.log(this.saveOption);

    if (this.saveOption === 'simple') {
      this.user()?.receipts.saved.push(this.recipe().id);
      this.userReceiptsService
        .addSavedReceipt(this.user().userId, this.recipe().id)
        .pipe(takeUntil(this.destroyed$))
        .subscribe({
          next: (userReceipts) => {
            const updatedUser = this.user();

            if (userReceipts) {
              updatedUser.receipts = userReceipts;
            }

            this.toastr.success('A recept mentése sikeresen megtörtént');
            this.saveEvent.emit(updatedUser);
          },
          error: (err) => {
            this.toastr.error('Hiba történt a recept emntése során');
            console.error('Hiba a mentés során:', err);
          },
        });
    } else if (this.saveOption === 'collection' && this.selectedCollection) {
      this.userReceiptsService
        .addSavedReceipt(this.user().userId, this.recipe().id, this.selectedCollection.id)
        .pipe(takeUntil(this.destroyed$))
        .subscribe({
          next: (userReceipts) => {
            const updatedUser = this.user();

            if (userReceipts) {
              updatedUser.receipts = userReceipts;
            }
            this.toastr.success('A recept mentése sikeresen megtörtént');

            this.saveEvent.emit(updatedUser);
          },
          error: (err) => {
            this.toastr.error('Hiba történt a recept emntése során');
            console.error('Hiba a gyűjteménybe mentés során:', err);
          },
        });
    }
    this.closeEvent.emit();
  }

  closeModal() {
    if (this.isModalOpen()) {
      console.log('close');

      this.closeEvent.emit();
    }
  }
}
