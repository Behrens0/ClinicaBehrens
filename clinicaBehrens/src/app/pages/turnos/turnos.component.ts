import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RegistroService } from '../../services/registro.service';
import { DisponibilidadService } from '../../services/disponibilidad.service';
import { TurnosService } from '../../services/turnos.service';
import { Disponibilidad } from '../../models/disponibilidad.model';

@Component({
  selector: 'app-turnos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './turnos.component.html',
  styleUrls: ['./turnos.component.scss']
})
export class TurnosComponent implements OnInit {
  esAdmin: boolean = false;
  perfil: any = null;
  pacientes: any[] = [];
  especialidades: string[] = [];
  especialistas: any[] = [];
  especialistaSeleccionado: any = null;
  especialidadSeleccionada: string = '';
  pacienteSeleccionado: any = null;
  diasDisponibles: string[] = [];
  horariosDisponibles: { dia: string, hora_inicio: string, hora_fin: string }[] = [];
  especialistasFiltrados: any[] = [];
  horariosFiltrados: { dia: string, hora_inicio: string, hora_fin: string }[] = [];
  diaSeleccionado: string = '';
  horarioSeleccionado: { hora_inicio: string, hora_fin: string } | null = null;
  mensaje: string = '';

  constructor(
    private registroService: RegistroService,
    private disponibilidadService: DisponibilidadService,
    private turnosService: TurnosService
  ) {}

  async ngOnInit() {
    try {
      console.log('=== INICIANDO CARGA DE TURNOS ===');
      const session = await this.registroService.getSesionActual();
      console.log('Sesión:', session);
      
      const userId = session?.data?.session?.user?.id || '';
      console.log('User ID:', userId);
      
      if (userId) {
        this.perfil = await this.registroService.getPerfilPorUserId(userId);
        console.log('Perfil:', this.perfil);
        
        this.esAdmin = this.perfil?.tipo === 'administrador';
        console.log('Es admin:', this.esAdmin);
        
        if (this.esAdmin) {
          // Cargar todos los pacientes
          console.log('Cargando pacientes...');
          this.pacientes = await this.registroService.getPacientes();
          console.log('Pacientes cargados:', this.pacientes.length);
        }
        
        // Cargar todas las especialidades y especialistas
        console.log('Cargando especialidades...');
        this.especialidades = await this.registroService.getTodasEspecialidades();
        console.log('Especialidades:', this.especialidades);
        
        console.log('Cargando especialistas...');
        this.especialistas = await this.registroService.getEspecialistas();
        console.log('Especialistas:', this.especialistas.length);
      } else {
        this.mensaje = '⚠️ No hay sesión activa. Por favor, inicia sesión.';
      }
      
      console.log('=== CARGA COMPLETADA ===');
    } catch (error) {
      console.error('Error al cargar datos:', error);
      this.mensaje = '❌ Error al cargar datos. Verifica la consola.';
    }
  }

  seleccionarEspecialidad(especialidad: string) {
    this.especialidadSeleccionada = especialidad;
    this.especialistaSeleccionado = null;
    this.diasDisponibles = [];
    this.horariosDisponibles = [];
    this.diaSeleccionado = '';
    this.horarioSeleccionado = null;
    // Filtrar especialistas por especialidad
    this.especialistasFiltrados = this.especialistas.filter(es => {
      if (Array.isArray(es.especialidad)) {
        return es.especialidad.includes(especialidad);
      } else {
        return (es.especialidad || '').split(',').map((x: string) => x.trim()).includes(especialidad);
      }
    });
  }

  seleccionarEspecialista(especialista: any) {
    this.especialistaSeleccionado = especialista;
    this.cargarDiasYHorarios();
    this.diaSeleccionado = '';
    this.horarioSeleccionado = null;
  }

  cargarDiasYHorarios() {
    if (!this.especialistaSeleccionado || !this.especialidadSeleccionada) return;
    this.disponibilidadService.getDisponibilidadPorEspecialista(this.especialistaSeleccionado.user_id).subscribe(dispo => {
      // Filtrar por especialidad
      const dispoFiltrada = dispo.filter(d => d.especialidad === this.especialidadSeleccionada);
      // Solo próximos 15 días
      const hoy = new Date();
      const dias: string[] = [];
      const horarios: { dia: string, hora_inicio: string, hora_fin: string }[] = [];
      for (let i = 0; i < 15; i++) {
        const fecha = new Date(hoy.getTime() + i * 24 * 60 * 60 * 1000);
        const diaSemana = fecha.toLocaleDateString('es-AR', { weekday: 'long' });
        dispoFiltrada.forEach(d => {
          if (d.dia.toLowerCase() === diaSemana.toLowerCase()) {
            dias.push(fecha.toLocaleDateString('es-AR'));
            horarios.push({ dia: fecha.toLocaleDateString('es-AR'), hora_inicio: d.hora_inicio, hora_fin: d.hora_fin });
          }
        });
      }
      this.diasDisponibles = Array.from(new Set(dias));
      this.horariosDisponibles = horarios;
    });
  }

  seleccionarDia(dia: string) {
    this.diaSeleccionado = dia;
    // Filtrar horarios para ese día
    this.horariosFiltrados = this.horariosDisponibles.filter(hh => hh.dia === dia);
    this.horarioSeleccionado = null;
  }

  seleccionarHorario(horario: { hora_inicio: string, hora_fin: string }) {
    this.horarioSeleccionado = horario;
  }

  async solicitarTurno() {
    console.log('🟢 [TurnosComponent] Iniciando solicitud de turno...');
    
    if (!this.especialidadSeleccionada || !this.especialistaSeleccionado || !this.diaSeleccionado || !this.horarioSeleccionado) {
      this.mensaje = 'Completa todos los campos para solicitar el turno.';
      console.warn('⚠️ Faltan campos por completar');
      return;
    }
    
    let paciente = this.perfil;
    if (this.esAdmin) {
      if (!this.pacienteSeleccionado) {
        this.mensaje = 'Selecciona un paciente.';
        console.warn('⚠️ Admin debe seleccionar un paciente');
        return;
      }
      paciente = this.pacienteSeleccionado;
    }
    
    console.log('📋 Datos del paciente:', {
      user_id: paciente.user_id,
      nombre: paciente.nombre,
      apellido: paciente.apellido
    });
    
    console.log('📋 Datos del especialista:', {
      user_id: this.especialistaSeleccionado.user_id,
      nombre: this.especialistaSeleccionado.nombre,
      apellido: this.especialistaSeleccionado.apellido
    });
    
    // Convertir fecha de formato dd/mm/yyyy a yyyy-mm-dd y agregar hora
    const partesFecha = this.diaSeleccionado.split('/');
    const fechaBase = `${partesFecha[2]}-${partesFecha[1].padStart(2, '0')}-${partesFecha[0].padStart(2, '0')}`;
    
    // Normalizar hora: si viene como HH:MM agregar :00, si viene como HH:MM:SS dejarlo así
    let horaFormateada = this.horarioSeleccionado.hora_inicio;
    if (horaFormateada.split(':').length === 2) {
      horaFormateada = `${horaFormateada}:00`;
    }
    
    const fechaConHora = `${fechaBase}T${horaFormateada}`;
    
    console.log('📅 Fecha procesada:', {
      original: this.diaSeleccionado,
      base: fechaBase,
      horaOriginal: this.horarioSeleccionado.hora_inicio,
      horaFormateada: horaFormateada,
      conHora: fechaConHora
    });
    
    // Crear el turno con nombres de columnas exactos de la BD
    const turno = {
      pacienteid: paciente.user_id,
      pacientenombre: paciente.nombre + ' ' + paciente.apellido,
      especialistaid: this.especialistaSeleccionado.user_id,
      especialistanombre: this.especialistaSeleccionado.nombre + ' ' + this.especialistaSeleccionado.apellido,
      especialidad: this.especialidadSeleccionada,
      fecha: fechaConHora,
      estado: 'pendiente'
    };
    
    console.log('📦 Objeto turno a insertar:', JSON.stringify(turno, null, 2));
    
    try {
      console.log('⏳ Llamando al servicio...');
      const resultado = await this.turnosService.solicitarTurno(turno);
      console.log('✅ Resultado del servicio:', resultado);
      
      this.mensaje = '✅ Turno solicitado correctamente.';
      
      // Limpiar selección después de 2 segundos
      setTimeout(() => {
        this.especialidadSeleccionada = '';
        this.especialistaSeleccionado = null;
        this.diasDisponibles = [];
        this.horariosDisponibles = [];
        this.diaSeleccionado = '';
        this.horarioSeleccionado = null;
        this.pacienteSeleccionado = null;
        this.especialistasFiltrados = [];
        this.horariosFiltrados = [];
        this.mensaje = '';
      }, 2000);
    } catch (error: any) {
      console.error('❌ [TurnosComponent] Error al solicitar turno:', error);
      console.error('❌ Detalles del error:', {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code
      });
      this.mensaje = '❌ Error al solicitar el turno: ' + (error?.message || 'Error desconocido');
    }
  }

  limpiarMensaje() {
    this.mensaje = '';
  }
}
