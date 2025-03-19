import { Component, EventEmitter, inject, input, Output } from '@angular/core';
import { ModalComponent } from '../../shared/modal/modal.component';
import { take } from 'rxjs';
import { UserService } from '../../../services/user.service';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { emailValidator, passwordConfirmValidator } from '../../../helpers/validators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [ModalComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss',
})
export class RegistrationComponent {
  isRegistrationModalOpen = input(false);

  @Output() closeEvent = new EventEmitter<any>();

  registrationForm = new FormGroup({
    email: new FormControl('', [Validators.required, emailValidator()]),
    username: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
    passwordConfirm: new FormControl('', [Validators.required, passwordConfirmValidator()]),
  });

  private userService = inject(UserService);
  private router = inject(Router);

  /**
   *  Reisztráció
   * @param formData a form
   */
  onSubmit() {
    const formData = this.registrationForm.getRawValue();

    this.userService
      .registration(formData.email!, formData.name!, formData.username!, formData.password!)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.closeModal();
          this.router.navigate(['/profil', formData.username]);
        },
        error: (error) => {
          console.log('Hiba történt:', error.message);
        },
      });
  }

  closeModal() {
    if (this.isRegistrationModalOpen()) {
      this.closeEvent.emit();
    }
  }
}
