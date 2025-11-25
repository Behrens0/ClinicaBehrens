import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TurnosService } from '../../services/turnos.service';
import { Turno } from '../../models/turno.model';
import { RegistroService } from '../../services/registro.service';
import { FormatoFechaPipe } from '../../pipes/formato-fecha.pipe';
import { EstadoTurnoPipe } from '../../pipes/estado-turno.pipe';

@Component({
  selector: 'app-mis-turnos-administrador',
  standalone: true,
  imports: [CommonModule, FormsModule, FormatoFechaPipe, EstadoTurnoPipe],
  templateUrl: './mis-turnos-administrador.component.html',
  styleUrls: ['./mis-turnos-administrador.component.scss']
})
export class MisTurnosAdministradorComponent implements OnInit {
  turnos: Turno[] = [];
  turnosFiltrados: Turno[] = [];
  filtro: string = '';
  
  mostrarModalCancelar: boolean = false;
  mostrarModalMotivo: boolean = false;
  turnoAOperar: any = null;
  motivoOperacion: string = '';
  motivoAMostrar: string = '';
  errorMotivo: string = '';
  mensaje: string = '';

  constructor(
    private turnosService: TurnosService,
    private registroService: RegistroService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    console.log('🔵 [MisTurnosAdmin] Iniciando carga de todos los turnos...');
    // Solo el administrador puede acceder, pero aquí mostramos todos los turnos
    this.turnosService.getTodosLosTurnos().subscribe(turnos => {
      console.log('📋 [MisTurnosAdmin] Turnos recibidos:', turnos);
      console.log('📊 [MisTurnosAdmin] Cantidad de turnos:', turnos?.length || 0);
      this.turnos = turnos || [];
      this.turnosFiltrados = [...this.turnos];
      console.log('✅ [MisTurnosAdmin] Turnos cargados correctamente');
      
      // Forzar detección de cambios
      this.cdr.detectChanges();
      console.log('🔄 [MisTurnosAdmin] Detección de cambios forzada');
    });
  }

  filtrarTurnos() {
    if (!this.filtro.trim()) {
      this.turnosFiltrados = [...this.turnos];
      return;
    }
    const filtroLower = this.filtro.trim().toLowerCase();
    this.turnosFiltrados = this.turnos.filter(t => {
      let texto = '';
      for (const key in t) {
        if (typeof (t as any)[key] === 'string' || typeof (t as any)[key] === 'number') {
          texto += ' ' + (t as any)[key];
        }
      }
      return texto.toLowerCase().includes(filtroLower);
    });
  }

  abrirModalCancelar(turno: any) {
    this.turnoAOperar = turno;
    this.motivoOperacion = '';
    this.errorMotivo = '';
    this.mostrarModalCancelar = true;
  }
  
  cerrarModalCancelar() {
    this.mostrarModalCancelar = false;
    this.turnoAOperar = null;
    this.motivoOperacion = '';
    this.errorMotivo = '';
  }
  
  async confirmarCancelacion() {
    if (!this.motivoOperacion.trim()) {
      this.errorMotivo = 'Debes ingresar un motivo para cancelar el turno.';
      return;
    }
    try {
      await this.turnosService.cancelarTurno(this.turnoAOperar.id, this.motivoOperacion);
      this.cerrarModalCancelar();
      this.mensaje = 'Turno cancelado exitosamente';
      setTimeout(() => { this.mensaje = ''; }, 3500);
      await this.ngOnInit();
    } catch (error) {
      this.errorMotivo = 'Error al cancelar el turno';
    }
  }
  
  abrirModalMotivo(turno: any) {
    this.turnoAOperar = turno;
    if (turno.estado === 'cancelado') {
      this.motivoAMostrar = turno.comentariopaciente || 'Sin motivo registrado.';
    } else if (turno.estado === 'rechazado') {
      this.motivoAMostrar = turno.comentarioespecialista || 'Sin motivo registrado.';
    }
    this.mostrarModalMotivo = true;
  }
  
  cerrarModalMotivo() {
    this.mostrarModalMotivo = false;
    this.motivoAMostrar = '';
    this.turnoAOperar = null;
  }

  limpiarMensaje() {
    this.mensaje = '';
  }

  puedeCancelar(turno: Turno): boolean {
    return turno.estado !== 'aceptado' && turno.estado !== 'realizado' && turno.estado !== 'rechazado';
  }
}
