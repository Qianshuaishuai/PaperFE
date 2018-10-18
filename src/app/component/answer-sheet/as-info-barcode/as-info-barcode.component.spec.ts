import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AsInfoBarcodeComponent } from './as-info-barcode.component';

describe('AsInfoBarcodeComponent', () => {
  let component: AsInfoBarcodeComponent;
  let fixture: ComponentFixture<AsInfoBarcodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AsInfoBarcodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsInfoBarcodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
