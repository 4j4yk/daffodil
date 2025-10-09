import {
  waitForAsync,
  ComponentFixture,
  TestBed,
} from '@angular/core/testing';

import { QuantityFieldNoControlComponent } from './quantity-field-no-control.component';

describe('QuantityFieldNoControlComponent', () => {
  let component: QuantityFieldNoControlComponent;
  let fixture: ComponentFixture<QuantityFieldNoControlComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [QuantityFieldNoControlComponent],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuantityFieldNoControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
