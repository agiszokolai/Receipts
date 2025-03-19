import { Component, EventEmitter, inject, input, Output } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { take } from 'rxjs';
import { emailValidator } from '../../../helpers/validators';
import { UserService } from '../../../services/user.service';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../shared/modal/modal.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  /** Bejelentkezési modal nyitva van-e */
  isLoginModalOpen = input(false);

  @Output() closeEvent = new EventEmitter<any>();

  logInForm = new FormGroup({
    email: new FormControl('', [Validators.required, emailValidator()]),
    password: new FormControl('', Validators.required),
  });

  private userService = inject(UserService);
  private toastr = inject(ToastrService);
  //TODO: elfelejtett jelszót csinálni
  /**
   * Bejelentkezés
   * @param formData a form
   */
  onSubmit() {
    const formData = this.logInForm.getRawValue();
    if (formData) {
      this.userService
        .logIn(formData.email!, formData.password!)
        .pipe(take(1))
        .subscribe({
          next: (u) => {
            if (u) {
              console.log('Sikeres bejelentkezés:', u);
              this.logInForm.reset();
              this.closeEvent.emit();
            }
          },
          error: (error) => {
            this.toastr.error('Hiba történt a bejelentkezés során!');
            console.error('Hiba történt:', error.message);
          },
        });
    }
  }

  closeModal() {
    if (this.isLoginModalOpen()) {
      this.closeEvent.emit();
    }
  }
}
