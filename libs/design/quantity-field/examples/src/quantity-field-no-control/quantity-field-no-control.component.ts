import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';

import { DAFF_FORM_FIELD_COMPONENTS } from '@daffodil/design/form-field';
import { DaffQuantityFieldComponent } from '@daffodil/design/quantity-field';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'quantity-field-no-control',
  templateUrl: './quantity-field-no-control.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DAFF_FORM_FIELD_COMPONENTS,
    DaffQuantityFieldComponent,
  ],
})
export class QuantityFieldNoControlComponent {
}
