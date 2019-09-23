import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable, from, of } from 'rxjs';
import { catchError, map, mergeMap, switchMap, exhaustMap } from 'rxjs/operators';
import { Cart } from '../../../model/cart.model';
import { SiteContextActions } from '../../../site-context/store/actions/index';
import { makeErrorSerializable } from '../../../util/serialization-utils';
import { CartConnector } from '../../connectors/cart/cart.connector';
import { CartDataService } from '../../facade/cart-data.service';
import { CartActions } from '../actions/index';
import { CheckoutActions } from '../../../checkout/store/actions/index';

@Injectable()
export class CartEffects {
  // TODO: remove when removing cart store module
  @Effect()
  loadCart2$: Observable<CartActions.LoadMultiCart> = this.actions$.pipe(
    ofType(CartActions.LOAD_CART),
    map(
      (action: CartActions.LoadCart) =>
        new CartActions.LoadMultiCart(action.payload)
    )
  );

  // TODO: change to listen on LoadMultiCart action, remove old actions usage
  @Effect()
  loadCart$: Observable<
    | CartActions.LoadCartFail
    | CartActions.LoadMultiCartFail
    | CartActions.LoadCartSuccess
    | CartActions.LoadMultiCartSuccess
    | CartActions.ClearCart
    | CartActions.ClearMultiCart
    | CartActions.RemoveCart
  > = this.actions$.pipe(
    ofType(CartActions.LOAD_CART),
    map((action: CartActions.LoadCart) => action.payload),
    mergeMap(payload => {
      // TODO: get rid of cartData
      const loadCartParams = {
        userId: (payload && payload.userId) || this.cartData.userId,
        cartId: (payload && payload.cartId) || this.cartData.cartId,
      };

      if (this.isMissingData(loadCartParams)) {
        return from([
          new CartActions.LoadCartFail({}),
          new CartActions.LoadMultiCartFail({ cartId: loadCartParams.cartId }),
        ]);
      }
      return this.cartConnector
        .load(loadCartParams.userId, loadCartParams.cartId)
        .pipe(
          mergeMap((cart: Cart) => {
            if (loadCartParams.cartId === 'current' && cart) {
              return [
                new CartActions.LoadCartSuccess(cart),
                new CartActions.LoadMultiCartSuccess({
                  cart,
                  userId: loadCartParams.userId,
                  extraData: payload.extraData,
                }),
                new CartActions.RemoveCart('current'),
              ];
            } else if (cart) {
              return [
                new CartActions.LoadCartSuccess(cart),
                new CartActions.LoadMultiCartSuccess({
                  cart,
                  userId: loadCartParams.userId,
                  extraData: payload.extraData,
                }),
              ];
            }
            return [
              new CartActions.LoadCartFail({}),
              new CartActions.LoadMultiCartFail({
                cartId: loadCartParams.cartId,
              }),
            ];
          }),
          catchError(error => {
            if (error && error.error && error.error.errors) {
              const cartNotFoundErrors = error.error.errors.filter(
                err => err.reason === 'notFound' || 'UnknownResourceError'
              );
              if (cartNotFoundErrors.length > 0) {
                return from([
                  new CartActions.ClearCart(),
                  new CartActions.ClearMultiCart({
                    cartId: loadCartParams.cartId,
                  }),
                ]);
              }
            }
            return from([
              new CartActions.LoadCartFail(makeErrorSerializable(error)),
              new CartActions.LoadMultiCartFail({
                cartId: loadCartParams.cartId,
                error: makeErrorSerializable(error),
              }),
            ]);
          })
        );
    })
  );

  // TODO: remove when removing cart store module
  @Effect()
  createCart2$: Observable<CartActions.CreateMultiCart> = this.actions$.pipe(
    ofType(CartActions.CREATE_CART),
    map(
      (action: CartActions.CreateCart) =>
        new CartActions.CreateMultiCart(action.payload)
    )
  );

  @Effect()
  setFreshCart$ = this.actions$.pipe(
    ofType(CartActions.SET_FRESH_CART_ID),
    map(() => {
      return new CartActions.ResetFreshCart();
    })
  );

  // TODO: change to listen on CreateMultiCart action, remove old actions usage
  @Effect()
  createCart$: Observable<
    | CartActions.MergeCartSuccess
    | CartActions.MergeMultiCartSuccess
    | CartActions.CreateCartSuccess
    | CartActions.CreateMultiCartSuccess
    | CartActions.CreateCartFail
    | CartActions.CreateMultiCartFail
    | CartActions.SetFreshCart
  > = this.actions$.pipe(
    ofType(CartActions.CREATE_CART),
    map((action: CartActions.CreateCart) => action.payload),
    mergeMap(payload => {
      return this.cartConnector
        .create(payload.userId, payload.oldCartId, payload.toMergeCartGuid)
        .pipe(
          switchMap((cart: Cart) => {
            if (payload.oldCartId) {
              return [
                new CartActions.CreateCartSuccess(cart),
                new CartActions.CreateMultiCartSuccess({
                  cart,
                  userId: payload.userId,
                  extraData: payload.extraData,
                }),
                new CartActions.SetFreshCart(cart),
                new CartActions.MergeCartSuccess({
                  userId: payload.userId,
                  cartId: cart.code,
                }),
                new CartActions.MergeMultiCartSuccess({
                  userId: payload.userId,
                  cartId: cart.code,
                  oldCartId: payload.oldCartId,
                }),
              ];
            }
            return [
              new CartActions.CreateCartSuccess(cart),
              new CartActions.CreateMultiCartSuccess({
                cart,
                userId: payload.userId,
                extraData: payload.extraData,
              }),
              new CartActions.SetFreshCart(cart),
            ];
          }),
          catchError(error =>
            from([
              new CartActions.CreateCartFail(makeErrorSerializable(error)),
              new CartActions.CreateMultiCartFail({
                cartId: payload.cartId,
                error: makeErrorSerializable(error),
              }),
            ])
          )
        );
    })
  );

  // TODO: remove when removing cart store module
  @Effect()
  mergeCart2$: Observable<
    CartActions.MergeWithCurrentCart
  > = this.actions$.pipe(
    ofType(CartActions.MERGE_CART),
    map(
      (action: CartActions.MergeCart) =>
        new CartActions.MergeWithCurrentCart(action.payload)
    )
  );

  // TODO replace in 2.0 with multi cart action
  @Effect()
  mergeCart$: Observable<CartActions.CreateCart> = this.actions$.pipe(
    ofType(CartActions.MERGE_CART),
    map((action: CartActions.MergeCart) => action.payload),
    mergeMap(payload => {
      return this.cartConnector.load(payload.userId, 'current').pipe(
        mergeMap(currentCart => {
          return [
            new CartActions.CreateCart({
              userId: payload.userId,
              oldCartId: payload.cartId,
              toMergeCartGuid: currentCart ? currentCart.guid : undefined,
              extraData: payload.extraData,
            }),
          ];
        })
      );
    })
  );

  @Effect()
  setLoading$: Observable<CartActions.SetFakeLoadingCart> = this.actions$.pipe(
    ofType(
      CartActions.MERGE_CART,
      CartActions.CART_ADD_ENTRY,
      CartActions.CART_UPDATE_ENTRY,
      CartActions.CART_REMOVE_ENTRY
    ),
    map(
      (
        action:
          | CartActions.MergeCart
          | CartActions.CartAddEntry
          | CartActions.CartUpdateEntry
          | CartActions.CartRemoveEntry
      ) => action.payload
    ),
    mergeMap(payload => [
      new CartActions.SetFakeLoadingCart({
        cartId: payload.cartId,
      }),
    ])
  );

  // TODO: remove old actions usage (LoadCart)
  @Effect()
  refresh$: Observable<CartActions.LoadCart> = this.actions$.pipe(
    ofType(
      CartActions.MERGE_CART_SUCCESS,
      CartActions.CART_ADD_ENTRY_SUCCESS,
      CartActions.CART_UPDATE_ENTRY_SUCCESS,
      CartActions.CART_REMOVE_ENTRY_SUCCESS,
      CartActions.ADD_EMAIL_TO_CART_SUCCESS,
      CheckoutActions.CLEAR_CHECKOUT_DELIVERY_MODE_SUCCESS
    ),
    map(
      (
        action:
          | CartActions.MergeCartSuccess
          | CartActions.CartAddEntrySuccess
          | CartActions.CartUpdateEntrySuccess
          | CartActions.CartRemoveEntrySuccess
          | CartActions.AddEmailToCartSuccess
          | CheckoutActions.ClearCheckoutDeliveryModeSuccess
      ) => action.payload
    ),
    map(
      payload =>
        payload &&
        new CartActions.LoadCart({
          userId: payload.userId,
          cartId: payload.cartId,
        })
    )
  );

  // TODO: remove old actions usage, replace with new
  @Effect()
  resetCartDetailsOnSiteContextChange$: Observable<
    CartActions.ResetCartDetails | CartActions.ResetMultiCartDetails
  > = this.actions$.pipe(
    ofType(
      SiteContextActions.LANGUAGE_CHANGE,
      SiteContextActions.CURRENCY_CHANGE
    ),
    mergeMap(() => {
      return [
        new CartActions.ResetCartDetails(),
        new CartActions.ResetMultiCartDetails(),
      ];
    })
  );

  @Effect()
  addEmail$: Observable<
    CartActions.AddEmailToCartSuccess | CartActions.AddEmailToCartFail
  > = this.actions$.pipe(
    ofType(CartActions.ADD_EMAIL_TO_CART),
    map((action: CartActions.AddEmailToCart) => action.payload),
    mergeMap(payload =>
      this.cartConnector
        .addEmail(payload.userId, payload.cartId, payload.email)
        .pipe(
          map(() => {
            return new CartActions.AddEmailToCartSuccess({
              userId: payload.userId,
              cartId: payload.cartId,
            });
          }),
          catchError(error =>
            of(new CartActions.AddEmailToCartFail(makeErrorSerializable(error)))
          )
        )
    )
  );

  @Effect()
  deleteCart$: Observable<any> = this.actions$.pipe(
    ofType(CartActions.DELETE_CART),
    map((action: CartActions.DeleteCart) => action.payload),
    exhaustMap(payload =>
      this.cartConnector.delete(payload.userId, payload.cartId).pipe(
        map(() => {
          return new CartActions.ClearCart();
        }),
        catchError(error =>
          of(new CartActions.DeleteCartFail(makeErrorSerializable(error)))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private cartConnector: CartConnector,
    private cartData: CartDataService
  ) {}

  private isMissingData(payload: { userId: string; cartId: string }) {
    return payload.userId === undefined || payload.cartId === undefined;
  }
}
