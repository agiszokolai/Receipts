import {
  AfterViewInit,
  Component,
  HostListener,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { Receipt } from '../../../model/receipt';
import { ReplaySubject, take, takeUntil } from 'rxjs';
import { ReceiptsService } from '../../../services/receipts.service';
import { SearchService } from '../../../services/search.service';
import { CommonModule } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';
import * as bootstrap from 'bootstrap';
import { ReceiptCardComponent } from './receipt-card/receipt-card.component';
import { UserService } from '../../../services/user.service';
import { User } from '../../../model/user';
import { AppModule } from '../../../app.module';
import { ReceiptListItemComponent } from './receipt-list-item/receipt-list-item.component';
import { FadeSwitchDirective } from '../../../directives/fade-switch.directive';

@Component({
  selector: 'app-receipts-list',
  standalone: true,
  templateUrl: './receipts-list.component.html',
  styleUrl: './receipts-list.component.scss',
  imports: [
    CommonModule,
    ReceiptCardComponent,
    ReceiptListItemComponent,
    FadeSwitchDirective,
  ],

  /*   animations: [
    trigger('fadeSwitch', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95)' }),
        animate(
          '300ms ease-in-out',
          style({ opacity: 1, transform: 'scale(1)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '300ms ease-in-out',
          style({ opacity: 0, transform: 'scale(0.95)' })
        ),
      ]),
    ]),
  ], */
})
export class ReceiptsListComponent implements OnInit {
  receipts: Receipt[] = [];
  filteredList: Receipt[] = [];

  viewMode: 'grid' | 'list' = 'grid';
  fadeSwitchState = true;

  user = signal<User | null>(null);

  private readonly destroyed$ = new ReplaySubject<void>(1);
  private receiptsService = inject(ReceiptsService);
  private searchService = inject(SearchService);
  private userService = inject(UserService);

  ngOnInit(): void {
    this.getUser();
    this.getReceipts();
    this.searchService.filteredList$.subscribe((list) => {
      this.filteredList = list;
    });
  }

  getUser(): void {
    this.userService
      .getUserById(1)
      .pipe(take(1))
      .subscribe({
        next: (u: User) => {
          this.user.set(u);
        },
      });
  }

  getReceipts(): void {
    this.receiptsService
      .getReceipts()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (r: Receipt[]) => {
          this.receipts = r;
          this.searchService.setOriginalList(this.receipts);
        },
        error: (err) => {
          console.error('Error ', err);
        },
      });
  }

  //TODO: megcsinálni hogyha nézetváltás történik ne tűnj9n el az új kedvelés vagy mentés
  toggleViewMode() {
    this.fadeSwitchState = false; // Először elindítjuk a kilépő animációt

    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
    this.fadeSwitchState = true; // Új nézet betöltésekor aktiváljuk a belépő animációt
  }
}
