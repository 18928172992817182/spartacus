import { Injectable } from '@angular/core';

import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

import { AuthService, UserToken } from '../../auth/index';

import { CartActions } from '../store/actions/index';
import { CartSelectors } from '../store/selectors/index';
import { SaveForLaterDataService } from './save-for-later-data.service';
import { ANONYMOUS_USERID } from './cart-data.service';
import { StateWithCart } from '../store/cart-state';
import { Cart } from '../../model/cart.model';
import { OrderEntry } from '../../model/order.model';
import { UserService } from '../../user/facade/user.service';

@Injectable()
export class SaveForLaterService {
  private callback: Function;

  constructor(
    protected store: Store<StateWithCart>,
    protected saveForLaterData: SaveForLaterDataService,
    protected authService: AuthService,
    protected userService: UserService
  ) {
    this.init();
  }

  getSaveForLater(): Observable<Cart> {
    return this.store.pipe(select(CartSelectors.getSaveForLaterContent));
  }

  getEntries(): Observable<OrderEntry[]> {
    return this.store.pipe(select(CartSelectors.getSaveForLaterEntries));
  }

  getLoaded(): Observable<boolean> {
    return this.store.pipe(select(CartSelectors.getSaveForLaterLoaded));
  }

  protected init(): void {
    this.store
      .pipe(select(CartSelectors.getSaveForLaterContent))
      .subscribe(_cart => {
        //this.saveForLaterData.cart = cart;
        if (this.callback) {
          this.callback();
          this.callback = null;
        }
      });

    this.authService
      .getUserToken()
      .pipe(
        filter(userToken => this.saveForLaterData.userId !== userToken.userId)
      )
      .subscribe(userToken => {
        this.setUserId(userToken);
        this.userService.get().subscribe(user => {
          if (user.customerId) {
            this.saveForLaterData.customerId = user.customerId;
            this.load();
          }
        });
      });

    this.refresh();
  }

  protected setUserId(userToken: UserToken): void {
    if (Object.keys(userToken).length !== 0) {
      //this.saveForLaterData.userId = userToken.userId;
    } else {
      //this.saveForLaterData.userId = ANONYMOUS_USERID;
    }
  }

  protected load(): void {
    if (this.saveForLaterData.userId !== ANONYMOUS_USERID) {
      if (this.isCreated(this.saveForLaterData.cart)) {
        this.store.dispatch(
          new CartActions.LoadSaveForLater({
            userId: this.saveForLaterData.userId,
            cartId: 'selectivecart' + this.saveForLaterData.customerId,
          })
        );
      } else {
        this.store.dispatch(
          new CartActions.CreateSaveForLater({
            userId: this.saveForLaterData.userId,
            cartId: 'selectivecart' + this.saveForLaterData.customerId,
          })
        );
      }
    }
  }

  protected refresh(): void {
    this.store
      .pipe(select(CartSelectors.getSaveForLaterRefresh))
      .subscribe(refresh => {
        if (refresh) {
          this.store.dispatch(
            new CartActions.LoadSaveForLater({
              userId: this.saveForLaterData.userId,
              cartId: this.saveForLaterData.cartId,
            })
          );
        }
      });
  }

  loadDetails(): void {
    if (this.saveForLaterData.userId !== ANONYMOUS_USERID) {
      this.store.dispatch(
        new CartActions.CreateSaveForLater({
          userId: this.saveForLaterData.userId,
          cartId: 'selectivecart' + this.saveForLaterData.customerId,
        })
      );
    } else if (this.saveForLaterData.cartId) {
      this.store.dispatch(
        new CartActions.LoadSaveForLater({
          userId: this.saveForLaterData.userId,
          cartId: this.saveForLaterData.cartId,
        })
      );
    }
  }

  addEntry(productCode: string, quantity: number): void {
    if (!this.isCreated(this.saveForLaterData.cart)) {
      this.store.dispatch(
        new CartActions.CreateSaveForLater({
          userId: this.saveForLaterData.userId,
          cartId: 'selectivecart' + this.saveForLaterData.customerId,
        })
      );
      this.callback = function() {
        this.store.dispatch(
          new CartActions.CartAddEntry({
            userId: this.saveForLaterData.userId,
            cartId: this.saveForLaterData.cartId,
            productCode: productCode,
            quantity: quantity,
          })
        );
      };
    } else {
      this.store.dispatch(
        new CartActions.CartAddEntry({
          userId: this.saveForLaterData.userId,
          cartId: this.saveForLaterData.cartId,
          productCode: productCode,
          quantity: quantity,
        })
      );
    }
  }

  removeEntry(entry: OrderEntry): void {
    this.store.dispatch(
      new CartActions.CartRemoveEntry({
        userId: this.saveForLaterData.userId,
        cartId: this.saveForLaterData.cartId,
        entry: entry.entryNumber,
      })
    );
  }

  updateEntry(entryNumber: string, quantity: number): void {
    if (+quantity > 0) {
      this.store.dispatch(
        new CartActions.CartUpdateEntry({
          userId: this.saveForLaterData.userId,
          cartId: this.saveForLaterData.cartId,
          entry: entryNumber,
          qty: quantity,
        })
      );
    } else {
      this.store.dispatch(
        new CartActions.CartRemoveEntry({
          userId: this.saveForLaterData.userId,
          cartId: this.saveForLaterData.cartId,
          entry: entryNumber,
        })
      );
    }
  }

  getEntry(productCode: string): Observable<OrderEntry> {
    return this.store.pipe(
      select(CartSelectors.getCartEntrySelectorFactory(productCode))
    );
  }

  isCreated(cart: Cart): boolean {
    return cart && !!Object.keys(cart).length;
  }

  isEmpty(cart: Cart): boolean {
    return cart && !cart.totalItems;
  }
}
