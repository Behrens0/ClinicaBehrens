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
  
  // Horarios de la clínica
  readonly HORARIO_CLINICA = {
    'Lunes': { inicio: '08:00', fin: '19:00' },
    'Martes': { inicio: '08:00', fin: '19:00' },
    'Miércoles': { inicio: '08:00', fin: '19:00' },
    'Jueves': { inicio: '08:00', fin: '19:00' },
    'Viernes': { inicio: '08:00', fin: '19:00' },
    'Sábado': { inicio: '08:00', fin: '14:00' }
  };

  constructor(
    private registroService: RegistroService,
    private disponibilidadService: DisponibilidadService,
    private historiaClinicaService: HistoriaClinicaService
  ) {}

  async ngOnInit() {
    const session = await this.registroService.getSesionActual();
    const userId = session?.data?.session?.user?.id || '';
    console.log('🔵 [MiPerfil] Usuario ID:', userId);
    
    if (userId) {
      this.perfil = await this.registroService.getPerfilPorUserId(userId);
      console.log('📋 [MiPerfil] Perfil cargado:', this.perfil);
      
      this.esEspecialista = this.perfil?.tipo === 'especialista';
      this.esPaciente = this.perfil?.tipo === 'paciente';
      console.log('👤 [MiPerfil] Es especialista:', this.esEspecialista, '- Es paciente:', this.esPaciente);
      
      if (this.esEspecialista) {
        // Si tiene varias especialidades, separadas por coma o array
        this.especialidades = Array.isArray(this.perfil.especialidad)
          ? this.perfil.especialidad
          : (this.perfil.especialidad ? this.perfil.especialidad.split(',').map((e: string) => e.trim()) : []);
        this.cargarDisponibilidad(userId);
      }
      
      if (this.esPaciente) {
        console.log('🏥 [MiPerfil] Cargando historias clínicas para paciente...');
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
    console.log('🔵 [MiPerfil] === CARGANDO HISTORIAS CLÍNICAS ===');
    console.log('📋 [MiPerfil] Paciente ID:', userId);
    
    this.historiaClinicaService.getHistoriasPorPaciente(userId).subscribe({
      next: (historias) => {
        console.log('📤 [MiPerfil] Historias recibidas:', historias);
        console.log('📊 [MiPerfil] Cantidad de historias:', historias?.length || 0);
        this.historiasClinicas = historias || [];
        console.log('✅ [MiPerfil] Historias almacenadas:', this.historiasClinicas);
      },
      error: (error) => {
        console.error('❌ [MiPerfil] Error al cargar historias:', error);
        this.historiasClinicas = [];
      }
    });
  }

  agregarDisponibilidad() {
    if (!this.nuevaDisponibilidad.especialidad || !this.nuevaDisponibilidad.dia || !this.nuevaDisponibilidad.hora_inicio || !this.nuevaDisponibilidad.hora_fin) {
      this.mensaje = '❌ Completa todos los campos para agregar disponibilidad.';
      return;
    }
    
    // Validar que el día esté en el horario de la clínica
    const dia = this.nuevaDisponibilidad.dia! as keyof typeof this.HORARIO_CLINICA;
    const horarioClinica = this.HORARIO_CLINICA[dia];
    
    if (!horarioClinica) {
      this.mensaje = '❌ La clínica no está abierta ese día.';
      return;
    }
    
    // Validar que las horas estén dentro del horario de la clínica
    const horaInicio = this.nuevaDisponibilidad.hora_inicio!;
    const horaFin = this.nuevaDisponibilidad.hora_fin!;
    
    if (horaInicio < horarioClinica.inicio || horaInicio >= horarioClinica.fin) {
      this.mensaje = `❌ La hora de inicio debe estar entre ${horarioClinica.inicio} y ${horarioClinica.fin}`;
      return;
    }
    
    if (horaFin <= horaInicio || horaFin > horarioClinica.fin) {
      this.mensaje = `❌ La hora de fin debe ser mayor a la hora de inicio y no exceder las ${horarioClinica.fin}`;
      return;
    }
    
    // Validar que la hora de inicio sea al menos 30 minutos antes del cierre
    const horaInicioMinutos = parseInt(horaInicio.split(':')[0]) * 60 + parseInt(horaInicio.split(':')[1]);
    const horaFinClinicaMinutos = parseInt(horarioClinica.fin.split(':')[0]) * 60 + parseInt(horarioClinica.fin.split(':')[1]);
    
    if (horaFinClinicaMinutos - horaInicioMinutos < 30) {
      this.mensaje = '❌ Debe haber al menos 30 minutos antes del cierre de la clínica.';
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
      this.mensaje = '✅ Disponibilidad agregada correctamente.';
      this.nuevaDisponibilidad = { especialidad: '', dia: '', hora_inicio: '', hora_fin: '' };
      this.cargarDisponibilidad(userId);
    }).catch(error => {
      this.mensaje = '❌ Error al agregar disponibilidad: ' + error.message;
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
    console.log('📄 [MiPerfil] === GENERANDO PDF ===');
    console.log('📋 [MiPerfil] Perfil:', this.perfil);
    console.log('📋 [MiPerfil] Historias clínicas:', this.historiasClinicas);
    console.log('📊 [MiPerfil] Cantidad de historias:', this.historiasClinicas?.length || 0);
    
    const doc = new jsPDF();
    const logoUrl = 'https://sxdosrgvnxbxifxvasks.supabase.co/storage/v1/object/public/imagenes/diseno-logotipo-hospital-vector-cruz-medica_53876-136743.ico';
    
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = logoUrl;
    img.onload = () => {
      // Logo y encabezado
      doc.addImage(img, 'JPEG', 15, 10, 30, 30);
      doc.setFontSize(18);
      doc.text('Historia Clínica', 60, 20);
      doc.setFontSize(12);
      doc.text('Fecha de emisión: ' + new Date().toLocaleDateString('es-ES'), 60, 28);
      doc.setLineWidth(0.5);
      doc.line(15, 35, 195, 35);
      
      let y = 45;
      
      // Datos del Paciente
      doc.setFontSize(14);
      doc.text('Datos del Paciente', 15, y);
      y += 8;
      doc.setFontSize(12);
      doc.text('Nombre: ' + (this.perfil?.nombre || '') + ' ' + (this.perfil?.apellido || ''), 15, y); y += 7;
      doc.text('Email: ' + (this.perfil?.email || ''), 15, y); y += 7;
      if (this.perfil?.dni) { doc.text('DNI: ' + this.perfil.dni, 15, y); y += 7; }
      if (this.perfil?.edad) { doc.text('Edad: ' + this.perfil.edad, 15, y); y += 7; }
      if (this.perfil?.obra_social) { doc.text('Obra Social: ' + this.perfil.obra_social, 15, y); y += 7; }
      
      y += 5;
      doc.line(15, y, 195, y);
      y += 10;
      
      // Historias Clínicas
      doc.setFontSize(14);
      doc.text('Historias Clínicas', 15, y);
      y += 8;
      
      if (!this.historiasClinicas || this.historiasClinicas.length === 0) {
        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100);
        doc.text('No hay historias clínicas registradas.', 15, y);
        console.log('⚠️ [MiPerfil] No hay historias clínicas para incluir en el PDF');
      } else {
        console.log('✅ [MiPerfil] Incluyendo ' + this.historiasClinicas.length + ' historias en el PDF');
        
        this.historiasClinicas.forEach((hc, index) => {
          // Verificar si necesitamos una nueva página
          if (y > 250) {
            doc.addPage();
            y = 20;
          }
          
          doc.setFontSize(12);
          doc.setTextColor(0, 0, 0);
          doc.text(`Historia #${index + 1}`, 15, y);
          y += 7;
          
          doc.setFontSize(10);
          const historia = hc.historia;
          
          if (historia.fecha_atencion) {
            const fecha = new Date(historia.fecha_atencion);
            doc.text('Fecha de atención: ' + fecha.toLocaleDateString('es-ES') + ' ' + fecha.toLocaleTimeString('es-ES'), 20, y);
            y += 6;
          }
          
          if (historia.altura) { doc.text('Altura: ' + historia.altura + ' m', 20, y); y += 6; }
          if (historia.peso) { doc.text('Peso: ' + historia.peso + ' kg', 20, y); y += 6; }
          if (historia.temperatura) { doc.text('Temperatura: ' + historia.temperatura + '°C', 20, y); y += 6; }
          if (historia.presion) { doc.text('Presión: ' + historia.presion, 20, y); y += 6; }
          
          // Datos dinámicos
          if (historia.datos_dinamicos && Array.isArray(historia.datos_dinamicos) && historia.datos_dinamicos.length > 0) {
            doc.text('Datos adicionales:', 20, y); y += 6;
            historia.datos_dinamicos.forEach((dato: any) => {
              doc.text('  • ' + dato.clave + ': ' + dato.valor, 25, y);
              y += 6;
            });
          }
          
          y += 5;
          doc.setDrawColor(200, 200, 200);
          doc.line(20, y, 190, y);
          y += 8;
        });
      }
      
      console.log('✅ [MiPerfil] PDF generado exitosamente');
      doc.save('historia-clinica-' + (this.perfil?.nombre || 'paciente') + '.pdf');
    };
    
    img.onerror = () => {
      console.error('❌ [MiPerfil] Error al cargar el logo, generando PDF sin logo');
      // Generar PDF sin logo si falla la carga
      this.generarPDFSinLogo(doc);
    };
  }
  
  private generarPDFSinLogo(doc: jsPDF) {
    let y = 20;
    doc.setFontSize(18);
    doc.text('Historia Clínica', 15, y);
    y += 8;
    doc.setFontSize(12);
    doc.text('Fecha de emisión: ' + new Date().toLocaleDateString('es-ES'), 15, y);
    y += 10;
    doc.setLineWidth(0.5);
    doc.line(15, y, 195, y);
    y += 10;
    
    // Datos del Paciente
    doc.setFontSize(14);
    doc.text('Datos del Paciente', 15, y);
    y += 8;
    doc.setFontSize(12);
    doc.text('Nombre: ' + (this.perfil?.nombre || '') + ' ' + (this.perfil?.apellido || ''), 15, y); y += 7;
    doc.text('Email: ' + (this.perfil?.email || ''), 15, y); y += 7;
    if (this.perfil?.dni) { doc.text('DNI: ' + this.perfil.dni, 15, y); y += 7; }
    
    doc.save('historia-clinica-' + (this.perfil?.nombre || 'paciente') + '.pdf');
  }
}
