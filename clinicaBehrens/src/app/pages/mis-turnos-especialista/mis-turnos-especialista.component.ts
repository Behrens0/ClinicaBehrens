import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TurnosService } from '../../services/turnos.service';
import { Turno } from '../../models/turno.model';
import { RegistroService } from '../../services/registro.service';
import { HistoriaClinica, DatoDinamico } from '../../models/historia-clinica.model';
import { HistoriaClinicaService } from '../../services/historia-clinica.service';

@Component({
  selector: 'app-mis-turnos-especialista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-turnos-especialista.component.html',
  styleUrls: ['./mis-turnos-especialista.component.scss']
})
export class MisTurnosEspecialistaComponent implements OnInit {
  turnos: (Turno & { historiaClinica?: HistoriaClinica })[] = [];
  turnosFiltrados: (Turno & { historiaClinica?: HistoriaClinica })[] = [];
  filtro: string = '';
  filtroTipo: 'especialidad' | 'paciente' = 'especialidad';
  especialistaId: string = '';
  mostrarComentarioCancelacion: string | null = null;
  comentarioCancelacion: string = '';
  mostrarComentarioRechazo: string | null = null;
  comentarioRechazo: string = '';
  mostrarFinalizar: string | null = null;
  comentarioFinalizar: string = '';
  mensaje: string = '';

  constructor(
    private turnosService: TurnosService,
    private registroService: RegistroService,
    private historiaClinicaService: HistoriaClinicaService,
    private router: Router
  ) {}

  async ngOnInit() {
    const session = await this.registroService.getSesionActual();
    this.especialistaId = session?.data?.session?.user?.id || '';
    if (this.especialistaId) {
      this.turnosService.getTurnosPorEspecialista(this.especialistaId).subscribe(async turnos => {
        // Buscar historia clínica asociada a cada turno
        const historias = await this.historiaClinicaService.getHistoriasPorEspecialista(this.especialistaId).toPromise();
        const turnosConHistoria = (turnos || []).map(t => {
          const historiaDeTurno = (historias || []).find(h => h.historia.turno_id === t.id)?.historia;
          return { ...t, historiaClinica: historiaDeTurno };
        });
        this.turnos = turnosConHistoria;
        this.turnosFiltrados = [...this.turnos];
      });
    }
  }

  setFiltroTipo(tipo: 'especialidad' | 'paciente') {
    this.filtroTipo = tipo;
    this.filtro = '';
    this.filtrarTurnos();
  }

  filtrarTurnos() {
    if (!this.filtro) {
      this.turnosFiltrados = [...this.turnos];
      return;
    }
    const filtroLower = this.filtro.toLowerCase();
    this.turnosFiltrados = this.turnos.filter(t => {
      // Buscar en campos del turno
      const camposTurno = [
        t.especialidad,
        t.pacienteNombre,
        t.estado,
        t.fecha,
        t.comentarioPaciente || '',
        t.comentarioEspecialista || '',
        t.resena || '',
        t.calificacionAtencion?.comentario || ''
      ].join(' ').toLowerCase();
      // Buscar en historia clínica (si existe)
      let camposHistoria = '';
      if (t.historiaClinica) {
        camposHistoria = [
          t.historiaClinica.altura,
          t.historiaClinica.peso,
          t.historiaClinica.temperatura,
          t.historiaClinica.presion
        ].join(' ').toLowerCase();
        // Buscar en datos dinámicos
        if (t.historiaClinica.datos_dinamicos) {
          camposHistoria += ' ' + t.historiaClinica.datos_dinamicos.map((d: DatoDinamico) => `${d.clave} ${d.valor}`).join(' ').toLowerCase();
        }
      }
      return camposTurno.includes(filtroLower) || camposHistoria.includes(filtroLower);
    });
  }

  // Acciones
  mostrarDialogoCancelacion(turnoId: string) {
    this.mostrarComentarioCancelacion = turnoId;
    this.comentarioCancelacion = '';
  }
  mostrarDialogoRechazo(turnoId: string) {
    this.mostrarComentarioRechazo = turnoId;
    this.comentarioRechazo = '';
  }
  mostrarDialogoFinalizar(turnoId: string) {
    this.mostrarFinalizar = turnoId;
    this.comentarioFinalizar = '';
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

  rechazarTurno(turno: Turno) {
    if (!this.comentarioRechazo.trim()) {
      this.mensaje = 'Debes dejar un comentario para rechazar el turno.';
      return;
    }
    this.turnosService.rechazarTurno(turno.id, this.comentarioRechazo).then(() => {
      this.mensaje = 'Turno rechazado correctamente.';
      this.mostrarComentarioRechazo = null;
      this.comentarioRechazo = '';
      this.ngOnInit();
    });
  }

  aceptarTurno(turno: Turno) {
    this.turnosService.aceptarTurno(turno.id).then(() => {
      this.mensaje = 'Turno aceptado.';
      this.ngOnInit();
    });
  }

  finalizarTurno(turno: Turno) {
    if (!this.comentarioFinalizar.trim()) {
      this.mensaje = 'Debes dejar una reseña o comentario para finalizar el turno.';
      return;
    }
    this.turnosService.finalizarTurno(turno.id, this.comentarioFinalizar).then(() => {
      this.mensaje = 'Turno finalizado correctamente.';
      this.mostrarFinalizar = null;
      this.comentarioFinalizar = '';
      this.ngOnInit();
    });
  }

  limpiarMensaje() {
    this.mensaje = '';
  }

  // Utilidades de visibilidad de acciones
  puedeCancelar(turno: Turno): boolean {
    return turno.estado !== 'aceptado' && turno.estado !== 'realizado' && turno.estado !== 'rechazado';
  }
  puedeRechazar(turno: Turno): boolean {
    return turno.estado !== 'aceptado' && turno.estado !== 'realizado' && turno.estado !== 'cancelado';
  }
  puedeAceptar(turno: Turno): boolean {
    return turno.estado !== 'realizado' && turno.estado !== 'cancelado' && turno.estado !== 'rechazado';
  }
  puedeFinalizar(turno: Turno): boolean {
    return turno.estado === 'aceptado';
  }
  puedeCrearHistoriaClinica(turno: Turno): boolean {
    return turno.estado === 'aceptado';
  }
  puedeVerResena(turno: Turno): boolean {
    return !!turno.resena;
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

  crearHistoriaClinica(turnoId: string) {
    this.router.navigate(['/crear-historia-clinica', turnoId]);
  }
}
