import { ApplicationConfig } from '@angular/core';
import { environment } from '../environments/environment';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { ReceiptsMockService } from './services/receipts-mock.service';
import { ReceiptsService } from './services/receipts.service';
import { UserMockService } from './services/user-mock.service';
import { UserService } from './services/user.service';
import { provideToastr } from 'ngx-toastr';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    ...(environment.mock
      ? [
          {
            provide: ReceiptsService,
            useClass: ReceiptsMockService,
          },

          {
            provide: UserService,
            useClass: UserMockService,
          },
        ]
      : []),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })),
    provideAnimations(),
    provideToastr({
      positionClass: 'toast-bottom-right',
      progressBar: true,
      progressAnimation: 'increasing',
      preventDuplicates: true,
      timeOut: 2000,
    }),
  ],
};
