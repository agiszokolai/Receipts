import { Component, inject, input, OnInit, signal } from '@angular/core';
import { Receipt } from '../../../../model/receipt';
import { CommonModule } from '@angular/common';
import { User } from '../../../../model/user';
import { UserService } from '../../../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-receipt-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './receipt-card.component.html',
  styleUrl: './receipt-card.component.scss',
})
export class ReceiptCardComponent implements OnInit {
  receipt = input.required<Receipt>();
  user = input<User>();

  isLiked = signal(false);
  isSaved = signal(false);
  isHoveredBookMark = signal(false);
  isHoveredHeart = signal(false);

  private userService = inject(UserService);
  private router = inject(Router);

  ngOnInit(): void {
    this.isLikedByUser();
    this.isSavedByUser();
  }

  isLikedByUser(): void {
    this.isLiked.set(
      this.user()?.likedReceipts?.includes(this.receipt().id) ?? false
    );
  }

  setReceiptToLiked(liked: boolean): void {
    if (liked) {
      this.userService.addLikedReceipt(this.receipt().id).subscribe({
        next: (r) => {
          this.isLiked.set(true);
        },
        error: (err) => {
          console.log('error');
        },
      });
    } else {
      this.userService.removeLikedReceipt(this.receipt().id).subscribe({
        next: (r) => {
          this.isLiked.set(false);
        },
      });
    }
  }

  isSavedByUser(): void {
    this.isSaved.set(
      this.user()?.savedReceipts?.includes(this.receipt().id) ?? false
    );
  }

  setReceiptToSaved(saved: boolean): void {
    if (saved) {
      this.userService.addSavedReceipt(this.receipt().id).subscribe({
        next: (r) => {
          this.isSaved.set(true);
        },
        error: (err) => {
          console.log('error');
        },
      });
    } else {
      this.userService.removeSavedReceipt(this.receipt().id).subscribe({
        next: (r) => {
          this.isSaved.set(false);
        },
      });
    }
  }

  navigateToReceipt(): void {
    this.router.navigate(['/receipt'], {
      queryParams: { id: this.receipt().id },
    });
  }
}
