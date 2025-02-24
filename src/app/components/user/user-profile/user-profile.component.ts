import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable, of, single, switchMap, take } from 'rxjs';
import { SavedReceiptCollection, User } from '../../../model/user';
import { ReceiptsService } from '../../../services/receipts.service';
import { Receipt } from '../../../model/receipt';
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
import { CommonModule } from '@angular/common';
import { SubMenuItem } from '../../../model/shared';
import { UserReceiptsComponent } from '../user-receipts/user-receipts.component';
import { UserDataComponent } from '../user-data/user-data.component';
import { SearchService } from '../../../services/search.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    UserReceiptsComponent,
    UserDataComponent,
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
})
export class UserProfileComponent implements OnInit {
  testReceipts = computed(() => {
    const receipts = this._testReceipts();
    const searchedText = this.testService.searchedText();

    return;
  });

  testService = inject(SearchService);

  _testReceipts: any = signal([]);

  user = signal<User | null>(null);
  userReceipts = signal<Receipt[]>([]);
  userCollections = signal<SavedReceiptCollection[]>([]);
  userFavoriteReceipts = signal<Receipt[]>([]);
  userReceiptsLikes = signal<number>(0);
  //TODO: ha a saját oldala akkor látszódjanak a mezők
  customerOwnProfile = signal<boolean>(false);
  /*   isChangeData = signal<boolean>(false);
   */ clickedFolder = signal<number[] | null>(null);

  readonly menuItems: SubMenuItem[] = [
    new SubMenuItem('Saját receptek', 'own'),
    new SubMenuItem('Kedvenc receptek', 'favorite'),
    new SubMenuItem('Mentett receptek', 'saved'),
  ];

  menuList = signal<Receipt[]>([]);
  userSavedReceipts = signal<Receipt[]>([]);

  activeMenu = signal<string>('own');

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

  private userService = inject(UserService);
  private receiptService = inject(ReceiptsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const id = params['id'];
      console.log('id', id);

      if (id) {
        this.getUserProfileAndReceipts(id);
        this.getUserSavedReeipts();
      }
    });
    this.activeMenu.set('own');
    this.onMenuItemClick('own');
    console.log(this.user());
  }

  getUserProfileAndReceipts(userId: number): void {
    //Lekérdezem a megnyitott felhasználót id alapján
    this.userService
      .getUserById(userId)
      .pipe(
        switchMap((user) => {
          //kicserélem a visszaadott értékeket
          this.user.set(user);

          if (user?.createdReceiptsId && user.createdReceiptsId.length > 0) {
            //ha van user akkor a létrehozott receptek id-ját kimentem
            const createdReceiptsIds = user.createdReceiptsId;

            //lekérdezem a recepteket az id-k alapján
            return this.receiptService
              .getReceiptsByIds(createdReceiptsIds)
              .pipe(
                map((receipts) => ({ user, receipts })) //visszaadom a felhasználót és a receptjeit
              );
          }
          return of({ user, receipts: [] });
        }),
        map(({ user, receipts }) => {
          //az összes lájk a recepteken
          let totalLikes = 0;
          //végigmegyek a megkapott listán
          receipts.forEach((receipt) => {
            if (receipt.reviews) {
              /**
               * reduce segítségével egy elemmé lehet alakítani a receptek értékeit,
               * likes-ban a  lájkok össesített értéke van az actualItemben az aktuális recept
               */
              totalLikes += receipt.reviews.reduce((likes, actualItem) => {
                return likes + (actualItem.likes || 0);
              }, 0);
            }
          });

          this.userReceipts.set(receipts); // beállítom a felhaszáó létrehozott receptjeit
          this._testReceipts.set(receipts);
          this.userReceiptsLikes.set(totalLikes); //beállítom az összes lájkot a recepteken
          console.log(user);
          if (user.savedCollections) {
            this.userCollections.set(user.savedCollections);
          }

          //a belépett felhasználó-é e a megnyitott profil
          /* this.userService
            .getActiveUser()
            .pipe(take(1))
            .subscribe({
              next: (loggedInUser) => {
                //visszaadja a belépett user-t és ha van...
                if (loggedInUser?.userId === user.userId) {
                  this.customerOwnProfile.set(true);
                  this.userForm.patchValue({
                    email: user.email,
                    username: user.username,
                    name: user.name,
                    description: user.description,
                  });
                } else {
                  this.customerOwnProfile.set(false);
                }
              },
              error: (err) =>
                console.error(
                  'Hiba történt a bejelentkezett felhasználó lekérése közben:',
                  err
                ),
            }); */
          const activeUser = this.userService.user$.subscribe();
          console.log(activeUser);
        })
      )
      .subscribe();
  }

  navigateToReceipt(receipt: Receipt): void {
    this.router.navigate(['/receipt'], {
      queryParams: { id: receipt.id },
    });
  }

  getUserSavedReeipts() {
    this.receiptService
      .getReceiptsByIds(this.user()!.savedReceipts)
      .pipe(take(1))
      .subscribe({
        next: (r) => {
          this.userSavedReceipts.set(r);
        },
      });
  }

  onMenuItemClick(item: string) {
    switch (item) {
      case 'own':
        this.menuList.set(this.userReceipts());
        this.activeMenu.set('own');
        this.clickedFolder.set(null);
        break;
      case 'favorite':
        const user = this.user();
        if (user?.likedReceipts) {
          const likedReceiptsIds = user.likedReceipts;
          this.receiptService.getReceiptsByIds(likedReceiptsIds).subscribe({
            next: (receipts) => {
              this.menuList.set(receipts);
            },
            error: (err) => {
              console.error('Error fetching liked receipts:', err);
            },
          });
        }
        this.clickedFolder.set(null);
        this.activeMenu.set('favorite');

        break;
      case 'saved':
        /*  this.menuList.set(this.userCollections()); */
        this.menuList.set([]);
        this.activeMenu.set('saved');

        break;
    }
    console.log(this.menuList());
  }

  onFolderClick(folder: SavedReceiptCollection) {
    if (folder.receipts && folder.receipts.length > 0) {
      this.clickedFolder.set(folder.receipts);

      this.receiptService.getReceiptsByIds(folder.receipts).subscribe({
        next: (receipts) => {
          this.menuList.set(receipts);
        },
        error: (err) => console.error('Error fetching folder receipts:', err),
      });
    } else {
      this.menuList.set([]);
    }
  }

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
