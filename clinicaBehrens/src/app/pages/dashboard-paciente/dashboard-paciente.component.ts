import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { RegistroService } from '../../services/registro.service';
import { TurnosService } from '../../services/turnos.service';

@Component({
  selector: 'app-dashboard-paciente',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-paciente.component.html',
  styleUrls: ['./dashboard-paciente.component.scss']
})
export class DashboardPacienteComponent implements OnInit {
  paciente: any = null;
  estadisticas = {
    turnosPendientes: 0,
    turnosRealizados: 0,
    turnosCancelados: 0,
    proximoTurno: null as any
  };
  proximosTurnos: any[] = [];
  isLoading = true;

  constructor(
    private registroService: RegistroService,
    private turnosService: TurnosService,
    private router: Router
  ) {}

  async ngOnInit() {
    try {
      this.isLoading = true;
      await this.cargarDatosPaciente();
      await this.cargarEstadisticas();
      await this.cargarProximosTurnos();
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async cargarDatosPaciente() {
    const session = await this.registroService.getSesionActual();
    const userId = session?.data?.session?.user?.id;
    if (userId) {
      this.paciente = await this.registroService.getPerfilPorUserId(userId);
    }
  }

  async cargarEstadisticas() {
    if (!this.paciente) return;

    this.turnosService.getTurnosPorPaciente(this.paciente.user_id).subscribe(turnos => {
      if (turnos) {
        this.estadisticas.turnosPendientes = turnos.filter(t => 
          t.estado === 'pendiente' || t.estado === 'aceptado'
        ).length;
        this.estadisticas.turnosRealizados = turnos.filter(t => t.estado === 'realizado').length;
        this.estadisticas.turnosCancelados = turnos.filter(t => t.estado === 'cancelado' || t.estado === 'rechazado').length;
        
        // Buscar próximo turno
        const turnosActivos = turnos
          .filter(t => t.estado === 'pendiente' || t.estado === 'aceptado')
          .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
        
        this.estadisticas.proximoTurno = turnosActivos.length > 0 ? turnosActivos[0] : null;
      }
    });
  }

  async cargarProximosTurnos() {
    if (!this.paciente) return;

    this.turnosService.getTurnosPorPaciente(this.paciente.user_id).subscribe(turnos => {
      if (turnos) {
        this.proximosTurnos = turnos
          .filter(t => t.estado === 'pendiente' || t.estado === 'aceptado')
          .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
          .slice(0, 5);
      }
    });
  }

  irASolicitarTurno() {
    this.router.navigate(['/turnos']);
  }

  irAMisTurnos() {
    this.router.navigate(['/mis-turnos-paciente']);
  }

  irAMiPerfil() {
    this.router.navigate(['/mi-perfil']);
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'estado-pendiente';
      case 'aceptado': return 'estado-aceptado';
      case 'realizado': return 'estado-realizado';
      case 'cancelado': return 'estado-cancelado';
      case 'rechazado': return 'estado-rechazado';
      default: return '';
    }
  }

  getEstadoTexto(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'aceptado': return 'Aceptado';
      case 'realizado': return 'Realizado';
      case 'cancelado': return 'Cancelado';
      case 'rechazado': return 'Rechazado';
      default: return estado;
    }
  }
}
