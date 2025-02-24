import { Component, inject, OnInit, signal } from '@angular/core';
import { ReceiptsService } from '../../../../services/receipts.service';
import { Receipt } from '../../../../model/receipt';
import { take } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { User } from '../../../../model/user';
import { UserService } from '../../../../services/user.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-receipt',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './receipt.component.html',
  styleUrl: './receipt.component.scss',
})
export class ReceiptComponent implements OnInit {
  receipt!: Receipt;
  creator!: User;

  user = signal<User | null>(null);
  isLiked = signal(false);
  isSaved = signal(false);
  isHoveredBookMark = signal(false);
  isHoveredHeart = signal(false);

  private receiptService = inject(ReceiptsService);
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const receiptId = params['id'];
      if (receiptId) {
        this.getReceiptById(receiptId);
      }
    });
    this.getUser();

    /* this.getReceipt(); */
  }

  /*  getReceipt(): void {
    this.receiptService
      .getReceipts()
      .pipe(take(1))
      .subscribe({
        next: (r: Receipt[]) => {
          this.receipt = r[0];
          console.log(this.receipt);
        },
        error: (err) => {
          console.error('Error fetching receipt:', err);
        },
      });
  } */

  getReceiptById(id: number): void {
    this.receiptService
      .getReceiptById(id)
      .pipe(take(1))
      .subscribe({
        next: (receipt: Receipt | null) => {
          if (receipt) {
            this.receipt = receipt;
            this.getReceiptCreator(receipt.createdById);
          }
        },
        error: (err) => {
          console.error('Error:', err);
        },
      });
  }

  getReceiptCreator(id: number): void {
    this.userService
      .getUserById(id)
      .pipe(take(1))
      .subscribe({
        next: (u: User) => {
          this.creator = u;
        },
      });
  }

  getUser(): void {
    this.userService
      .getUserById(1)
      .pipe(take(1))
      .subscribe({
        next: (u: User) => {
          this.user.set(u);
          this.isLikedByUser();
          this.isSavedByUser();
        },
      });
  }

  isLikedByUser(): void {
    this.isLiked.set(
      this.user()?.likedReceipts?.includes(this.receipt.id) ?? false
    );
  }

  setReceiptToLiked(liked: boolean): void {
    if (liked) {
      this.userService.addLikedReceipt(this.receipt.id).subscribe({
        next: (r) => {
          this.isLiked.set(true);
        },
        error: (err) => {
          console.log('error');
        },
      });
    } else {
      this.userService.removeLikedReceipt(this.receipt.id).subscribe({
        next: (r) => {
          this.isLiked.set(false);
        },
      });
    }
  }

  isSavedByUser(): void {
    this.isSaved.set(
      this.user()?.savedReceipts?.includes(this.receipt.id) ?? false
    );
  }

  setReceiptToSaved(saved: boolean): void {
    if (saved) {
      this.userService.addSavedReceipt(this.receipt.id).subscribe({
        next: (r) => {
          this.isSaved.set(true);
        },
        error: (err) => {
          console.log('error');
        },
      });
    } else {
      this.userService.removeSavedReceipt(this.receipt.id).subscribe({
        next: (r) => {
          this.isSaved.set(false);
        },
      });
    }
  }
}
