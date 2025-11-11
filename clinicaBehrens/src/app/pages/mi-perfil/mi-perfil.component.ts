import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RegistroService } from '../../services/registro.service';
import { DisponibilidadService } from '../../services/disponibilidad.service';
import { Disponibilidad } from '../../models/disponibilidad.model';
import { HistoriaClinicaService } from '../../services/historia-clinica.service';
import { HistoriaClinicaCompleta } from '../../models/historia-clinica.model';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mi-perfil.component.html',
  styleUrls: ['./mi-perfil.component.scss']
})
export class MiPerfilComponent implements OnInit {
  perfil: any = null;
  esEspecialista: boolean = false;
  esPaciente: boolean = false;
  especialidades: string[] = [];
  disponibilidad: Disponibilidad[] = [];
  nuevaDisponibilidad: Partial<Disponibilidad> = {
    especialidad: '',
    dia: '',
    hora_inicio: '',
    hora_fin: ''
  };
  dias: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  mensaje: string = '';
  historiasClinicas: HistoriaClinicaCompleta[] = [];

  constructor(
    private registroService: RegistroService,
    private disponibilidadService: DisponibilidadService,
    private historiaClinicaService: HistoriaClinicaService
  ) {}

  async ngOnInit() {
    const session = await this.registroService.getSesionActual();
    const userId = session?.data?.session?.user?.id || '';
    if (userId) {
      this.perfil = await this.registroService.getPerfilPorUserId(userId);
      this.esEspecialista = this.perfil?.tipo === 'especialista';
      this.esPaciente = this.perfil?.tipo === 'paciente';
      
      if (this.esEspecialista) {
        // Si tiene varias especialidades, separadas por coma o array
        this.especialidades = Array.isArray(this.perfil.especialidad)
          ? this.perfil.especialidad
          : (this.perfil.especialidad ? this.perfil.especialidad.split(',').map((e: string) => e.trim()) : []);
        this.cargarDisponibilidad(userId);
      }
      
      if (this.esPaciente) {
        this.cargarHistoriaClinica(userId);
      }
    }
  }

  cargarDisponibilidad(userId: string) {
    this.disponibilidadService.getDisponibilidadPorEspecialista(userId).subscribe(dispo => {
      this.disponibilidad = dispo || [];
    });
  }

  cargarHistoriaClinica(userId: string) {
    this.historiaClinicaService.getHistoriasPorPaciente(userId).subscribe(historias => {
      this.historiasClinicas = historias || [];
    });
  }

  agregarDisponibilidad() {
    if (!this.nuevaDisponibilidad.especialidad || !this.nuevaDisponibilidad.dia || !this.nuevaDisponibilidad.hora_inicio || !this.nuevaDisponibilidad.hora_fin) {
      this.mensaje = 'Completa todos los campos para agregar disponibilidad.';
      return;
    }
    const userId = this.perfil.user_id;
    const nueva: Disponibilidad = {
      especialista_id: userId,
      especialidad: this.nuevaDisponibilidad.especialidad!,
      dia: this.nuevaDisponibilidad.dia!,
      hora_inicio: this.nuevaDisponibilidad.hora_inicio!,
      hora_fin: this.nuevaDisponibilidad.hora_fin!
    };
    this.disponibilidadService.agregarDisponibilidad(nueva).then(() => {
      this.mensaje = 'Disponibilidad agregada.';
      this.nuevaDisponibilidad = { especialidad: '', dia: '', hora_inicio: '', hora_fin: '' };
      this.cargarDisponibilidad(userId);
    });
  }

  eliminarDisponibilidad(id: string) {
    this.disponibilidadService.eliminarDisponibilidad(id).then(() => {
      this.mensaje = 'Disponibilidad eliminada.';
      this.cargarDisponibilidad(this.perfil.user_id);
    });
  }

  limpiarMensaje() {
    this.mensaje = '';
  }

  descargarHistoriaClinica() {
    const doc = new jsPDF();
    // Logo (ajustar tamaño y posición según necesidad)
    const logoUrl = 'https://sxdosrgvnxbxifxvasks.supabase.co/storage/v1/object/public/clinica/clinica-logo2.jpg';
    // Cargar imagen asíncrona
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = logoUrl;
    img.onload = () => {
      doc.addImage(img, 'JPEG', 15, 10, 30, 30);
      doc.setFontSize(18);
      doc.text('Historia Clínica', 60, 20);
      doc.setFontSize(12);
      doc.text('Fecha de emisión: ' + new Date().toLocaleDateString(), 60, 28);
      doc.setLineWidth(0.5);
      doc.line(15, 35, 195, 35);
      let y = 45;
      doc.setFontSize(14);
      doc.text('Datos del Paciente', 15, y);
      y += 8;
      doc.setFontSize(12);
      doc.text('Nombre: ' + (this.perfil?.nombre || ''), 15, y); y += 7;
      doc.text('Apellido: ' + (this.perfil?.apellido || ''), 15, y); y += 7;
      doc.text('Email: ' + (this.perfil?.email || ''), 15, y); y += 7;
      if (this.perfil?.dni) { doc.text('DNI: ' + this.perfil.dni, 15, y); y += 7; }
      if (this.perfil?.obra_social) { doc.text('Obra Social: ' + this.perfil.obra_social, 15, y); y += 7; }
      // Puedes agregar más datos aquí
      doc.save('historia-clinica.pdf');
    };
  }
}
