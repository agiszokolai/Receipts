import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'receipts-list',
    pathMatch: 'full',
    loadComponent: () =>
      import('./components/main/receipts-list/receipts-list.component').then(
        (m) => m.ReceiptsListComponent
      ),
  },
  {
    path: 'receipt',
    loadComponent: () =>
      import('./components/main/receipts-list/receipt/receipt.component').then(
        (m) => m.ReceiptComponent
      ),
  },
  {
    path: 'user',
    loadComponent: () =>
      import('./components/user/user-profile/user-profile.component').then(
        (u) => u.UserProfileComponent
      ),
  },
  {
    path: '',
    redirectTo: 'receipts-list',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'receipts-list',
  },
];
