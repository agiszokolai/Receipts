import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { map, ReplaySubject, switchMap, take, takeUntil } from 'rxjs';
import { IUser } from '../../../model/user';
import { ReceiptsService } from '../../../services/receipts.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserReceiptsComponent } from '../user-receipts/user-receipts.component';
import { UserDataComponent } from '../user-data/user-data.component';
import { SearchService } from '../../../services/search.service';
import { ToastrService } from 'ngx-toastr';

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
})
export class UserProfileComponent implements OnInit, OnDestroy {
  /** Felhasználói profil */
  userProfile = signal<IUser | null>(null);

  /** Bejelentkezett felhasználó */
  activeUser = signal<IUser | null>(null);

  /** A profiloldali user által létrehozott receptek össz lájk száma */
  userReceiptsLikes = signal<number>(0);

  /** A belépett felhasználó saját profilja */
  customerOwnProfile = signal<boolean>(false);

  private readonly destroyed$ = new ReplaySubject<void>(1);

  private userService = inject(UserService);
  private receiptService = inject(ReceiptsService);
  private searchService = inject(SearchService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    this.userService.user$.pipe(takeUntil(this.destroyed$)).subscribe((u) => {
      this.activeUser.set(u);
      this.getUserData();
    });
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
            this.userProfile.set(user);

            this.customerOwnProfile.set(this.activeUser()?.userId === user.userId);

            this.getUserProfileAndReceipts(user);
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
      //Lekérdezem a létrehozott recepteket
      this.receiptService
        .getReceiptsByIds(user.receipts.created)
        .pipe(
          take(1),
          map((receipts) => {
            //az összes lájk a recepteken
            let totalLikes = 0;

            //végigmegyek a megkapott listán és összeadom a lájkokat
            receipts.forEach((receipt) => {
              if (receipt) {
                totalLikes += receipt.likes || 0;
              }
            });

            this.userReceiptsLikes.set(totalLikes);
          }),
        )
        .subscribe();
    } else {
      this.userReceiptsLikes.set(0);
    }
  }

  createReceipt(data: any): void {
    this.receiptService.createReceipt(data, this.userProfile()!).subscribe({
      next: (updatedUser) => {
        if (updatedUser) {
          this.userProfile.set(updatedUser);
          this.toastr.success('Recept sikeresen létrehozva');
        }
      },
      error: () => {
        this.toastr.error('Hiba történt a recept létrehozásakor!');
      },
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
