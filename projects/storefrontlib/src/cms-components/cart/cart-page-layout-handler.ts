import { Injectable } from '@angular/core';
import { CartService, SelectiveCartService } from '@spartacus/core';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PageLayoutHandler } from '../../cms-structure/page/page-layout/page-layout-handler';

@Injectable()
export class CartPageLayoutHandler implements PageLayoutHandler {
  constructor(
    private cartService: CartService,
    // private saveForLaterService: SaveForLaterService
    private selectiveCartService: SelectiveCartService
  ) {}

  handle(
    slots$: Observable<string[]>,
    pageTemplate?: string,
    section?: string
  ) {
    if (pageTemplate === 'CartPageTemplate' && !section) {
      return combineLatest([
        slots$,
        this.cartService.getActive(),
        // this.saveForLaterService.getSaveForLater(),
        this.selectiveCartService.getCart(),
      ]).pipe(
        map(([slots, cart, saveForLater]) => {
          //If cart is empty but save for later is not empty, show save for later list
          if (cart.totalItems || saveForLater.totalItems) {
            return slots.filter(slot => slot !== 'EmptyCartMiddleContent');
          } else if (!cart.totalItems && saveForLater.totalItems) {
            return slots.filter(slot => slot !== 'TopContent');
          } else {
            return slots.filter(
              slot => slot !== 'TopContent' && slot !== 'CenterRightContentSlot'
            );
          }
        })
      );
    }
    return slots$;
  }
}
