import {
  Component,
  EventEmitter,
  inject,
  input,
  OnChanges,
  OnInit,
  Output,
  signal,
  SimpleChanges,
} from '@angular/core';
import { IUser } from '../../../model/user';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ModalComponent } from '../../shared/modal/modal.component';
import { emailValidator, passwordConfirmValidator } from '../../../helpers/validators';
import { blankUser } from '../../../helpers/constants';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { RecipeCreateComponent } from '../recipe-create/recipe-create.component';

@Component({
  selector: 'app-user-data',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ModalComponent,
    ToastrModule,
    RecipeCreateComponent,
  ],
  templateUrl: './user-data.component.html',
})
export class UserDataComponent implements OnInit, OnChanges {
  blankUser = blankUser;
  /** A profil oldalon lévő felhasználó */
  user = input.required<IUser>();

  /** A felhasználó receptjeinek összes lájkja */
  userReceiptsLikes = input<number>();

  /** A felhasználó saját profilja-e */
  customerOwnProfile = input<boolean>();

  @Output() createEvent = new EventEmitter<any>();

  isChangeData = signal<boolean>(false);
  isCreateReceipt = signal<boolean>(false);

  /** Felhasználó adatai űrlap */
  userForm = new FormGroup({
    email: new FormControl('', emailValidator()),
    username: new FormControl(''),
    name: new FormControl(''),
    description: new FormControl(''),
  });

  /** Jelszó űrlap */
  passwordForm = new FormGroup({
    password: new FormControl('', Validators.required),
    passwordConfirm: new FormControl('', [Validators.required, passwordConfirmValidator()]),
  });

  private toastr = inject(ToastrService);

  ngOnInit(): void {
    if (this.customerOwnProfile() && this.user()) {
      this.userForm.patchValue({
        email: this.user().email,
        username: this.user().username,
        name: this.user().name,
        description: this.user().description,
      });
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user'] && this.user && this.customerOwnProfile()) {
      this.userForm.patchValue({
        email: this.user().email,
        username: this.user().username,
        name: this.user().name,
        description: this.user().description,
      });
    }
  }
}
