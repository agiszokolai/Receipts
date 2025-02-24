import { FormControl, FormGroup } from '@angular/forms';

export interface User {
  userId?: string;
  name?: string;
  username: string;
  email: string;
  password: string;
  description?: string;
  profilePictureUrl?: string;
  /*  saved?: number; */
  savedReceipts: number[];
  savedCollections?: SavedReceiptCollection[];
  /* liked?: number; */
  likedReceipts: number[];
  /*  loggedIn?: boolean; */
  /* created?: number; */
  createdReceiptsId?: number[];
  /* likes?: number; */
}

export interface logIn {
  email: string;
  password: string;
}
export interface UserRegistration {
  email: string;
  password: string;
}

export interface SavedReceiptCollection {
  id: string;
  name: string;
  receipts: number[];
}

export type userProfileForm = FormGroup<{
  email: FormControl<string | null>;
  username: FormControl<string | null>;
  name: FormControl<string | null>;
  description: FormControl<string | null>;
}>;

export type passwordForm = FormGroup<{
  password: FormControl<string | null>;
  passwordConfirm: FormControl<string | null>;
}>;

/* userForm = new FormGroup({
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
 */
