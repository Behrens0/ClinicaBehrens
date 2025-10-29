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
    this.cargarHistorias();
  }

  cargarHistorias() {
    this.historiaClinicaService.getTodasHistorias().subscribe({
      next: (historias) => {
        this.historias = historias || [];
        this.historiasFiltradas = [...this.historias];
      },
      error: (error) => {
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
        this.historiasFiltradas = this.historias.filter(h => 
          `${h.paciente.nombre} ${h.paciente.apellido}`.toLowerCase().includes(filtroLower)
        );
        break;
      case 'especialista':
        this.historiasFiltradas = this.historias.filter(h => 
          `${h.especialista.nombre} ${h.especialista.apellido}`.toLowerCase().includes(filtroLower)
        );
        break;
      case 'especialidad':
        this.historiasFiltradas = this.historias.filter(h => 
          h.especialista.especialidad?.toLowerCase().includes(filtroLower)
        );
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