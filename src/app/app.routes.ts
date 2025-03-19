import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'receptek',
    pathMatch: 'full',
    loadComponent: () =>
      import('./components/main/receipts-list/receipts-list.component').then(
        (m) => m.ReceiptsListComponent,
      ),
  },
  {
    path: 'recept/:name',
    loadComponent: () =>
      import('./components/main/receipts-list/receipt/receipt.component').then(
        (m) => m.ReceiptComponent,
      ),
  },
  {
    path: 'profil/:username',
    loadComponent: () =>
      import('./components/user/user-profile/user-profile.component').then(
        (u) => u.UserProfileComponent,
      ),
  },
  {
    path: '',
    redirectTo: 'receptek',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'receptek',
  },
];
