import { provideHttpClient } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { environment } from '../environments/environment';
import { ReceiptsMockService } from './services/receipts-mock.service';
import { ReceiptsService } from './services/receipts.service';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { UserService } from './services/user.service';
import { UserMockService } from './services/user-mock.service';

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
    { provide: LocationStrategy, useClass: PathLocationStrategy },
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled' })
    ),
    provideAnimations(),
  ],
};
