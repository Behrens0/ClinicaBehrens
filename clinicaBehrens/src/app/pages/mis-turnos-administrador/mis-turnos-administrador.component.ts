import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TurnosService } from '../../services/turnos.service';
import { Turno } from '../../models/turno.model';
import { RegistroService } from '../../services/registro.service';

@Component({
  selector: 'app-mis-turnos-administrador',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-turnos-administrador.component.html',
  styleUrls: ['./mis-turnos-administrador.component.scss']
})
export class MisTurnosAdministradorComponent implements OnInit {
  turnos: Turno[] = [];
  turnosFiltrados: Turno[] = [];
  filtro: string = '';
  filtroTipo: 'especialidad' | 'especialista' = 'especialidad';
  mostrarComentarioCancelacion: string | null = null;
  comentarioCancelacion: string = '';
  mensaje: string = '';

  constructor(
    private turnosService: TurnosService,
    private registroService: RegistroService
  ) {}

  async ngOnInit() {
    // Solo el administrador puede acceder, pero aquí mostramos todos los turnos
    this.turnosService.getTodosLosTurnos().subscribe(turnos => {
      this.turnos = turnos || [];
      this.turnosFiltrados = [...this.turnos];
    });
  }

  setFiltroTipo(tipo: 'especialidad' | 'especialista') {
    this.filtroTipo = tipo;
    this.filtro = '';
    this.filtrarTurnos();
  }

  filtrarTurnos() {
    if (!this.filtro) {
      this.turnosFiltrados = [...this.turnos];
      return;
    }
    if (this.filtroTipo === 'especialidad') {
      this.turnosFiltrados = this.turnos.filter(t => t.especialidad.toLowerCase().includes(this.filtro.toLowerCase()));
    } else {
      this.turnosFiltrados = this.turnos.filter(t => t.especialistaNombre.toLowerCase().includes(this.filtro.toLowerCase()));
    }
  }

  mostrarDialogoCancelacion(turnoId: string) {
    this.mostrarComentarioCancelacion = turnoId;
    this.comentarioCancelacion = '';
  }

  cancelarTurno(turno: Turno) {
    if (!this.comentarioCancelacion.trim()) {
      this.mensaje = 'Debes dejar un comentario para cancelar el turno.';
      return;
    }
    this.turnosService.cancelarTurno(turno.id, this.comentarioCancelacion).then(() => {
      this.mensaje = 'Turno cancelado correctamente.';
      this.mostrarComentarioCancelacion = null;
      this.comentarioCancelacion = '';
      this.ngOnInit();
    });
  }

  limpiarMensaje() {
    this.mensaje = '';
  }

  puedeCancelar(turno: Turno): boolean {
    return turno.estado !== 'aceptado' && turno.estado !== 'realizado' && turno.estado !== 'rechazado';
  }
  estadoTurno(turno: Turno): string {
    switch (turno.estado) {
      case 'pendiente': return 'Pendiente';
      case 'aceptado': return 'Aceptado';
      case 'realizado': return 'Realizado';
      case 'cancelado': return 'Cancelado';
      case 'rechazado': return 'Rechazado';
      default: return turno.estado;
    }
  }
}
