import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HistoriaClinicaService } from '../../services/historia-clinica.service';
import { HistoriaClinicaCompleta } from '../../models/historia-clinica.model';

@Component({
  selector: 'app-historias-clinicas-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './historias-clinicas-admin.component.html',
  styleUrls: ['./historias-clinicas-admin.component.scss']
})
export class HistoriasClinicasAdminComponent implements OnInit {
  historias: HistoriaClinicaCompleta[] = [];
  historiasFiltradas: HistoriaClinicaCompleta[] = [];
  filtro: string = '';
  filtroTipo: 'paciente' | 'especialista' | 'especialidad' = 'paciente';
  mensaje: string = '';

  constructor(
    private historiaClinicaService: HistoriaClinicaService
  ) {}

  ngOnInit() {
    console.log('🔵 [HistoriasAdmin] Iniciando carga de historias...');
    this.cargarHistorias();
  }

  cargarHistorias() {
    console.log('🔵 [HistoriasAdmin] === CARGANDO HISTORIAS ===');
    
    this.historiaClinicaService.getTodasHistorias().subscribe({
      next: (historias) => {
        console.log('📤 [HistoriasAdmin] Historias recibidas:', historias);
        console.log('📊 [HistoriasAdmin] Cantidad:', historias?.length || 0);
        
        this.historias = historias || [];
        this.historiasFiltradas = [...this.historias];
        
        console.log('✅ [HistoriasAdmin] Historias almacenadas:', this.historias.length);
        
        // Log de muestra de la primera historia para verificar estructura
        if (this.historias.length > 0) {
          console.log('📋 [HistoriasAdmin] Muestra de primera historia:', {
            historia: this.historias[0].historia,
            paciente: this.historias[0].paciente,
            especialista: this.historias[0].especialista
          });
        }
      },
      error: (error) => {
        console.error('❌ [HistoriasAdmin] Error al cargar historias:', error);
        this.mensaje = 'Error al cargar las historias clínicas';
        console.error(error);
      }
    });
  }

  setFiltroTipo(tipo: 'paciente' | 'especialista' | 'especialidad') {
    this.filtroTipo = tipo;
    this.filtro = '';
    this.filtrarHistorias();
  }

  filtrarHistorias() {
    if (!this.filtro) {
      this.historiasFiltradas = [...this.historias];
      return;
    }

    const filtroLower = this.filtro.toLowerCase();
    
    switch (this.filtroTipo) {
      case 'paciente':
        this.historiasFiltradas = this.historias.filter(h => {
          if (!h.paciente) return false;
          const nombreCompleto = `${h.paciente.nombre || ''} ${h.paciente.apellido || ''}`.toLowerCase();
          return nombreCompleto.includes(filtroLower);
        });
        break;
      case 'especialista':
        this.historiasFiltradas = this.historias.filter(h => {
          if (!h.especialista) return false;
          const nombreCompleto = `${h.especialista.nombre || ''} ${h.especialista.apellido || ''}`.toLowerCase();
          return nombreCompleto.includes(filtroLower);
        });
        break;
      case 'especialidad':
        this.historiasFiltradas = this.historias.filter(h => {
          if (!h.especialista || !h.especialista.especialidad) return false;
          return h.especialista.especialidad.toLowerCase().includes(filtroLower);
        });
        break;
    }
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
} 