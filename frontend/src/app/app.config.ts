import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import localeEsCo from '@angular/common/locales/es-CO';

import { routes } from './app.routes';
import { authInterceptor } from './features/auth/auth.interceptor';

// Español de Colombia: fechas ("viernes, 10 de octubre") y moneda ($ 45.000.000)
registerLocaleData(localeEsCo);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // HttpClient para llamar a la API; authInterceptor agrega el token a cada petición
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: LOCALE_ID, useValue: 'es-CO' },
  ]
};
