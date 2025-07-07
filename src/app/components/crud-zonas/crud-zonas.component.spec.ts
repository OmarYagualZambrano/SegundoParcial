import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudZonasComponent } from './crud-zonas.component';

describe('CrudZonasComponent', () => {
  let component: CrudZonasComponent;
  let fixture: ComponentFixture<CrudZonasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrudZonasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrudZonasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
