import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TurnosService } from '../../services/turnos.service';
import { Turno } from '../../models/turno.model';
import { RegistroService } from '../../services/registro.service';
import { HistoriaClinica, DatoDinamico } from '../../models/historia-clinica.model';
import { HistoriaClinicaService } from '../../services/historia-clinica.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-mis-turnos-paciente',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mis-turnos-paciente.component.html',
  styleUrls: ['./mis-turnos-paciente.component.scss'],
  animations: [
    trigger('turnoAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-30px)' }),
        animate('400ms cubic-bezier(.35,0,.25,1)', style({ opacity: 1, transform: 'none' }))
      ])
    ])
  ]
})
export class MisTurnosPacienteComponent implements OnInit {
  turnos: (Turno & { historiaClinica?: HistoriaClinica })[] = [];
  turnosFiltrados: (Turno & { historiaClinica?: HistoriaClinica })[] = [];
  filtro: string = '';
  filtroTipo: 'especialidad' | 'especialista' = 'especialidad';
  pacienteId: string = '';
  mostrarComentarioCancelacion: string | null = null;
  comentarioCancelacion: string = '';
  mostrarCalificacion: string | null = null;
  calificacionPuntaje: number = 5;
  calificacionComentario: string = '';
  mensaje: string = '';

  constructor(
    private turnosService: TurnosService,
    private registroService: RegistroService,
    private historiaClinicaService: HistoriaClinicaService
  ) {}

  async ngOnInit() {
    const session = await this.registroService.getSesionActual();
    this.pacienteId = session?.data?.session?.user?.id || '';
    if (this.pacienteId) {
      this.turnosService.getTurnosPorPaciente(this.pacienteId).subscribe(async turnos => {
        // Buscar historia clínica asociada a cada turno
        const turnosConHistoria = await Promise.all((turnos || []).map(async t => {
          const historia = await this.historiaClinicaService.getHistoriasPorPaciente(this.pacienteId).toPromise();
          const historiaDeTurno = (historia || []).find(h => h.historia.turno_id === t.id)?.historia;
          return { ...t, historiaClinica: historiaDeTurno };
        }));
        this.turnos = turnosConHistoria;
        this.turnosFiltrados = [...this.turnos];
      });
    }
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
    const filtroLower = this.filtro.toLowerCase();
    this.turnosFiltrados = this.turnos.filter(t => {
      // Buscar en campos del turno
      const camposTurno = [
        t.especialidad,
        t.especialistaNombre,
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

  mostrarDialogoCalificacion(turnoId: string) {
    this.mostrarCalificacion = turnoId;
    this.calificacionPuntaje = 5;
    this.calificacionComentario = '';
  }

  calificarAtencion(turno: Turno) {
    if (!this.calificacionComentario.trim()) {
      this.mensaje = 'Debes dejar un comentario para calificar la atención.';
      return;
    }
    this.turnosService.calificarAtencion(turno.id, this.calificacionPuntaje, this.calificacionComentario).then(() => {
      this.mensaje = '¡Gracias por calificar la atención!';
      this.mostrarCalificacion = null;
      this.calificacionComentario = '';
      this.ngOnInit();
    });
  }

  completarEncuesta(turno: Turno) {
    this.turnosService.completarEncuesta(turno.id).then(() => {
      this.mensaje = 'Encuesta completada.';
      this.ngOnInit();
    });
  }

  limpiarMensaje() {
    this.mensaje = '';
  }

  // Utilidades de visibilidad de acciones
  puedeCancelar(turno: Turno): boolean {
    return turno.estado !== 'realizado' && turno.estado !== 'cancelado' && turno.estado !== 'rechazado';
  }
  puedeVerResena(turno: Turno): boolean {
    return !!turno.resena;
  }
  puedeCompletarEncuesta(turno: Turno): boolean {
    return turno.estado === 'realizado' && !turno.encuestaCompletada && !!turno.resena;
  }
  puedeCalificar(turno: Turno): boolean {
    return turno.estado === 'realizado' && !turno.calificacionAtencion;
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
