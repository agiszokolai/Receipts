import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ReceiptsService } from '../../../../services/receipts.service';
import { of, ReplaySubject, switchMap, take, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { IUser } from '../../../../model/user';
import { UserService } from '../../../../services/user.service';
import { CommonModule } from '@angular/common';
import { IReceipt, IReview } from '../../../../model/receipt';
import { FadeDirective } from '../../../../directives/fade.directive';
import { formatDateWithMoment } from '../../../../helpers/helpers';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { ModalComponent } from '../../../shared/modal/modal.component';
import { LoginComponent } from '../../../user/login/login.component';
import { RegistrationComponent } from '../../../user/registration/registration.component';
import { AuthenticationWarningModalComponent } from '../../../shared/modal/authentication-warning-modal/authentication-warning-modal.component';
import { blankFood } from '../../../../helpers/constants';

@Component({
  selector: 'app-receipt',
  standalone: true,
  imports: [
    CommonModule,
    FadeDirective,
    ToastrModule,
    ModalComponent,
    LoginComponent,
    RegistrationComponent,
    AuthenticationWarningModalComponent,
  ],
  templateUrl: './receipt.component.html',
  styleUrls: ['./receipt.component.scss'],
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

  /** Az elérhető csillagok száma */
  stars: number[] = [1, 2, 3, 4, 5];

  private readonly destroyed$ = new ReplaySubject<void>(1);

  private receiptService = inject(ReceiptsService);
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    let receiptName = '';
    this.route.paramMap.pipe(take(1)).subscribe((params) => {
      receiptName = params.get('name') ?? '';
    });
    // Először lekérjük a bejelentkezett felhasználót
    this.userService.user$.pipe(takeUntil(this.destroyed$)).subscribe({
      next: (u) => {
        this.user.set(u);
        if (receiptName) {
          this.getReceiptData(receiptName);
        }

        if (!u) {
          this.isLiked.set(false);
          this.isSaved.set(false);
          this.rating = 0;
        }
      },
    });
  }

  /**
   * Lekérjük a recept adatait név alapján
   * @param name A recept neve (slug)
   */
  getReceiptData(name: string): void {
    this.receiptService
      .getReceiptByName(name)
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
            console.log(receipt);

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
    const userReceipts: { liked?: number[]; saved?: number[] } = this.user()?.receipts ?? {};
    this.isLiked.set(userReceipts.liked?.includes(this.receipt.id) ?? false);
    this.isSaved.set(userReceipts.saved?.includes(this.receipt.id) ?? false);
    this.rating =
      this.receipt.reviews?.find((review) => review.userId === this.user()!.userId)?.rating ?? 0;
  }

  /**
   * Kedvelés változtatása
   * @param liked Ha true, akkor kedveli a receptet, ha false, akkor leveszi a kedvencből
   */
  onLikedClick(liked: boolean): void {
    if (!this.user()) {
      this.isModalOpen.set(true);

      return;
    }
    if (liked) {
      if (this.user()) {
        this.userService.addLikedReceipt(Number(this.user()!.userId), this.receipt.id).subscribe({
          next: () => {
            this.isLiked.set(true);
          },
          error: (err) => {
            console.error('Hiba történt a recept kedvelése közben:', err);
          },
        });
      }
    } else {
      this.userService.removeLikedReceipt(Number(this.user()!.userId), this.receipt.id).subscribe({
        next: () => {
          this.isLiked.set(false);
        },
        error: (err) => {
          console.error('Hiba történt a recept kedvelésének eltávolítása közben:', err);
        },
      });
    }
  }

  /**
   * Mentés változtatása
   * @param saved Ha true, akkor elmenti a receptet, ha false, akkor leveszi a mentettből
   */
  onSavedClick(saved: boolean): void {
    if (!this.user()) {
      this.isModalOpen.set(true);

      return;
    }
    if (saved) {
      this.userService.addSavedReceipt(Number(this.user()!.userId), this.receipt.id).subscribe({
        next: () => {
          this.isSaved.set(true);
        },
        error: (err) => {
          console.error('Hiba történt a recept mentése közben:', err);
        },
      });
    } else {
      this.userService.removeSavedReceipt(Number(this.user()!.userId), this.receipt.id).subscribe({
        next: () => {
          this.isSaved.set(false);
        },
        error: (err) => {
          console.error('Hiba történt a recept mentett állapotának eltávolítása közben:', err);
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
    if (this.rating !== star) {
      this.isRatingChanged = true;
    }

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
    if (this.receipt.reviews) {
      const totalRatings = this.receipt.reviews.reduce((acc, review) => acc + review.rating, 0);
      this.receipt.averageRating = totalRatings / this.receipt.reviews.length;
    }
  }

  navigateToCreator() {
    this.router.navigate(['/profil', this.creator.username]);
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
