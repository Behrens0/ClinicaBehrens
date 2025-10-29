import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisTurnosAdministradorComponent } from './mis-turnos-administrador.component';

describe('MisTurnosAdministradorComponent', () => {
  let component: MisTurnosAdministradorComponent;
  let fixture: ComponentFixture<MisTurnosAdministradorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisTurnosAdministradorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisTurnosAdministradorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
