import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AsPageIndexComponent } from './as-page-index.component';

describe('AsPageIndexComponent', () => {
  let component: AsPageIndexComponent;
  let fixture: ComponentFixture<AsPageIndexComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AsPageIndexComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsPageIndexComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
