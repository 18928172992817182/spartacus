import { ModuleWithProviders, NgModule } from '@angular/core';
import { PageMetaResolver } from '../cms/page/page-meta.resolver';
import { CartDataService } from './facade/cart-data.service';
import { CartService } from './facade/index';
import { CartPageMetaResolver } from './services/cart-page-meta.resolver';
import { CartStoreModule } from './store/cart-store.module';
import { MultiCartStoreModule } from './store/multi-cart-store.module';
import { LowLevelCartService } from './facade/low-level-cart.service';

@NgModule({
  imports: [CartStoreModule, MultiCartStoreModule],
})
export class CartModule {
  static forRoot(): ModuleWithProviders<CartModule> {
    return {
      ngModule: CartModule,
      providers: [
        CartDataService,
        CartService,
        LowLevelCartService,
        {
          provide: PageMetaResolver,
          useExisting: CartPageMetaResolver,
          multi: true,
        },
      ],
    };
  }
}
