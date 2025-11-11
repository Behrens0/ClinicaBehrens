import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { RegistroService } from '../../services/registro.service';
import { TurnosService } from '../../services/turnos.service';

@Component({
  selector: 'app-dashboard-especialista',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-especialista.component.html',
  styleUrls: ['./dashboard-especialista.component.scss']
})
export class DashboardEspecialistaComponent implements OnInit {
  especialista: any = null;
  estadisticas = {
    turnosPendientes: 0,
    turnosAceptados: 0,
    turnosRealizados: 0,
    pacientesAtendidos: 0
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
      await this.cargarDatosEspecialista();
      await this.cargarEstadisticas();
      await this.cargarProximosTurnos();
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async cargarDatosEspecialista() {
    const session = await this.registroService.getSesionActual();
    const userId = session?.data?.session?.user?.id;
    if (userId) {
      this.especialista = await this.registroService.getPerfilPorUserId(userId);
    }
  }

  async cargarEstadisticas() {
    if (!this.especialista) return;

    this.turnosService.getTurnosPorEspecialista(this.especialista.user_id).subscribe(turnos => {
      if (turnos) {
        this.estadisticas.turnosPendientes = turnos.filter(t => t.estado === 'pendiente').length;
        this.estadisticas.turnosAceptados = turnos.filter(t => t.estado === 'aceptado').length;
        this.estadisticas.turnosRealizados = turnos.filter(t => t.estado === 'realizado').length;
        
        // Contar pacientes únicos
        const pacientesUnicos = new Set(turnos.map(t => t.pacienteid));
        this.estadisticas.pacientesAtendidos = pacientesUnicos.size;
      }
    });
  }

  async cargarProximosTurnos() {
    if (!this.especialista) return;

    this.turnosService.getTurnosPorEspecialista(this.especialista.user_id).subscribe(turnos => {
      if (turnos) {
        // Filtrar turnos pendientes o aceptados y ordenar por fecha
        this.proximosTurnos = turnos
          .filter(t => t.estado === 'pendiente' || t.estado === 'aceptado')
          .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
          .slice(0, 5); // Solo los próximos 5
      }
    });
  }

  irAMisTurnos() {
    this.router.navigate(['/mis-turnos-especialista']);
  }

  irAMiPerfil() {
    this.router.navigate(['/mi-perfil']);
  }

  irAPacientes() {
    this.router.navigate(['/pacientes-especialista']);
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
