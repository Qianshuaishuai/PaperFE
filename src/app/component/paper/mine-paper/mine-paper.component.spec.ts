import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MinePaperComponent } from './mine-paper.component';

describe('MinePaperComponent', () => {
  let component: MinePaperComponent;
  let fixture: ComponentFixture<MinePaperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MinePaperComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MinePaperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
