import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TurnosService } from '../../services/turnos.service';
import { Turno } from '../../models/turno.model';
import { RegistroService } from '../../services/registro.service';
import { HistoriaClinica, DatoDinamico } from '../../models/historia-clinica.model';
import { HistoriaClinicaService } from '../../services/historia-clinica.service';
import { FormatoFechaPipe } from '../../pipes/formato-fecha.pipe';

@Component({
  selector: 'app-mis-turnos-especialista',
  standalone: true,
  imports: [CommonModule, FormsModule, FormatoFechaPipe],
  templateUrl: './mis-turnos-especialista.component.html',
  styleUrls: ['./mis-turnos-especialista.component.scss']
})
export class MisTurnosEspecialistaComponent implements OnInit {
  turnos: (Turno & { historiaClinica?: HistoriaClinica })[] = [];
  turnosFiltrados: (Turno & { historiaClinica?: HistoriaClinica })[] = [];
  filtro: string = '';
  especialistaId: string = '';
  
  // Modales
  mostrarModalCancelar: boolean = false;
  mostrarModalRechazar: boolean = false;
  mostrarModalFinalizar: boolean = false;
  mostrarModalResena: boolean = false;
  mostrarModalVerEncuesta: boolean = false;
  
  turnoAOperar: any = null;
  motivoOperacion: string = '';
  errorMotivo: string = '';
  resenaFinal: string = '';
  
  // Historia clínica para finalizar
  altura: string = '';
  peso: string = '';
  temperatura: string = '';
  presion: string = '';
  datosDinamicos: { clave: string, valor: string }[] = [];
  claveDinamica: string = '';
  valorDinamico: string = '';
  errorHistoriaClinica: string = '';
  
  mensaje: string = '';
  resenaAMostrar: string = '';
  encuestaComentarioVer: string = '';
  encuestaEstrellasVer: number = 0;

  constructor(
    private turnosService: TurnosService,
    private registroService: RegistroService,
    private historiaClinicaService: HistoriaClinicaService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    console.log('🔵 [MisTurnosEspecialista] Iniciando carga...');
    const session = await this.registroService.getSesionActual();
    this.especialistaId = session?.data?.session?.user?.id || '';
    console.log('👨‍⚕️ [MisTurnosEspecialista] Especialista ID:', this.especialistaId);
    
    if (this.especialistaId) {
      this.turnosService.getTurnosPorEspecialista(this.especialistaId).subscribe(async turnos => {
        console.log('📋 [MisTurnosEspecialista] Turnos recibidos:', turnos);
        console.log('📊 [MisTurnosEspecialista] Cantidad de turnos:', turnos?.length || 0);
        
        // Buscar historia clínica asociada a cada turno
        const historias = await this.historiaClinicaService.getHistoriasPorEspecialista(this.especialistaId).toPromise();
        const turnosConHistoria = (turnos || []).map(t => {
          const historiaDeTurno = (historias || []).find(h => h.historia.turno_id === t.id)?.historia;
          return { ...t, historiaClinica: historiaDeTurno };
        });
        this.turnos = turnosConHistoria;
        this.turnosFiltrados = [...this.turnos];
        console.log('✅ [MisTurnosEspecialista] Turnos procesados:', this.turnos.length);
        
        // Forzar detección de cambios
        this.cdr.detectChanges();
        console.log('🔄 [MisTurnosEspecialista] Detección de cambios forzada');
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
      for (const key in t) {
        if (typeof (t as any)[key] === 'string' || typeof (t as any)[key] === 'number') {
          texto += ' ' + (t as any)[key];
        }
      }
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
  
  // Acciones - Rechazar
  abrirModalRechazar(turno: any) {
    this.turnoAOperar = turno;
    this.motivoOperacion = '';
    this.errorMotivo = '';
    this.mostrarModalRechazar = true;
  }
  
  cerrarModalRechazar() {
    this.mostrarModalRechazar = false;
    this.turnoAOperar = null;
    this.motivoOperacion = '';
    this.errorMotivo = '';
  }
  
  async confirmarRechazo() {
    if (!this.motivoOperacion.trim()) {
      this.errorMotivo = 'Debes ingresar un motivo para rechazar el turno.';
      return;
    }
    try {
      await this.turnosService.rechazarTurno(this.turnoAOperar.id, this.motivoOperacion);
      this.cerrarModalRechazar();
      this.mensaje = 'Turno rechazado exitosamente';
      setTimeout(() => { this.mensaje = ''; }, 3500);
      await this.ngOnInit();
    } catch (error) {
      this.errorMotivo = 'Error al rechazar el turno';
    }
  }
  
  // Acciones - Aceptar
  async aceptarTurno(turno: Turno) {
    try {
      await this.turnosService.aceptarTurno(turno.id);
      this.mensaje = 'Turno aceptado exitosamente';
      setTimeout(() => { this.mensaje = ''; }, 3500);
      await this.ngOnInit();
    } catch (error) {
      this.mensaje = 'Error al aceptar el turno';
      setTimeout(() => { this.mensaje = ''; }, 3500);
    }
  }
  
  // Acciones - Finalizar
  abrirModalFinalizar(turno: any) {
    this.turnoAOperar = turno;
    this.resenaFinal = '';
    this.errorMotivo = '';
    this.mostrarModalFinalizar = true;
    this.altura = '';
    this.peso = '';
    this.temperatura = '';
    this.presion = '';
    this.datosDinamicos = [];
    this.claveDinamica = '';
    this.valorDinamico = '';
    this.errorHistoriaClinica = '';
  }
  
  cerrarModalFinalizar() {
    this.mostrarModalFinalizar = false;
    this.turnoAOperar = null;
    this.resenaFinal = '';
    this.errorMotivo = '';
  }
  
  async confirmarFinalizacion() {
    this.errorHistoriaClinica = '';
    this.errorMotivo = '';
    
    const alturaStr = this.altura !== undefined && this.altura !== null ? String(this.altura) : '';
    const pesoStr = this.peso !== undefined && this.peso !== null ? String(this.peso) : '';
    const temperaturaStr = this.temperatura !== undefined && this.temperatura !== null ? String(this.temperatura) : '';
    const presionStr = this.presion !== undefined && this.presion !== null ? String(this.presion) : '';
    
    if (!alturaStr.trim() || !pesoStr.trim() || !temperaturaStr.trim() || !presionStr.trim()) {
      this.errorHistoriaClinica = 'Debes completar todos los datos fijos de la historia clínica.';
      return;
    }
    
    if (!this.resenaFinal || !String(this.resenaFinal).trim()) {
      this.errorMotivo = 'Debes ingresar una reseña o comentario.';
      return;
    }
    
    try {
      // Finalizar turno con reseña
      await this.turnosService.finalizarTurno(this.turnoAOperar.id, String(this.resenaFinal).trim());
      
      // Crear historia clínica
      const historiaClinica: HistoriaClinica = {
        paciente_id: this.turnoAOperar.pacienteid,
        especialista_id: this.especialistaId,
        turno_id: this.turnoAOperar.id,
        fecha_atencion: new Date().toISOString(),
        altura: parseFloat(alturaStr),
        peso: parseFloat(pesoStr),
        temperatura: parseFloat(temperaturaStr),
        presion: presionStr,
        datos_dinamicos: this.datosDinamicos.map(d => ({ clave: d.clave, valor: d.valor }))
      };
      
      await this.historiaClinicaService.crearHistoriaClinica(historiaClinica);
      
      this.cerrarModalFinalizar();
      this.mensaje = '¡Turno finalizado con éxito!';
      setTimeout(() => { this.mensaje = ''; }, 3500);
      await this.ngOnInit();
    } catch (error) {
      this.errorMotivo = 'Error al finalizar el turno';
    }
  }
  
  agregarDatoDinamico() {
    if (this.claveDinamica.trim() && this.valorDinamico.trim() && this.datosDinamicos.length < 3) {
      this.datosDinamicos.push({ clave: this.claveDinamica.trim(), valor: this.valorDinamico.trim() });
      this.claveDinamica = '';
      this.valorDinamico = '';
      this.errorHistoriaClinica = '';
    } else if (this.datosDinamicos.length >= 3) {
      this.errorHistoriaClinica = 'Solo puedes agregar hasta 3 datos dinámicos.';
    } else {
      this.errorHistoriaClinica = 'Debes completar clave y valor.';
    }
  }
  
  eliminarDatoDinamico(index: number) {
    this.datosDinamicos.splice(index, 1);
    this.errorHistoriaClinica = '';
  }
  
  // Ver reseña
  abrirModalResena(turno: any) {
    this.resenaAMostrar = turno.resena || 'Sin reseña disponible.';
    this.mostrarModalResena = true;
  }
  
  cerrarModalResena() {
    this.mostrarModalResena = false;
    this.resenaAMostrar = '';
  }
  
  // Ver encuesta
  abrirModalVerEncuesta(turno: any) {
    this.encuestaComentarioVer = turno.encuestacomentario || 'Sin comentario.';
    this.encuestaEstrellasVer = turno.encuestaestrellas || 0;
    this.mostrarModalVerEncuesta = true;
  }
  
  cerrarModalVerEncuesta() {
    this.mostrarModalVerEncuesta = false;
    this.encuestaComentarioVer = '';
    this.encuestaEstrellasVer = 0;
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
