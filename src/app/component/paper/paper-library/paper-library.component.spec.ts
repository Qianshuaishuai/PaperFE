import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaperLibraryComponent } from './paper-library.component';

describe('PaperLibraryComponent', () => {
  let component: PaperLibraryComponent;
  let fixture: ComponentFixture<PaperLibraryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaperLibraryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaperLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
