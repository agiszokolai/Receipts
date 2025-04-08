import { Component, EventEmitter, inject, input, OnInit, Output } from '@angular/core';
import { ModalComponent } from '../../shared/modal/modal.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { emailValidator, passwordConfirmValidator } from '../../../helpers/validators';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { LOGIN_DATA } from '../../../mocks/mock-user-data';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
  imports: [ModalComponent, ReactiveFormsModule, CommonModule],
})
export class ForgotPasswordComponent implements OnInit {
  isForgotPasswordModalOpen = input(false);

  @Output() closeEvent = new EventEmitter<any>();

  forgotPasswordForm = new FormGroup({
    confirmEmail: new FormControl('', [Validators.required, emailValidator()]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    passwordConfirm: new FormControl('', [Validators.required, passwordConfirmValidator()]),
  });

  private authService = inject(AuthService);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    console.log('init', LOGIN_DATA);
  }
  onSubmit(data: any): void {
    if (this.forgotPasswordForm.valid) {
      this.authService.setNewPassword(data.confirmEmail, data.newPassword).subscribe({
        next: (u) => {
          if (u) {
            this.toastr.success('Sikeres jelszó beállítás!');
            this.closeEvent.emit();
            this.forgotPasswordForm.reset();
          }
        },
        error: () => {
          this.toastr.error('Hiba történt a jelszó beállítása során!');
        },
      });
    }
  }

  closeModal() {
    if (this.isForgotPasswordModalOpen()) {
      this.closeEvent.emit();
    }
  }
}
