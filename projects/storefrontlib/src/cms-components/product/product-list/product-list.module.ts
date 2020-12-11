import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  CmsConfig,
  CmsProductListComponent,
  FeaturesConfigModule,
  I18nModule,
  provideDefaultConfig,
  UrlModule,
  ViewModes,
} from '@spartacus/core';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ViewConfig } from '../../../shared/config/view-config';
import { ViewConfigModule } from '../../../shared/config/view-config.module';
import {
  ItemCounterModule,
  ListNavigationModule,
  MediaModule,
  SpinnerModule,
  StarRatingModule,
} from '../../../shared/index';
import { AddToCartModule } from '../../cart/index';
import { IconModule } from '../../misc/icon/index';
import { defaultScrollConfig } from '../config/default-scroll-config';
import { ProductVariantsModule } from '../product-variants/product-variants.module';
import { ProductListComponent } from './container/product-list.component';
import { ProductScrollComponent } from './container/product-scroll/product-scroll.component';
import { ProductFacetNavigationComponent } from './product-facet-navigation/product-facet-navigation.component';
import { ProductGridItemComponent } from './product-grid-item/product-grid-item.component';
import { ProductListItemComponent } from './product-list-item/product-list-item.component';
import { ProductViewComponent } from './product-view/product-view.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MediaModule,
    AddToCartModule,
    ItemCounterModule,
    ListNavigationModule,
    UrlModule,
    I18nModule,
    StarRatingModule,
    IconModule,
    SpinnerModule,
    InfiniteScrollModule,
    ViewConfigModule,
    ProductVariantsModule,
    FeaturesConfigModule,
  ],
  providers: [
    provideDefaultConfig(<ViewConfig>defaultScrollConfig),
    provideDefaultConfig(<CmsConfig<CmsProductListComponent>>{
      cmsComponents: {
        CMSProductListComponent: {
          component: ProductListComponent,
          ghost: {
            isProductListing: true,
            pageSize: 3,
            viewMode: ViewModes.List,
          },
        },
        ProductGridComponent: {
          component: ProductListComponent,
          ghost: {
            isProductListing: true,
            pageSize: 9,
            viewMode: ViewModes.Grid,
          },
        },
        SearchResultsListComponent: {
          component: ProductListComponent,
          ghost: {
            pageSize: 3,
            viewMode: ViewModes.List,
          },
        },
      },
    }),
  ],
  declarations: [
    ProductListComponent,
    ProductListItemComponent,
    ProductGridItemComponent,
    ProductViewComponent,
    ProductScrollComponent,
  ],
  exports: [
    ProductListComponent,
    ProductListItemComponent,
    ProductGridItemComponent,
    ProductViewComponent,
    ProductScrollComponent,
  ],
  entryComponents: [ProductListComponent, ProductFacetNavigationComponent],
})
export class ProductListModule {}
