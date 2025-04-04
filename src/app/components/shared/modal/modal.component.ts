import { CommonModule } from '@angular/common';
import { Component, EventEmitter, input, Output, TemplateRef } from '@angular/core';

import { IlogIn, IUserRegistration } from '../../../model/user';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
})
export class ModalComponent {
  /**  Látható-e a modal */
  isModalVisible = input<boolean>(false);

  /**  Mérete: small,medium,large */
  size = input<string>('');

  /**  Fejlécben megjelenő cím */
  header = input<string>();

  formGroup = input<FormGroup>();

  /**  A submit gombon megjelenő szöveg */
  footerButtonLabel = input('');

  /**  Látszódik-e a mégse gomb */
  isFooterCancelVisible = input(false);

  formTemplate = input<TemplateRef<any>>();

  /** Esemény, amely értesíti a szülő komponenst a modal bezárásáról*/
  @Output() closeEvent = new EventEmitter<any>();

  @Output() submitEvent = new EventEmitter<IlogIn | IUserRegistration>();

  onSubmit() {
    if (this.formGroup() && this.formGroup()?.valid) {
      console.log(this.formGroup()?.value);
      this.submitEvent.emit(this.formGroup()?.value);
    }
  }

  onCloseModalClick() {
    this.closeEvent.emit();
  }
}
