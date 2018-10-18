import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AsLocatePointsComponent } from './as-locate-points.component';

describe('AsLocatePointsComponent', () => {
  let component: AsLocatePointsComponent;
  let fixture: ComponentFixture<AsLocatePointsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AsLocatePointsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsLocatePointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
