import { coerceNumberProperty } from '@angular/cdk/coercion';
import {
  Component,
  Input,
  ChangeDetectionStrategy,
  Optional,
  Self,
  ViewChild,
  ChangeDetectorRef,
  booleanAttribute,
  OnInit,
} from '@angular/core';
import {
  ControlValueAccessor,
  NgControl,
  Validators,
} from '@angular/forms';
import {
  Subject,
  merge,
  of,
  map,
  tap,
} from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  DaffFormFieldComponent,
  DaffFormFieldControl,
} from '@daffodil/design/form-field';

import { DaffQuantityInputComponent } from './quantity-input/quantity-input.component';
import { DaffQuantitySelectComponent } from './quantity-select/quantity-select.component';

@Component({
  selector: 'daff-quantity-field',
  templateUrl: './quantity-field.component.html',
  providers: [
    {
      provide: DaffFormFieldControl,
      useExisting: DaffQuantityFieldComponent,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DaffQuantityInputComponent,
    DaffQuantitySelectComponent,
  ],
})
export class DaffQuantityFieldComponent extends DaffFormFieldControl<number> implements ControlValueAccessor, DaffFormFieldControl<number>, OnInit {
  // readonly private _value = toSignal(this.ngControl.valueChanges, {
  //   initialValue: ,
  // })

  /** @docs-private */
  get controlType() {
    const nativeType = this.showInputField ? 'native-input' : 'native-select';
    return `quantity-field ${nativeType}`;
  }

  /**
   * @docs-private
   */
  @ViewChild(DaffQuantityInputComponent) input: DaffQuantityInputComponent;

  /**
   * @docs-private
   */
  @ViewChild(DaffQuantitySelectComponent) select: DaffQuantitySelectComponent;

  /**
   * The minimum valid value of the quantity field.
   * Must be greater than or equal to 1.
   */
  @Input() min = 1;

  /**
   * The maximum valid value of the quantity field.
   * Must be greater than `min`.
   */
  @Input() max = 500;

  /**
   * The maximum number allowed before the field switches from a dropdown to an input.
   * When the value reaches this number, an input field is shown instead of a select.
   * Default is 10.
   */
  @Input() selectMax = 10;

  /**
   * @docs-private
   *
   * Implemented as part of DaffFormFieldControl.
   */
  focused = false;

  private _disabled = false;

  /**
   * @docs-private
   *
   * Implemented as part of DaffFormFieldControl.
   */
  @Input({ transform: booleanAttribute })
  get disabled(): boolean {
    return this.ngControl?.disabled ?? this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = value;
  }

  private _required = false;

  /**
   * @docs-private
   *
   * Implemented as part of DaffFormFieldControl.
   */
  @Input({ transform: booleanAttribute })
  get required(): boolean {
    return this.ngControl?.control?.hasValidator(Validators.required) ?? this._required;
  }
  set required(value: boolean) {
    this._required = value;
  }

  _destroyed = new Subject<boolean>();

  private _quantity = 1;
  private _inputHasBeenShown = false;

  get quantity() {
    return this._quantity;
  }
  set quantity(value: number) {
    this._quantity = coerceNumberProperty(value, 1);
  }

  /**
   * @docs-private
   *
   * Returns the lesser of max and selectMax.
   */
  get _maxFloor(): number {
    return Math.min(this.max, this.selectMax);
  }

  /**
   * @docs-private
   */
  get showInputField() {
    const exceedsSelectMax = this._inputHasBeenShown || (this.ngControl
      ? this.ngControl.value >= this.selectMax
      : this.quantity >= this.selectMax);

    if (exceedsSelectMax) {
      this._inputHasBeenShown = true;
    }

    return exceedsSelectMax;
  }

  /**
   * @docs-private
   */
  get showSelectField() {
    return !this.showInputField;
  }

  constructor(
    @Optional() @Self() public ngControl: NgControl,
    private cd: ChangeDetectorRef,
    @Optional() private formField: DaffFormFieldComponent,
  ) {
    super(ngControl);

    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }

    if(!this.formField) {
      throw new Error('DaffQuantityFieldComponent needs to be used with the DaffFormFieldComponent.');
    }
  }

  /**
   * @docs-private
   */
  ngOnInit() {
    this.stateChanges = merge(
      this._stateChanges.asObservable(),
      this.ngControl ? this.ngControl.statusChanges : of(undefined),
    ).pipe(
      map(() => this.state),
      tap((state) => this.disabled = state.disabled),
    );

    if (this.ngControl?.statusChanges) {
      this.ngControl.statusChanges.pipe(
        takeUntil(this._destroyed),
      ).subscribe(() => {
        this.emitState();
      });
    }

    if (this.ngControl?.valueChanges) {
      this.ngControl.valueChanges.pipe(
        takeUntil(this._destroyed),
      ).subscribe((value) => {
        this.quantity = value;
        this.cd.markForCheck();
      });
    }
  }

  private onChange(quantity: number): void {};
  private onTouched(quantity: number): void {};

  writeValue(quantity: number): void {
    this.quantity = quantity;
    this.cd.markForCheck();
  }

  registerOnChange(fn: (quantity: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cd.markForCheck();
  }

  /**
   * @docs-private
   *
   * Implemented as part of DaffFormFieldControl.
   */
  focus() {
    this.focused = true;
    if (this.select) {
      this.select.focus();
    }
    if (this.input) {
      this.input.focus();
    }
    this.emitState();
  }

  /**
   * Called when child components gain focus
   */
  onChildFocus() {
    this.focused = true;
    this.onTouched(this.value);
    this.emitState();
  }

  /**
   * Called when child components lose focus
   */
  onChildBlur() {
    this.focused = false;
    this.onTouched(this.value);
    this.emitState(true);
  }

  /**
   * Called when child components change value
   */
  onChildValueChange(value: number) {
    this.quantity = value;
    this.onChange(value);

    this.cd.markForCheck();
  }

  /**
   * @docs-private
   *
   * Implemented as part of DaffFormFieldControl.
   */
  get value() {
    return this.ngControl?.control?.value ?? this.quantity;
  }
}
