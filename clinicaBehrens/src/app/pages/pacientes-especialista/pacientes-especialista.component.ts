import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HistoriaClinicaService } from '../../services/historia-clinica.service';
import { RegistroService } from '../../services/registro.service';
import { HistoriaClinicaCompleta } from '../../models/historia-clinica.model';

@Component({
  selector: 'app-pacientes-especialista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pacientes-especialista.component.html',
  styleUrls: ['./pacientes-especialista.component.scss']
})
export class PacientesEspecialistaComponent implements OnInit {
  pacientes: any[] = [];
  historiasPorPaciente: { [key: string]: HistoriaClinicaCompleta[] } = {};
  especialistaId: string = '';
  pacienteSeleccionado: string | null = null;
  mensaje: string = '';

  constructor(
    private historiaClinicaService: HistoriaClinicaService,
    private registroService: RegistroService
  ) {}

  async ngOnInit() {
    const session = await this.registroService.getSesionActual();
    this.especialistaId = session?.data?.session?.user?.id || '';
    if (this.especialistaId) {
      this.cargarPacientes();
    }
  }

  cargarPacientes() {
    this.historiaClinicaService.getPacientesAtendidosPorEspecialista(this.especialistaId).subscribe({
      next: async (pacienteIds) => {
        this.pacientes = [];
        for (const pacienteId of pacienteIds) {
          const perfil = await this.registroService.getPerfilPorUserId(pacienteId);
          if (perfil) {
            this.pacientes.push(perfil);
          }
        }
      },
      error: (error) => {
        this.mensaje = 'Error al cargar los pacientes';
        console.error(error);
      }
    });
  }

  seleccionarPaciente(pacienteId: string) {
    this.pacienteSeleccionado = pacienteId;
    this.cargarHistoriasPaciente(pacienteId);
  }

  cargarHistoriasPaciente(pacienteId: string) {
    this.historiaClinicaService.getHistoriasPacientePorEspecialista(pacienteId, this.especialistaId).subscribe({
      next: (historias) => {
        this.historiasPorPaciente[pacienteId] = historias || [];
      },
      error: (error) => {
        this.mensaje = 'Error al cargar las historias del paciente';
        console.error(error);
      }
    });
  }

  limpiarMensaje() {
    this.mensaje = '';
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  obtenerNombreCompleto(paciente: any): string {
    return `${paciente.nombre} ${paciente.apellido}`;
  }

  getNombrePacienteSeleccionado(): string {
    const paciente = this.pacientes.find(p => p.user_id === this.pacienteSeleccionado);
    return paciente ? this.obtenerNombreCompleto(paciente) : '';
  }
} 