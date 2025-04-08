import { Component, inject, OnInit } from '@angular/core';
import { blankFood, blankUser, foodLanding } from '../../helpers/constants';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { take } from 'rxjs';
import { IUser } from '../../model/user';
import { ReceiptsService } from '../../services/receipts.service';
import { IReceipt } from '../../model/receipt';
import { generateSlug } from '../../helpers/validators';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent implements OnInit {
  foodImg = foodLanding;
  userImg = blankUser;
  blankFoodImg = blankFood;
  emmaImg = '../../assets/images/users/emma-brown.jpg';
  liaImg = '../../assets/images/users/kiss-anna.jpg';
  johnImg = '../../assets/images/users/john-smith.jpg';

  users: IUser[] = [];
  topReceipts: IReceipt[] = [];
  newRceipts: IReceipt[] = [];
  currentYear = new Date().getFullYear();
  private router = inject(Router);
  private userService = inject(UserService);
  private receiptsService = inject(ReceiptsService);

  ngOnInit(): void {
    this.getTopUsers();
    this.getTopReceipts();
    this.getNewReceipts();
  }

  getTopUsers(): void {
    this.userService
      .getTopThreeUsers()
      .pipe(take(1))
      .subscribe({
        next: (users) => {
          this.users = users;
        },
      });
  }

  getTopReceipts(): void {
    this.receiptsService
      .getTopReceipts()
      .pipe(take(1))
      .subscribe({
        next: (receipts) => {
          for (const receipt of receipts) {
            if (receipt.imageUrl === '') {
              receipt.imageUrl = this.blankFoodImg;
            }
          }
          this.topReceipts = receipts;
        },
      });
  }
  getNewReceipts(): void {
    this.receiptsService
      .getTopReceipts()
      .pipe(take(1))
      .subscribe({
        next: (receipts) => {
          for (const receipt of receipts) {
            if (receipt.imageUrl === '') {
              receipt.imageUrl = this.blankFoodImg;
            }
          }
          this.newRceipts = receipts;
        },
      });
  }

  navigateToReceipts(): void {
    this.router.navigate(['/receptek']);
  }

  navigateToReceipt(receipt: IReceipt): void {
    this.router.navigate(['/recept', generateSlug(receipt.name)], {
      state: { id: receipt.id, direction: `/` },
    });
  }

  navigateToUser(user: IUser): void {
    this.router.navigate(['/profil', user.username]);
  }

  navigateWithSort(sortType: string) {
    this.router.navigate(['/receptek'], {
      state: { sort: sortType },
    });
  }
}
