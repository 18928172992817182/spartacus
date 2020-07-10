import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Product, BaseOption, VariantType } from '@spartacus/core';
import { Observable } from 'rxjs';
import { CurrentProductService } from '../current-product.service';

@Component({
  selector: 'cx-product-variants',
  templateUrl: './product-variants.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductVariantsComponent implements OnInit {
  constructor(private currentProductService: CurrentProductService) {}

  variants: BaseOption[] = [];
  variantType = VariantType;
  product$: Observable<Product>;

  ngOnInit(): void {
    this.product$ = this.currentProductService.getProduct()
  }
}
