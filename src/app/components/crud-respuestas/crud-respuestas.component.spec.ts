import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudRespuestasComponent } from './crud-respuestas.component';

describe('CrudRespuestasComponent', () => {
  let component: CrudRespuestasComponent;
  let fixture: ComponentFixture<CrudRespuestasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrudRespuestasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrudRespuestasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
