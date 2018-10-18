import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AsHeaderFrontComponent } from './as-header-front.component';

describe('AsHeaderFrontComponent', () => {
  let component: AsHeaderFrontComponent;
  let fixture: ComponentFixture<AsHeaderFrontComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AsHeaderFrontComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsHeaderFrontComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
