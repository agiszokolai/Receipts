import { Component, EventEmitter, inject, input, OnInit, Output } from '@angular/core';
import { IReceipt } from '../../../../model/receipt';
import { CommonModule } from '@angular/common';
import { IUser } from '../../../../model/user';
import { Router } from '@angular/router';
import { generateSlug } from '../../../../helpers/validators';
import { AuthenticationWarningModalComponent } from '../../../shared/modal/authentication-warning-modal/authentication-warning-modal.component';
import { blankFood } from '../../../../helpers/constants';

@Component({
  selector: 'app-receipt-card',
  standalone: true,
  imports: [CommonModule, AuthenticationWarningModalComponent],
  templateUrl: './receipt-card.component.html',
})
export class ReceiptCardComponent implements OnInit {
  /* Aktuális recept */
  receipt = input.required<IReceipt>();

  /* Belépett felhasználó */
  user = input<IUser>();

  /* Kedvelve van-e a felhasználó által */
  likedByUser = input.required<boolean>();

  /* Mentve van-e a felhasználó által */
  saveddByUser = input.required<boolean>();

  /** Esemény, amely értesíti a szülő komponenst a kedvelési állapot változásáról */
  @Output() likedChange = new EventEmitter<{
    receiptId: number;
    liked: boolean;
  }>();

  /** Esemény, amely értesíti a szülő komponenst a mentési állapot változásáról */
  @Output() savedChange = new EventEmitter<{
    receiptId: number;
    saved: boolean;
  }>();

  isModalOpen = false;
  isLoginModalOpen = false;
  isRegistrationModalOpen = false;

  /** A kedvelés ikon hover állapota */
  isHeartHovered = false;

  /** A mentés ikon hover állapota */
  isBookMarkHovered = false;

  blankFood = blankFood;

  private router = inject(Router);

  ngOnInit(): void {
    this.receipt().imageUrl = this.receipt().imageUrl?.length ? this.receipt().imageUrl : blankFood;
  }
  /**
   * Beállítja a recept mentett állapotát és értesíti a szülő komponenst
   *
   * @param {IReceipt} receipt - Az aktuális recept
   * @param {boolean} saved - A mentési állapot (true = mentett, false = nem mentett)
   */
  onSavedClick(receipt: IReceipt, saved: boolean): void {
    if (!this.user()) {
      this.isModalOpen = true;
    }
    this.savedChange.emit({ receiptId: receipt.id, saved: saved });
  }

  /**
   * Beállítja a recept kedvelt állapotát és értesíti a szülő komponenst
   *
   * @param {IReceipt} receipt - Az aktuális recept
   * @param {boolean} liked - A kedvelési állapot (true = kedvelt, false = nem kedvelt)
   */
  onLikedClick(receipt: IReceipt, liked: boolean): void {
    if (!this.user()) {
      this.isModalOpen = true;
    }
    this.likedChange.emit({ receiptId: receipt.id, liked: liked });
  }

  /**
   * Átnavigál a recept oldalára
   */
  navigateToReceipt(): void {
    this.router.navigate(['/recept', generateSlug(this.receipt().name)], {
      state: { id: this.receipt().id, direction: `/receptek` },
    });
  }
}
