import { Component, EventEmitter, inject, input, Output } from '@angular/core';
import { ModalComponent } from '../../shared/modal/modal.component';
import { take } from 'rxjs';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { emailValidator, passwordConfirmValidator } from '../../../helpers/validators';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [ModalComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './registration.component.html',
})
export class RegistrationComponent {
  isRegistrationModalOpen = input(false);

  @Output() closeEvent = new EventEmitter<any>();

  registrationForm = new FormGroup({
    email: new FormControl('', [Validators.required, emailValidator()]),
    username: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    password: new FormControl('', [Validators.required]),
    passwordConfirm: new FormControl('', [Validators.required, passwordConfirmValidator()]),
  });

  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  /**
   *  Reisztráció
   * @param formData a form
   */
  onSubmit(data: any) {
    /* const formData = this.registrationForm.getRawValue(); */
    if (this.registrationForm.valid) {
      this.authService
        .registration(data.email!, data.name!, data.username!, data.password!)
        .pipe(take(1))
        .subscribe({
          next: () => {
            //TODO: regisztráció után bejelentkeztetni a felhasználót
            this.closeModal();
            this.toastr.success('Sikeres regisztráció!');
            this.router.navigate(['/profil', data.username]);
          },
          error: (error) => {
            this.toastr.warning('Hiba történt a regisztráció során');
            console.log('Hiba történt:', error.message);
          },
        });
    }
  }

  closeModal() {
    if (this.isRegistrationModalOpen()) {
      this.closeEvent.emit();
    }
  }
}
