import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CmsConfig, provideDefaultConfig, UrlModule } from '@spartacus/core';
import {
  CarouselModule,
  KeyboardFocusModule,
  MediaModule,
} from '@spartacus/storefront';
import { ProductCarouselComponent } from './product-carousel.component';

@NgModule({
  imports: [
    CommonModule,
    CarouselModule,
    MediaModule,
    RouterModule,
    UrlModule,
    KeyboardFocusModule,
  ],
  providers: [
    provideDefaultConfig(<CmsConfig>{
      cmsComponents: {
        ProductCarouselComponent: {
          component: ProductCarouselComponent,
        },
      },
    }),
  ],
  declarations: [ProductCarouselComponent],
})
export class ProductCarouselModule {}
