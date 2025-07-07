import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProblemCategoryCrudComponent } from './problem-category-crud.component';

describe('ProblemCategoryCrudComponent', () => {
  let component: ProblemCategoryCrudComponent;
  let fixture: ComponentFixture<ProblemCategoryCrudComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProblemCategoryCrudComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProblemCategoryCrudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
