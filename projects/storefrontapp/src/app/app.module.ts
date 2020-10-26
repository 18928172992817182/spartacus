import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeJa from '@angular/common/locales/ja';
import localeZh from '@angular/common/locales/zh';
import { NgModule } from '@angular/core';
import {
  BrowserModule,
  BrowserTransferStateModule,
} from '@angular/platform-browser';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { translationChunksConfig, translations } from '@spartacus/assets';
import { ConfigModule, TestConfigModule } from '@spartacus/core';
import {
  JsonLdBuilderModule,
  StorefrontComponent,
} from '@spartacus/storefront';
import { b2bFeature } from '../environments/b2b/b2b.feature';
import { b2cFeature } from '../environments/b2c/b2c.feature';
import { cdcFeature } from '../environments/cdc/cdc.feature';
import { cdsFeature } from '../environments/cds/cds.feature';
import { environment } from '../environments/environment';
import { TestOutletModule } from '../test-outlets/test-outlet.module';

registerLocaleData(localeDe);
registerLocaleData(localeJa);
registerLocaleData(localeZh);

const devImports = [];
if (!environment.production) {
  devImports.push(StoreDevtoolsModule.instrument());
}

let additionalImports = [];

if (environment.cds) {
  additionalImports = [...additionalImports, ...cdsFeature.imports];
}

if (environment.b2b) {
  additionalImports = [...additionalImports, ...b2bFeature.imports];
} else {
  additionalImports = [...additionalImports, ...b2cFeature.imports];
}

if (environment.cdc) {
  additionalImports = [...additionalImports, ...cdcFeature.imports];
}

@NgModule({
  imports: [
    BrowserModule.withServerTransition({ appId: 'spartacus-app' }),
    BrowserTransferStateModule,
    JsonLdBuilderModule,

    ConfigModule.withConfig({
      backend: {
        occ: {
          baseUrl: environment.occBaseUrl,
          prefix: environment.occApiPrefix,
        },
      },

      // custom routing configuration for e2e testing
      routing: {
        routes: {
          product: {
            paths: ['product/:productCode/:name', 'product/:productCode'],
          },
        },
      },

      // we bring in static translations to be up and running soon right away
      i18n: {
        resources: translations,
        chunks: translationChunksConfig,
        fallbackLang: 'en',
      },

      features: {
        level: '2.1',
      },
    }),
    ...additionalImports,
    TestOutletModule, // custom usages of cxOutletRef only for e2e testing
    TestConfigModule.forRoot({ cookie: 'cxConfigE2E' }), // Injects config dynamically from e2e tests. Should be imported after other config modules.
    // *Auth demo - Resource Owner Password Flow
    // *Add `refresh_token` in backoffice OAuth client
    // ConfigModule.withConfig({
    //   authentication: {
    //     client_id: 'client4kyma',
    //     client_secret: 'secret',
    //     OAuthLibConfig: {
    //       responseType: 'id_token',
    //       scope: 'openid',
    //       customTokenParameters: ['token_type', 'id_token'],
    //     },
    //   },
    // }),
    // *Auth demo - Implicit Flow
    // *Add `implicit` in backoffice OAuth client
    // *Set redirect url in the backoffice OAuth client (check if that could be dynamic and support every redirect link)
    // ConfigModule.withConfig({
    //   authentication: {
    //     client_id: 'client4kyma',
    //     client_secret: 'secret',
    //     OAuthLibConfig: {
    //       responseType: 'token',
    //     },
    //   },
    // }),
    // *Auth demo - Authorization Code
    // *Add `authorization_code` in backoffice OAuth client
    // *Set redirect url in the backoffice OAuth client (check if that could be dynamic and support every redirect link)
    // ConfigModule.withConfig({
    //   authentication: {
    //     client_id: 'client4kyma',
    //     client_secret: 'secret',
    //     OAuthLibConfig: {
    //       responseType: 'code',
    //     },
    //   },
    // }),
    // *Auth demo - external IdP
    ConfigModule.withConfig({
      authentication: {
        client_id: '9l0A897QpniDYiUYzZ2NH5YCVumQRiQG',
        client_secret:
          'PxWIyyDR3FMx_-fn6n5BjpaBr9_KL2EUWoVQ7iCD9GDkNy-lJPdyCake7mnu_hMw',
        baseUrl: 'https://divante-spartacus.eu.auth0.com',
        OAuthLibConfig: {
          responseType: 'token',
        },
      },
    }),
    ...devImports,
  ],

  bootstrap: [StorefrontComponent],
})
export class AppModule {}
