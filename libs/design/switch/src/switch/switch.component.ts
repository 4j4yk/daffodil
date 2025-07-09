import { coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output,
} from '@angular/core';

import {
  DaffSizableDirective,
  DaffSizeSmallType,
} from '@daffodil/design';

import {
  DaffSwitchLabelPosition,
  DaffSwitchLabelPositionEnum,
} from './label-position';

let switchUniqueLabelId = 0;
let switchUniqueToggleId = 0;

export type DaffSwitchSize = DaffSizeSmallType;

/**
 * The switch component provides a way to toggle between two settings.
 *
 * ```html
 * <daff-switch>Label</daff-switch>
 * ```
 */
@Component({
  selector: 'daff-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './switch.component.html',
  styleUrls: ['./switch.component.scss'],
  hostDirectives: [
    {
      directive: DaffSizableDirective,
      inputs: ['size'],
    },
  ],
})
export class DaffSwitchComponent extends DaffSizableDirective<DaffSwitchSize> {
  /**
   * @docs-private
   */
  @HostBinding('class.daff-switch') private hostClass = true;

  /**
   * The position of the label relative to the switch.
   */
  @Input() labelPosition: DaffSwitchLabelPosition = DaffSwitchLabelPositionEnum.LEFT;

  /**
   * @docs-private
   */
  @HostBinding('class') private get positionClasses() {
    return `${this.labelPosition}`;
  }

  /**
   * @docs-private
   */
  _disabled = false;
  /**
   * Whether the switch is disabled.
   */
  @Input() @HostBinding('class.daff-disabled') get disabled() {
    return this._disabled;
  }
  set disabled(value: any) {
    this._disabled = coerceBooleanProperty(value);
  }

  /**
   * Current state of switch (on/off).
   */
  @Input() @HostBinding('class.checked') checked = false;

  /**
   * @docs-private
   */
  @HostListener('keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    if (event.code === 'Space') {
      event.preventDefault();
      this.onToggle();
    }
  }

  /**
   * @docs-private
   */
  labelId: string = 'daff-switch-' + switchUniqueLabelId++ + '-label';

  /**
   * @docs-private
   */
  toggleId: string = 'daff-switch-' + switchUniqueToggleId++;

  /**
   * Output event triggered when the switch has been toggled.
   */
  @Output() toggled = new EventEmitter<boolean>();

  /**
   * @docs-private
   */
  onToggle() {
    if (!this.disabled) {
      this.checked = !this.checked;
      this.toggled.emit(this.checked);
    }
  }
}
