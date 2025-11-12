import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LogService } from '../../services/log.service';
import { TurnosService } from '../../services/turnos.service';
import { RegistroService } from '../../services/registro.service';
import { Chart, registerables } from 'chart.js';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { FormatoFechaPipe } from '../../pipes/formato-fecha.pipe';
import { CapitalizarPipe } from '../../pipes/capitalizar.pipe';

Chart.register(...registerables);

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule, FormsModule, FormatoFechaPipe, CapitalizarPipe],
  templateUrl: './estadisticas.component.html',
  styleUrls: ['./estadisticas.component.scss']
})
export class EstadisticasComponent implements OnInit, AfterViewInit {
  logs: any[] = [];
  turnos: any[] = [];
  especialistas: any[] = [];
  
  // Filtros de fecha
  fechaInicio: string = '';
  fechaFin: string = '';
  
  // Datos para gráficos
  turnosPorEspecialidad: any = {};
  turnosPorDia: any = {};
  turnosPorMedico: any = {};
  turnosFinalizadosPorMedico: any = {};
  
  // Charts
  chartEspecialidad: any;
  chartDia: any;
  chartMedico: any;
  chartFinalizados: any;
  
  mensaje: string = '';
  
  constructor(
    private logService: LogService,
    private turnosService: TurnosService,
    private registroService: RegistroService
  ) {
    // Fecha por defecto: últimos 30 días
    const hoy = new Date();
    const hace30Dias = new Date(hoy.getTime() - (30 * 24 * 60 * 60 * 1000));
    this.fechaInicio = hace30Dias.toISOString().split('T')[0];
    this.fechaFin = hoy.toISOString().split('T')[0];
  }

  ngOnInit() {
    this.cargarDatos();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.crearGraficos();
    }, 500);
  }

  async cargarDatos() {
    try {
      // Cargar logs
      this.logService.getLogs().subscribe(logs => {
        this.logs = logs || [];
      });

      // Cargar turnos
      this.turnosService.getTodosLosTurnos().subscribe(async turnos => {
        this.turnos = turnos || [];
        this.procesarDatos();
        
        // Esperar un momento para que el DOM esté listo
        setTimeout(() => {
          this.crearGraficos();
        }, 100);
      });

      // Cargar especialistas
      this.especialistas = await this.registroService.getEspecialistas();
    } catch (error) {
      console.error('Error cargando datos:', error);
      this.mensaje = 'Error al cargar estadísticas';
    }
  }

  aplicarFiltroFecha() {
    if (!this.fechaInicio || !this.fechaFin) {
      this.mensaje = 'Debes seleccionar ambas fechas';
      return;
    }

    const inicio = new Date(this.fechaInicio + 'T00:00:00');
    const fin = new Date(this.fechaFin + 'T23:59:59');

    // Filtrar turnos
    const turnosFiltrados = this.turnos.filter(t => {
      const fechaTurno = new Date(t.fecha);
      return fechaTurno >= inicio && fechaTurno <= fin;
    });

    // Reemplazar temporalmente los turnos para procesar
    const turnosOriginales = [...this.turnos];
    this.turnos = turnosFiltrados;
    this.procesarDatos();
    this.crearGraficos();
    this.turnos = turnosOriginales; // Restaurar todos los turnos
  }

  procesarDatos() {
    // 1. Turnos por especialidad
    this.turnosPorEspecialidad = {};
    this.turnos.forEach(t => {
      const esp = t.especialidad || 'Sin especialidad';
      this.turnosPorEspecialidad[esp] = (this.turnosPorEspecialidad[esp] || 0) + 1;
    });

    // 2. Turnos por día
    this.turnosPorDia = {};
    this.turnos.forEach(t => {
      const fecha = new Date(t.fecha).toLocaleDateString('es-AR');
      this.turnosPorDia[fecha] = (this.turnosPorDia[fecha] || 0) + 1;
    });

    // 3. Turnos por médico
    this.turnosPorMedico = {};
    this.turnos.forEach(t => {
      const medico = t.especialistanombre || 'Sin médico';
      this.turnosPorMedico[medico] = (this.turnosPorMedico[medico] || 0) + 1;
    });

    // 4. Turnos finalizados por médico
    this.turnosFinalizadosPorMedico = {};
    this.turnos.filter(t => t.estado === 'realizado').forEach(t => {
      const medico = t.especialistanombre || 'Sin médico';
      this.turnosFinalizadosPorMedico[medico] = (this.turnosFinalizadosPorMedico[medico] || 0) + 1;
    });
  }

  crearGraficos() {
    this.crearGraficoEspecialidad();
    this.crearGraficoDia();
    this.crearGraficoMedico();
    this.crearGraficoFinalizados();
  }

  crearGraficoEspecialidad() {
    const canvas = document.getElementById('chartEspecialidad') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.chartEspecialidad) {
      this.chartEspecialidad.destroy();
    }

    this.chartEspecialidad = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: Object.keys(this.turnosPorEspecialidad),
        datasets: [{
          label: 'Turnos por Especialidad',
          data: Object.values(this.turnosPorEspecialidad),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true },
          title: { display: true, text: 'Turnos por Especialidad' }
        }
      }
    });
  }

  crearGraficoDia() {
    const canvas = document.getElementById('chartDia') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.chartDia) {
      this.chartDia.destroy();
    }

    const labels = Object.keys(this.turnosPorDia).slice(0, 10); // Últimos 10 días
    const data = Object.values(this.turnosPorDia).slice(0, 10);

    this.chartDia = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Turnos por Día',
          data: data,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true },
          title: { display: true, text: 'Turnos por Día' }
        }
      }
    });
  }

  crearGraficoMedico() {
    const canvas = document.getElementById('chartMedico') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.chartMedico) {
      this.chartMedico.destroy();
    }

    this.chartMedico = new Chart(canvas, {
      type: 'pie',
      data: {
        labels: Object.keys(this.turnosPorMedico),
        datasets: [{
          label: 'Turnos por Médico',
          data: Object.values(this.turnosPorMedico),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true, position: 'right' },
          title: { display: true, text: 'Turnos Solicitados por Médico' }
        }
      }
    });
  }

  crearGraficoFinalizados() {
    const canvas = document.getElementById('chartFinalizados') as HTMLCanvasElement;
    if (!canvas) return;

    if (this.chartFinalizados) {
      this.chartFinalizados.destroy();
    }

    this.chartFinalizados = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: Object.keys(this.turnosFinalizadosPorMedico),
        datasets: [{
          label: 'Turnos Finalizados',
          data: Object.values(this.turnosFinalizadosPorMedico),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true },
          title: { display: true, text: 'Turnos Finalizados por Médico' }
        }
      }
    });
  }

  descargarLogsExcel() {
    const datosExcel = this.logs.map(log => ({
      'Usuario': log.usuario_nombre,
      'Tipo': log.usuario_tipo,
      'Fecha y Hora': new Date(log.fecha_hora).toLocaleString('es-AR')
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosExcel);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Logs');
    XLSX.writeFile(wb, `logs-ingresos-${Date.now()}.xlsx`);
  }

  descargarEstadisticasExcel() {
    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    // Hoja 1: Turnos por Especialidad
    const wsEsp = XLSX.utils.json_to_sheet(
      Object.entries(this.turnosPorEspecialidad).map(([esp, cant]) => ({
        'Especialidad': esp,
        'Cantidad': cant
      }))
    );
    XLSX.utils.book_append_sheet(wb, wsEsp, 'Por Especialidad');

    // Hoja 2: Turnos por Día
    const wsDia = XLSX.utils.json_to_sheet(
      Object.entries(this.turnosPorDia).map(([dia, cant]) => ({
        'Día': dia,
        'Cantidad': cant
      }))
    );
    XLSX.utils.book_append_sheet(wb, wsDia, 'Por Día');

    // Hoja 3: Turnos por Médico
    const wsMed = XLSX.utils.json_to_sheet(
      Object.entries(this.turnosPorMedico).map(([med, cant]) => ({
        'Médico': med,
        'Turnos Solicitados': cant
      }))
    );
    XLSX.utils.book_append_sheet(wb, wsMed, 'Por Médico');

    // Hoja 4: Turnos Finalizados
    const wsFin = XLSX.utils.json_to_sheet(
      Object.entries(this.turnosFinalizadosPorMedico).map(([med, cant]) => ({
        'Médico': med,
        'Turnos Finalizados': cant
      }))
    );
    XLSX.utils.book_append_sheet(wb, wsFin, 'Finalizados');

    XLSX.writeFile(wb, `estadisticas-${Date.now()}.xlsx`);
  }

  descargarPDF() {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Estadísticas de la Clínica', 20, 20);
    
    let y = 35;
    
    // Log de Ingresos
    doc.setFontSize(14);
    doc.text('Log de Ingresos (Últimos 10)', 20, y);
    y += 10;
    doc.setFontSize(10);
    this.logs.slice(0, 10).forEach(log => {
      doc.text(`${log.usuario_nombre} (${log.usuario_tipo}) - ${new Date(log.fecha_hora).toLocaleString('es-AR')}`, 20, y);
      y += 7;
    });

    // Nueva página para estadísticas
    doc.addPage();
    y = 20;
    
    doc.setFontSize(14);
    doc.text('Turnos por Especialidad', 20, y);
    y += 10;
    doc.setFontSize(10);
    Object.entries(this.turnosPorEspecialidad).forEach(([esp, cant]) => {
      doc.text(`${esp}: ${cant}`, 20, y);
      y += 7;
    });

    doc.save(`estadisticas-${Date.now()}.pdf`);
  }
}

