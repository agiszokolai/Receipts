import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { map, ReplaySubject, switchMap, take, takeUntil } from 'rxjs';
import { ISavedReceiptCollection, IUser } from '../../../model/user';
import { ReceiptsService } from '../../../services/receipts.service';
import { IReceipt } from '../../../model/receipt';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SubMenuItem } from '../../../model/shared';
import { UserReceiptsComponent } from '../user-receipts/user-receipts.component';
import { UserDataComponent } from '../user-data/user-data.component';
import { SearchService } from '../../../services/search.service';
import { generateSlug } from '../../../helpers/validators';
import { ToastrService } from 'ngx-toastr';
import { RecipeCreateComponent } from '../recipe-create/recipe-create.component';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    UserReceiptsComponent,
    UserDataComponent,
    RecipeCreateComponent,
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
})
export class UserProfileComponent implements OnInit, OnDestroy {
  /** Felhasználói profil */
  user = signal<IUser | null>(null);

  /** Bejelentkezett felhasználó */
  activeUser = signal<IUser | null>(null);

  /** A profiloldali user receptjei */
  userReceipts = signal<IReceipt[]>([]);

  /** A profiloldali user gyűjteményei */
  userCollections = signal<ISavedReceiptCollection[]>([]);

  /** A profiloldali user kedvelt receptjei */
  userFavoriteReceipts = signal<IReceipt[]>([]);

  /** A profiloldali user által létrehozott receptek össz lájk száma */
  userReceiptsLikes = signal<number>(0);

  /** A belépett felhasználó saját profilja */
  customerOwnProfile = signal<boolean>(false);

  /** Kiválasztott gyűjtemény */
  clickedFolder = signal<number[] | null>(null);

  editedRecipt!: IReceipt | null;

  isDropdownOpen = false;
  selectedMenuItem: SubMenuItem = new SubMenuItem('Saját receptek', 'own');

  /** Menük */
  readonly menuItems: SubMenuItem[] = [
    new SubMenuItem('Saját receptek', 'own'),
    new SubMenuItem('Kedvenc receptek', 'favorite'),
    new SubMenuItem('Mentett receptek', 'saved'),
  ];

  /** Megjelenített receptek listája */
  menuList = signal<IReceipt[]>([]);

  /** Felhasználó mentett receptjei */
  userSavedReceipts = signal<IReceipt[]>([]);

  /** Aktív menü */
  activeMenu = signal<string>('own');

  private readonly destroyed$ = new ReplaySubject<void>(1);

  private userService = inject(UserService);
  private receiptService = inject(ReceiptsService);
  private searchService = inject(SearchService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  /**
   * Komponens inicializálása
   * - Lekéri az URL-ből az `id` paramétert
   * - Beállítja a belépett felhasználót
   * - Ha van `id` alapján user, betölti a felhasználói profilt és receptjeit
   */
  ngOnInit(): void {
    this.userService.user$.pipe(takeUntil(this.destroyed$)).subscribe((u) => {
      this.activeUser.set(u);
      this.getUserData();
    });

    this.searchService.filteredList$.subscribe((filteredList) => {
      this.menuList.set(filteredList);
    });
  }

  setEditedRecipt(recipe: IReceipt) {
    console.log('itt');

    this.editedRecipt = recipe;
  }

  getUserData(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const username = params.get('username');
          return this.userService.getUserByUsername(username!);
        }),
      )
      .subscribe({
        next: (user) => {
          if (user) {
            this.user.set(user);
            this.customerOwnProfile.set(this.activeUser()?.userId === user.userId);

            this.getUserProfileAndReceipts(user);
            this.getUserSavedReeipts();
            this.activeMenu.set('own');
            this.onMenuItemClick('own');
          } else {
            this.router.navigate(['/receptek']); // ha nincs felhasználó visszanavigál a receipts-list-re
          }
        },
        error: (err) => {
          console.error('Hiba történt a felhasználó betöltésekor', err);
          this.router.navigate(['/receptek']);
        },
      });
  }

  /**
   * Felhasználó létrehozott receptek lekérése
   * - Ha van létrehozott recept, lekéri azokat
   * - Összesíti a recepteken található lájkok számát
   * - Beállítja a felhasználó receptjeit és a lájkok összegét
   *
   * @param {IUser} user - A lekérdezett felhasználó objektuma
   */
  getUserProfileAndReceipts(user: IUser): void {
    if (!user) return;

    if (user.receipts.created && user.receipts.created.length > 0) {
      //Létrehozott receptek id-jai
      const createdReceiptsIds = user.receipts.created;

      //Lekérdezem a recepteket
      this.receiptService
        .getReceiptsByIds(createdReceiptsIds)
        .pipe(
          take(1),
          map((receipts) => {
            //az összes lájk a recepteken
            let totalLikes = 0;

            //végigmegyek a megkapott listán
            receipts.forEach((receipt) => {
              if (receipt.reviews) {
                //
                // reduce segítségével egy elemmé lehet alakítani a receptek értékeit,
                // likes-ban a  lájkok össesített értéke van az actualItemben az aktuális recept
                //
                totalLikes += receipt.reviews.reduce((likes, actualItem) => {
                  return likes + (actualItem.likes || 0);
                }, 0);
              }
            });

            this.userReceipts.set(receipts); // beállítom a felhaszáló létrehozott receptjeit
            this.userReceiptsLikes.set(totalLikes); //beállítom az összes lájkot a recepteken
          }),
        )
        .subscribe();
    } else {
      this.userReceipts.set([]);
      this.userReceiptsLikes.set(0);
    }

    if (user.receipts.collections) {
      this.userCollections.set(user.receipts.collections);
    }
  }

  /**
   * Navigálás egy adott receptre
   * - A recept `id` paraméterével átirányítja a felhasználót a megfelelő oldalra
   *
   * @param {IReceipt} receipt - A navigálandó recept objektuma
   */
  navigateToReceipt(receipt: IReceipt): void {
    this.router.navigate(['/recept', generateSlug(receipt.name)]);
  }

  /**
   * A profilon lévő felhasználó  mentett receptjeinek lekérése
   * - Lekéri a mentett recepteket az API-ból és beállítja őket
   */
  getUserSavedReeipts() {
    this.receiptService
      .getReceiptsByIds(this.user()!.receipts.saved)
      .pipe(take(1))
      .subscribe({
        next: (r) => {
          this.userSavedReceipts.set(r);
        },
      });
  }

  /**
   * Menüválasztás
   * - Az aktuális menüpont alapján beállítja a megfelelő listát és keresési adatokat
   *
   * @param {string} item - A menüpont, amelyre kattintottak ('own', 'favorite', 'saved')
   */
  onMenuItemClick(item: string) {
    switch (item) {
      case 'own':
        this.menuList.set(this.userReceipts());
        this.activeMenu.set('own');
        this.clickedFolder.set(null);
        this.searchService.setOriginalList(this.userReceipts());
        break;
      case 'favorite': {
        const user = this.user();
        if (user?.receipts.liked) {
          const likedReceiptsIds = user.receipts.liked;
          this.receiptService.getReceiptsByIds(likedReceiptsIds).subscribe({
            next: (receipts) => {
              this.menuList.set(receipts);
              this.searchService.setOriginalList(receipts);
            },
            error: (err) => {
              console.error('Error fetching liked receipts:', err);
            },
          });
        }
        this.clickedFolder.set(null);
        this.activeMenu.set('favorite');

        break;
      }
      case 'saved':
        /*  this.menuList.set(this.userCollections()); */
        this.menuList.set([]);
        this.activeMenu.set('saved');
        this.searchService.setOriginalList(this.userCollections());

        break;
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  onDropdownMenuItemClick(menuName: string): void {
    this.selectedMenuItem =
      this.menuItems.find((item) => item.name === menuName) || new SubMenuItem('', '');
    this.onMenuItemClick(menuName);

    this.isDropdownOpen = false; // Bezárás kattintás után
  }

  /**
   * Mappa (mappára kattintás)
   * - A kiválasztott mappa tartalmát lekérdezi és beállítja a menü listáját
   *
   * @param {ISavedReceiptCollection} folder - A kattintott mappa objektuma
   */
  onFolderClick(folder: ISavedReceiptCollection) {
    if (folder.receipts && folder.receipts.length > 0) {
      this.clickedFolder.set(folder.receipts);

      this.receiptService.getReceiptsByIds(folder.receipts).subscribe({
        next: (receipts) => {
          this.menuList.set(receipts);
          this.searchService.setOriginalList(receipts);
        },
        error: (err) => console.error('Error fetching folder receipts:', err),
      });
    } else {
      this.menuList.set([]);
    }
  }

  createReceipt(data: any): void {
    this.receiptService.createReceipt(data).subscribe({
      next: (createdReceipt) => {
        if (createdReceipt) {
          this.userReceipts.set([...this.userReceipts(), createdReceipt]);
        }
        this.onMenuItemClick('own');
        this.toastr.success('Recept sikeresen létrehozva');
      },
      error: (err) => {
        console.error('Hiba a recept létrehozásakor', err);
      },
    });
  }

  updateRecipe(data: any): void {
    console.log('recept:', data);
    this.receiptService.updateReceipt(data).subscribe({
      next: (updatedReceipt) => {
        const currentList = [...this.userReceipts()];

        // 🔹 Megkeressük a frissítendő recept indexét
        if (updatedReceipt) {
          const updatedIndex = currentList.findIndex((r) => r.id === updatedReceipt.id);

          if (updatedIndex !== -1) {
            // 🔹 Lecseréljük az adott receptet az új verzióra
            currentList[updatedIndex] = { ...updatedReceipt };

            // 🔹 Signal beállítása teljesen új tömbbel (hogy biztosan érzékelje a változást)
            this.userReceipts.set([...currentList]);
            this.onMenuItemClick('own');

            console.log('✅ Új receptlista:', this.userReceipts());
            this.toastr.success('Recept sikeresen frissítve!');
          }
        }
      },
      error: (err) => {
        console.error('Hiba a recept frissítésekor', err);
        this.toastr.error('Hiba történt a recept frissítésekor!');
      },
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
