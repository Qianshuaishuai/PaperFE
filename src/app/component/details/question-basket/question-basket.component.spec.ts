import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionBasketComponent } from './question-basket.component';

describe('QuestionBasketComponent', () => {
  let component: QuestionBasketComponent;
  let fixture: ComponentFixture<QuestionBasketComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QuestionBasketComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionBasketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
