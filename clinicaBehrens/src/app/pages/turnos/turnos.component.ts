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
    const session = await this.registroService.getSesionActual();
    const userId = session?.data?.session?.user?.id || '';
    if (userId) {
      this.perfil = await this.registroService.getPerfilPorUserId(userId);
      this.esAdmin = this.perfil?.tipo === 'administrador';
      if (this.esAdmin) {
        // Cargar todos los pacientes
        this.pacientes = await this.registroService.getPacientes();
      }
      // Cargar todas las especialidades y especialistas
      this.especialidades = await this.registroService.getTodasEspecialidades();
      this.especialistas = await this.registroService.getEspecialistas();
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
    if (!this.especialidadSeleccionada || !this.especialistaSeleccionado || !this.diaSeleccionado || !this.horarioSeleccionado) {
      this.mensaje = 'Completa todos los campos para solicitar el turno.';
      return;
    }
    let paciente = this.perfil;
    if (this.esAdmin) {
      if (!this.pacienteSeleccionado) {
        this.mensaje = 'Selecciona un paciente.';
        return;
      }
      paciente = this.pacienteSeleccionado;
    }
    // Crear el turno
    const turno = {
      pacienteId: paciente.user_id,
      pacienteNombre: paciente.nombre + ' ' + paciente.apellido,
      especialistaId: this.especialistaSeleccionado.user_id,
      especialistaNombre: this.especialistaSeleccionado.nombre + ' ' + this.especialistaSeleccionado.apellido,
      especialidad: this.especialidadSeleccionada,
      fecha: this.diaSeleccionado + ' ' + this.horarioSeleccionado.hora_inicio,
      estado: 'pendiente'
    };
    await this.turnosService.solicitarTurno(turno);
    this.mensaje = 'Turno solicitado correctamente.';
    // Limpiar selección
    this.especialidadSeleccionada = '';
    this.especialistaSeleccionado = null;
    this.diasDisponibles = [];
    this.horariosDisponibles = [];
    this.diaSeleccionado = '';
    this.horarioSeleccionado = null;
    this.pacienteSeleccionado = null;
  }

  limpiarMensaje() {
    this.mensaje = '';
  }
}
