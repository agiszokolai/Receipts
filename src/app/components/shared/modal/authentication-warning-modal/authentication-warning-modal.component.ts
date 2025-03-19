import { Component, EventEmitter, input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { LoginComponent } from '../../../user/login/login.component';
import { RegistrationComponent } from '../../../user/registration/registration.component';
import { ModalComponent } from '../modal.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-authentication-warning-modal',
  standalone: true,

  templateUrl: './authentication-warning-modal.component.html',
  styleUrl: './authentication-warning-modal.component.scss',
  imports: [LoginComponent, RegistrationComponent, ModalComponent, CommonModule],
})
export class AuthenticationWarningModalComponent implements OnChanges {
  isModalOpen = input(false);

  isLoginModalOpen = false;
  isRegistrationModalOpen = false;

  warningModalOpen = false;

  @Output() closeModal = new EventEmitter<void>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isModalOpen']) {
      this.warningModalOpen = this.isModalOpen();
    }
  }

  close() {
    this.warningModalOpen = false;
    this.closeModal.emit();
  }

  openLoginModal() {
    this.isLoginModalOpen = true;
    this.warningModalOpen = false;
  }

  openRegistrationModal() {
    this.isRegistrationModalOpen = true;
    this.warningModalOpen = false;
  }
}
