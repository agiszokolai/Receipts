import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ReceiptsListComponent } from './components/main/receipts-list/receipts-list.component';
import { ReceiptComponent } from './components/main/receipts-list/receipt/receipt.component';
import { UserProfileComponent } from './components/user/user-profile/user-profile.component';
import { UserReceiptsComponent } from './components/user/user-receipts/user-receipts.component';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/shared/navbar/navbar.component';
import { ReceiptCardComponent } from './components/main/receipts-list/receipt-card/receipt-card.component';
import { ReceiptListItemComponent } from './components/main/receipts-list/receipt-list-item/receipt-list-item.component';
import { ModalComponent } from './components/shared/modal/modal.component';
import { UserDataComponent } from './components/user/user-data/user-data.component';
@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    CommonModule,
    AppComponent,
    ReceiptComponent,
    ReceiptsListComponent,
    NavbarComponent,
    ReceiptCardComponent,
    ReceiptListItemComponent,
    UserProfileComponent,
    UserReceiptsComponent,
    ModalComponent,
    UserDataComponent,
  ],
  providers: [],
})
export class AppModule {}
