import { Component, input, signal } from '@angular/core';
import { passwordForm, User, userProfileForm } from '../../../model/user';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ModalComponent } from '../../shared/modal/modal.component';

@Component({
  selector: 'app-user-data',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ModalComponent],
  templateUrl: './user-data.component.html',
  styleUrl: './user-data.component.scss',
})
export class UserDataComponent {
  user = input<User | null>();

  userReceiptsLikes = input<number>();
  customerOwnProfile = input<boolean>();

  isChangeData = signal<boolean>(false);
  isCreateReceipt = signal<boolean>(false);

  userForm = new FormGroup({
    email: new FormControl(''),
    username: new FormControl(''),
    name: new FormControl(''),
    description: new FormControl(''),
  });

  passwordForm = new FormGroup({
    password: new FormControl('', Validators.required),
    passwordConfirm: new FormControl('', [
      Validators.required,
      this.passwordConfirmValidator(),
    ]),
  });

  passwordConfirmValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) return null;
      const password = control.parent.get('password')?.value;
      const passwordConfirm = control.value;

      return password !== passwordConfirm ? { passwordConfirm: true } : null;
    };
  }

  emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const emailRegEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!control.value) {
        return null;
      }
      return emailRegEx.test(control.value) ? null : { invalidEmail: true };
    };
  }
}
