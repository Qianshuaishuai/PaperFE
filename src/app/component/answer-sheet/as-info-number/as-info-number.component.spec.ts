import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AsInfoNumberComponent } from './as-info-number.component';

describe('AsInfoNumberComponent', () => {
  let component: AsInfoNumberComponent;
  let fixture: ComponentFixture<AsInfoNumberComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AsInfoNumberComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsInfoNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
