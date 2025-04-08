import { Component, EventEmitter, inject, input, OnInit, Output, signal } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { take } from 'rxjs';
import { emailValidator } from '../../../helpers/validators';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../shared/modal/modal.component';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../services/auth.service';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent, ForgotPasswordComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  /** Bejelentkezési modal nyitva van-e */
  isLoginModalOpen = input(false);
  isForgotPasswordModalOpen = signal(false);

  isModalOpen = signal(false);

  @Output() closeEvent = new EventEmitter<any>();

  logInForm = new FormGroup({
    email: new FormControl('', [Validators.required, emailValidator()]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  private authService = inject(AuthService);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    this.isModalOpen.set(this.isLoginModalOpen());
  }
  //TODO: elfelejtett jelszót csinálni
  /**
   * Bejelentkezés
   * @param formData a form
   */
  onSubmit(data: any): void {
    console.log(data);

    /*  const formData = this.logInForm.getRawValue(); */
    if (data) {
      this.authService
        .logIn(data.email, data.password)
        .pipe(take(1))
        .subscribe({
          next: (u) => {
            if (u) {
              this.toastr.success('Sikeres bejelentkezés!');
              this.logInForm.reset();
              this.closeEvent.emit();
            }
          },
          error: () => {
            this.toastr.error('Hiba történt a bejelentkezés során!');
          },
        });
    }
  }

  onForgotPasswordClick(): void {
    this.isForgotPasswordModalOpen.set(true);
    this.logInForm.reset();
    this.isModalOpen.set(false);
    /* this.closeModal(); */
  }

  closePasswordModal() {
    this.isForgotPasswordModalOpen.set(false);
  }

  closeModal() {
    if (this.isLoginModalOpen()) {
      this.closeEvent.emit();
    }
  }
}
