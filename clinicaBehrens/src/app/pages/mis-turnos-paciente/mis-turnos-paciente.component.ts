import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TurnosService } from '../../services/turnos.service';
import { Turno } from '../../models/turno.model';
import { RegistroService } from '../../services/registro.service';
import { HistoriaClinica, DatoDinamico } from '../../models/historia-clinica.model';
import { HistoriaClinicaService } from '../../services/historia-clinica.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { FormatoFechaPipe } from '../../pipes/formato-fecha.pipe';
import { EstadoTurnoPipe } from '../../pipes/estado-turno.pipe';

@Component({
  selector: 'app-mis-turnos-paciente',
  standalone: true,
  imports: [CommonModule, FormsModule, FormatoFechaPipe, EstadoTurnoPipe],
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
  pacienteId: string = '';
  
  // Modales
  mostrarModalCancelar: boolean = false;
  mostrarModalResena: boolean = false;
  mostrarModalEncuesta: boolean = false;
  mostrarModalCalificar: boolean = false;
  
  turnoAOperar: any = null;
  comentarioCancelacion: string = '';
  resenaAMostrar: string = '';
  
  // Encuesta
  comentarioEncuesta: string = '';
  estrellasEncuesta: number = 0;
  
  // Calificación
  calificacionPuntaje: number = 5;
  calificacionComentario: string = '';
  
  mensaje: string = '';
  errorMotivo: string = '';
  errorEncuesta: string = '';

  constructor(
    private turnosService: TurnosService,
    private registroService: RegistroService,
    private historiaClinicaService: HistoriaClinicaService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    console.log('🔵 [MisTurnosPaciente] Iniciando carga...');
    const session = await this.registroService.getSesionActual();
    this.pacienteId = session?.data?.session?.user?.id || '';
    console.log('👤 [MisTurnosPaciente] Paciente ID:', this.pacienteId);
    
    if (this.pacienteId) {
      this.turnosService.getTurnosPorPaciente(this.pacienteId).subscribe(async turnos => {
        console.log('📋 [MisTurnosPaciente] Turnos recibidos:', turnos);
        console.log('📊 [MisTurnosPaciente] Cantidad de turnos:', turnos?.length || 0);
        
        try {
          // Buscar historia clínica asociada a cada turno
          const turnosConHistoria = await Promise.all((turnos || []).map(async t => {
            try {
              const historia = await this.historiaClinicaService.getHistoriasPorPaciente(this.pacienteId).toPromise();
              const historiaDeTurno = (historia || []).find(h => h.historia.turno_id === t.id)?.historia;
              return { ...t, historiaClinica: historiaDeTurno };
            } catch (error) {
              console.warn('⚠️ [MisTurnosPaciente] Error al obtener historia para turno:', t.id, error);
              return { ...t, historiaClinica: undefined };
            }
          }));
          
          this.turnos = turnosConHistoria;
          this.turnosFiltrados = [...this.turnos];
          console.log('✅ [MisTurnosPaciente] Turnos procesados:', this.turnos.length);
          console.log('📊 [MisTurnosPaciente] turnosFiltrados.length:', this.turnosFiltrados.length);
          console.log('📋 [MisTurnosPaciente] turnosFiltrados:', this.turnosFiltrados);
          
          // Forzar detección de cambios
          this.cdr.detectChanges();
          console.log('🔄 [MisTurnosPaciente] Detección de cambios forzada');
        } catch (error) {
          console.error('❌ [MisTurnosPaciente] Error al procesar turnos:', error);
          // Si falla, al menos mostrar los turnos sin historia clínica
          this.turnos = (turnos || []).map(t => ({ ...t, historiaClinica: undefined }));
          this.turnosFiltrados = [...this.turnos];
          this.cdr.detectChanges();
        }
      });
    }
  }

  filtrarTurnos() {
    if (!this.filtro.trim()) {
      this.turnosFiltrados = [...this.turnos];
      return;
    }
    const filtroLower = this.filtro.trim().toLowerCase();
    this.turnosFiltrados = this.turnos.filter(t => {
      let texto = '';
      // Buscar en todos los campos relevantes
      for (const key in t) {
        if (typeof (t as any)[key] === 'string' || typeof (t as any)[key] === 'number') {
          texto += ' ' + (t as any)[key];
        }
      }
      // Buscar en historia clínica
      if (t.historiaClinica) {
        texto += ' ' + (t.historiaClinica.altura || '');
        texto += ' ' + (t.historiaClinica.peso || '');
        texto += ' ' + (t.historiaClinica.temperatura || '');
        texto += ' ' + (t.historiaClinica.presion || '');
        if (Array.isArray(t.historiaClinica.datos_dinamicos)) {
          t.historiaClinica.datos_dinamicos.forEach((dato: DatoDinamico) => {
            texto += ' ' + (dato.clave || '') + ' ' + (dato.valor || '');
          });
        }
      }
      return texto.toLowerCase().includes(filtroLower);
    });
  }

  // Acciones - Cancelar
  abrirModalCancelar(turno: any) {
    this.turnoAOperar = turno;
    this.comentarioCancelacion = '';
    this.errorMotivo = '';
    this.mostrarModalCancelar = true;
  }
  
  cerrarModalCancelar() {
    this.mostrarModalCancelar = false;
    this.turnoAOperar = null;
    this.comentarioCancelacion = '';
    this.errorMotivo = '';
  }
  
  async confirmarCancelacion() {
    if (!this.comentarioCancelacion.trim()) {
      this.errorMotivo = 'Debes ingresar un motivo para cancelar el turno.';
      return;
    }
    try {
      await this.turnosService.cancelarTurno(this.turnoAOperar.id, this.comentarioCancelacion);
      this.cerrarModalCancelar();
      this.mensaje = 'Turno cancelado exitosamente';
      setTimeout(() => { this.mensaje = ''; }, 3500);
      await this.ngOnInit();
    } catch (error) {
      this.errorMotivo = 'Error al cancelar el turno';
    }
  }
  
  // Acciones - Ver Reseña
  abrirModalResena(turno: any) {
    this.resenaAMostrar = turno.resena || 'Sin reseña disponible.';
    this.mostrarModalResena = true;
  }
  
  cerrarModalResena() {
    this.mostrarModalResena = false;
    this.resenaAMostrar = '';
  }
  
  // Acciones - Encuesta
  abrirModalEncuesta(turno: any) {
    this.turnoAOperar = turno;
    this.comentarioEncuesta = '';
    this.estrellasEncuesta = 0;
    this.errorEncuesta = '';
    this.mostrarModalEncuesta = true;
  }
  
  cerrarModalEncuesta() {
    this.mostrarModalEncuesta = false;
    this.turnoAOperar = null;
    this.comentarioEncuesta = '';
    this.estrellasEncuesta = 0;
    this.errorEncuesta = '';
  }
  
  async confirmarEncuesta() {
    this.errorEncuesta = '';
    if (!this.comentarioEncuesta.trim() || this.estrellasEncuesta < 1) {
      this.errorEncuesta = 'Debes dejar un comentario y seleccionar una cantidad de estrellas.';
      return;
    }
    try {
      await this.turnosService.completarEncuesta(this.turnoAOperar.id, this.comentarioEncuesta, this.estrellasEncuesta);
      this.cerrarModalEncuesta();
      this.mensaje = '¡Encuesta enviada con éxito!';
      setTimeout(() => { this.mensaje = ''; }, 3500);
      await this.ngOnInit();
    } catch (error) {
      this.errorEncuesta = 'Error al enviar la encuesta';
    }
  }
  
  // Acciones - Calificar Atención
  abrirModalCalificar(turno: any) {
    this.turnoAOperar = turno;
    this.calificacionPuntaje = 5;
    this.calificacionComentario = '';
    this.errorMotivo = '';
    this.mostrarModalCalificar = true;
  }
  
  cerrarModalCalificar() {
    this.mostrarModalCalificar = false;
    this.turnoAOperar = null;
    this.calificacionPuntaje = 5;
    this.calificacionComentario = '';
    this.errorMotivo = '';
  }
  
  async confirmarCalificacion() {
    this.errorMotivo = '';
    if (!this.calificacionComentario.trim()) {
      this.errorMotivo = 'Debes dejar un comentario sobre la atención.';
      return;
    }
    try {
      await this.turnosService.calificarAtencion(this.turnoAOperar.id, this.calificacionPuntaje, this.calificacionComentario);
      this.cerrarModalCalificar();
      this.mensaje = '¡Gracias por calificar la atención!';
      setTimeout(() => { this.mensaje = ''; }, 3500);
      await this.ngOnInit();
    } catch (error) {
      this.errorMotivo = 'Error al calificar la atención';
    }
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
    return turno.estado === 'realizado' && !turno.encuestacompletada && !!turno.resena;
  }
  puedeCalificar(turno: Turno): boolean {
    return turno.estado === 'realizado' && !turno.calificacionatencion;
  }
}
