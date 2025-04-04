import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ReceiptsService } from '../../../../services/receipts.service';
import { Observable, of, ReplaySubject, switchMap, take, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { IUser } from '../../../../model/user';
import { UserService } from '../../../../services/user.service';
import { CommonModule } from '@angular/common';
import { IReceipt, IReview } from '../../../../model/receipt';
import { FadeDirective } from '../../../../directives/fade.directive';
import { formatDateWithMoment } from '../../../../helpers/helpers';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { AuthenticationWarningModalComponent } from '../../../shared/modal/authentication-warning-modal/authentication-warning-modal.component';
import { blankFood } from '../../../../helpers/constants';
import { SearchService } from '../../../../services/search.service';
import { SaveRecipeComponent } from '../save-recipe/save-recipe.component';
import { UserReceiptsService } from '../../../../services/user-receipts.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-receipt',
  standalone: true,
  imports: [
    CommonModule,
    FadeDirective,
    ToastrModule,
    AuthenticationWarningModalComponent,
    SaveRecipeComponent,
  ],
  templateUrl: './receipt.component.html',
})
export class ReceiptComponent implements OnInit, OnDestroy {
  /** Recept adatai */
  receipt!: IReceipt;

  /** Létrehozó adatai */
  creator!: IUser;

  /** Belépett felhasználó adatai */
  user = signal<IUser | null>(null);

  /** Kedvelve van-e a felhasználó által */
  isLiked = signal(false);

  /** A recept mentett állapota */
  isSaved = signal(false);
  isModalOpen = signal(false);
  isSaveModalOpen = signal(false);
  isLoginModalOpen = signal(false);
  isRegistrationModalOpen = signal(false);

  blankFood = blankFood;

  /** A kedvelés ikon hover állapota */
  isHeartHovered = false;

  /** A mentés ikon hover állapota */
  isBookMarkHovered = false;

  /** Az értékelés csillagok száma (0-5) */
  rating = 0;

  isRatingChanged = false;

  hoverIndex = 0;

  likes = 0;

  receiptId = 0;
  filterdReceipts$!: Observable<IReceipt[]>;

  /** Az elérhető csillagok száma */
  stars: number[] = [1, 2, 3, 4, 5];

  private readonly destroyed$ = new ReplaySubject<void>(1);

  private userReceiptService = inject(UserReceiptsService);
  private receiptService = inject(ReceiptsService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private searchService = inject(SearchService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    this.receiptId = history.state.id;
    this.filterdReceipts$ = this.searchService.filteredList$;

    this.authService.user$.pipe(takeUntil(this.destroyed$)).subscribe({
      next: (u) => {
        this.user.set(u);

        if (this.receiptId) {
          this.getReceiptData(this.receiptId);
        } else {
          this.router.navigate(['receptek']);
        }

        if (!u) {
          this.isLiked.set(false);
          this.isSaved.set(false);
          this.rating = 0;
        }
      },
    });

    this.router.events.subscribe(() => {
      const newId = history.state.id;
      if (newId && newId !== this.receiptId) {
        this.receiptId = newId;
        this.getReceiptData(this.receiptId); // Új adatok betöltése
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  handleSaveEvent(updatedUser: IUser) {
    this.isSaveModalOpen.set(false);
    this.user.set(updatedUser);
    this.getReceiptStateForUser();
    // Itt frissítheted a szülő komponens állapotát a frissített adatokkal
  }

  /**
   * Lekérjük a recept adatait név alapján
   * @param name A recept neve (slug)
   */
  getReceiptData(id: number): void {
    this.receiptService
      .getReceiptById(id)
      .pipe(
        switchMap((receipt) => {
          if (receipt) {
            receipt.imageUrl = receipt.imageUrl?.length ? receipt.imageUrl : blankFood;
            this.receipt = receipt; // Beállítjuk a receptet
            const date = formatDateWithMoment(receipt.createdAt, {
              formats: ['YYYY-MM-DD HH:mm:ss'],
              useFormat: 'YYYY. MM. DD.',
            });

            this.receipt.createdAt = date;
            /*  this.rating = receipt.averageRating ?? 0; */

            /*   this.rating =
              receipt.reviews?.find((review) => review.userId === this.user()?.userId)?.rating ?? 0;
            console.log(this.rating); */
            /* const userReview = receipt?.reviews?.find(
              (review) => this.user()?.userId === review.userId,
            );
            if (userReview) {
              this.rating = userReview.rating; // Frissítjük az értékelést
            } else {
              this.rating = 0; // Ha nincs értékelés, alapértelmezetten 0
            } */
            if (this.user()) {
              this.getReceiptStateForUser();
            }
            return this.userService.getUserById(receipt.createdById); // Lekérjük a recept szerzőjét
          }
          return of(null);
        }),
        take(1),
      )
      .subscribe({
        next: (creator) => {
          if (creator) {
            this.creator = creator; // Beállítjuk a recept szerzőjét
          }
        },
        error: (err) => {
          console.error('Hiba történt a recept vagy a szerző betöltése közben:', err);
        },
      });
  }

  /**
   * Ellenőrzi, hogy a felhasználó kedveli-e vagy mentette-e a receptet és mennyire értékelte
   */
  getReceiptStateForUser(): void {
    this.isLiked.set(this.user()?.receipts?.liked?.includes(this.receipt.id) ?? false);
    this.isSaved.set(
      (this.user()?.receipts?.saved?.includes(this.receipt.id) ||
        this.user()?.receipts?.collections?.some((collection) =>
          collection.receipts.includes(this.receipt.id),
        )) ??
        false,
    );

    this.rating =
      this.receipt.reviews?.find((review) => review.userId === this.user()!.userId)?.rating ?? 0;
  }

  /**
   * Recept állapotának megváloztatása, kedvelte-e vagy lájkolta-e a felhasználó
   * @param action kedvelés vagy mentés
   * @param add be vagy kikedvelte, mentette vagy kivette-e a mentések közül
   * @returns
   */
  updateUserReceipt(action: 'like' | 'save', add: boolean): void {
    if (!this.user()) {
      this.isModalOpen.set(true);
      return;
    }
    const userId = this.user()!.userId;
    const receiptId = this.receipt.id;
    if (action === 'save') {
      if (add) {
        this.isSaveModalOpen.set(true);
      } else {
        this.userReceiptService
          .removeSavedReceipt(userId, receiptId)
          .pipe(take(1))
          .subscribe({
            next: (updatedUser) => {
              if (updatedUser) {
                this.isSaved.set(false);
                this.authService.updateUser(updatedUser);
                this.toastr.success('Sikeresen kikerült a recept a mentettek közül');
              }
            },
            error: () => {
              console.error('Hiba történt a recept állapotának megváltoztatása közben:');
            },
          });
      }
    } else {
      // Ha kedvelés történik, akkor a service hívás folytatódik

      const serviceCall = add
        ? this.userReceiptService.addLikedReceipt(userId, receiptId)
        : this.userReceiptService.removeLikedReceipt(userId, receiptId);

      serviceCall.pipe(take(1)).subscribe({
        next: (updatedUser) => {
          if (updatedUser) {
            this.isLiked.set(add);
            this.authService.updateUser(updatedUser);
          }
        },
        error: (err) => {
          console.error('Hiba történt a recept állapotának megváltoztatása közben:', err);
        },
      });
    }
  }

  /**
   * Az értékelés beállítása
   * @param star Az értékelés csillagjainak száma
   */
  setRating(star: number): void {
    if (!this.user()) {
      this.isModalOpen.set(true);

      return;
    }

    // Ha a rating változik, akkor meg kell jeleníteni a mentés gombot
    this.isRatingChanged = this.rating !== star;
    this.rating = star;
  }

  /**
   * Új értékelés hozzáadása a recepthez
   * @param review Az új értékelés adatai
   */
  addReview(review: IReview): void {
    this.receiptService.addReview(review, this.receipt.id).subscribe({
      next: (recipe) => {
        if (recipe) {
          this.receipt = recipe;
          this.updateAverageRating();
        }
      },
      error: (err) => {
        console.error('Hiba történt az értékelés hozzáadása közben:', err);
      },
    });
  }

  /**
   * Az értékelés frissítése
   * @param review A frissített értékelés adatai
   */
  updateReview(review: IReview): void {
    this.receiptService.updateReview(review, this.receipt.id).subscribe({
      next: (recipe) => {
        if (recipe) {
          this.receipt = recipe;
          this.updateAverageRating();
        }
      },
      error: (err) => {
        console.error('Hiba történt az értékelés frissítése közben:', err);
      },
    });
  }

  saveRating(): void {
    const user = this.user();
    if (!user) {
      console.error('Felhasználó nincs bejelentkezve!');
      return;
    }

    const existingReview = this.receipt.reviews?.find((review) => review.userId === user.userId);

    if (existingReview) {
      // Ha már van értékelés, frissítjük azt
      existingReview.rating = this.rating;
      this.updateReview(existingReview);
    } else {
      // Ha nincs értékelés, újat adunk hozzá
      const newReview: IReview = {
        id: this.receipt.reviews?.length ? this.receipt.reviews.length + 1 : 1,
        userId: user.userId,
        username: user.username,
        likes: 0,
        rating: this.rating,
        comment: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.addReview(newReview);
    }

    // Mentés után elrejtjük a mentés gombot
    this.isRatingChanged = false;
  }

  /**
   * Az átlagos értékelés frissítése
   */
  updateAverageRating(): void {
    const reviews = this.receipt.reviews ?? [];
    this.receipt.averageRating =
      reviews.length > 0
        ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
        : 0;
  }

  navigateToCreator() {
    this.router.navigate(['/profil', this.creator.username]);
  }

  navigateBack() {
    this.router.navigate([history.state.direction]);
  }
}
