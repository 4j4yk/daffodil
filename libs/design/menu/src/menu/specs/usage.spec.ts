import {
  Component,
  DebugElement,
} from '@angular/core';
import {
  waitForAsync,
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BehaviorSubject } from 'rxjs';

import { DaffMenuItemComponent } from '../../menu-item/menu-item.component';
import { DaffMenuService } from '../../services/menu.service';
import { provideTestMenuService } from '../../testing/dummy-service';
import { DaffMenuComponent } from '../menu.component';

@Component({
  template: `
    <daff-menu>
      <a href="/test" daff-menu-item id="focused">Test</a>
      <button daff-menu-item id="not-focused">Test 2</button>
    </daff-menu>
  `,
  imports: [
    DaffMenuComponent,
    DaffMenuItemComponent,
  ],
})
class WrapperComponent {}

describe('@daffodil/design/menu | DaffMenuComponent | Usage', () => {
  let wrapper: WrapperComponent;
  let fixture: ComponentFixture<WrapperComponent>;
  let component: DaffMenuComponent;
  let de: DebugElement;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        NoopAnimationsModule,
        WrapperComponent,
      ],
      providers: [
        provideTestMenuService(),
      ],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WrapperComponent);
    wrapper = fixture.componentInstance;
    fixture.detectChanges();

    de = fixture.debugElement.query(By.css('daff-menu'));
    component = de.componentInstance;
  });

  it('should create', () => {
    expect(wrapper).toBeTruthy();
  });

  it('should focus the first focusable child when menu is opened', () => {
    expect(document.activeElement).toEqual(de.query(By.css('#focused')).nativeElement);
  });

  it('should call close on the service when the escape key is pressed', () => {
    const menuService = TestBed.inject(DaffMenuService);
    expect((<BehaviorSubject<boolean>>menuService.open$).value).toEqual(true);
    const event = new KeyboardEvent('keydown',{
      key: 'Escape',
    });

    de.nativeElement.dispatchEvent(event);
    fixture.detectChanges();
    expect((<BehaviorSubject<boolean>>menuService.open$).value).toEqual(false);
  });
});
