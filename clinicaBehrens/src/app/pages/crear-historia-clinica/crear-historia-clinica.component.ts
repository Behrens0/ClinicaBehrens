import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HistoriaClinicaService } from '../../services/historia-clinica.service';
import { TurnosService } from '../../services/turnos.service';
import { RegistroService } from '../../services/registro.service';
import { HistoriaClinica, DatoDinamico } from '../../models/historia-clinica.model';

@Component({
  selector: 'app-crear-historia-clinica',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './crear-historia-clinica.component.html',
  styleUrls: ['./crear-historia-clinica.component.scss']
})
export class CrearHistoriaClinicaComponent implements OnInit {
  turnoId: string = '';
  turno: any = null;
  paciente: any = null;
  especialista: any = null;
  form: FormGroup;
  datosDinamicos: DatoDinamico[] = [];
  mensaje: string = '';
  isLoading = false;
  esExito: boolean = false;
  reseña: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private historiaClinicaService: HistoriaClinicaService,
    private turnosService: TurnosService,
    private registroService: RegistroService
  ) {
    this.form = this.fb.group({
      altura: ['', [Validators.required, Validators.min(0.5), Validators.max(3)]],
      peso: ['', [Validators.required, Validators.min(1), Validators.max(500)]],
      temperatura: ['', [Validators.required, Validators.min(30), Validators.max(45)]],
      presion: ['', [Validators.required]],
      claveDinamica: [''],
      valorDinamico: ['']
    });
  }

  async ngOnInit() {
    this.turnoId = this.route.snapshot.params['turnoId'];
    if (!this.turnoId) {
      this.mensaje = 'ID de turno no válido';
      return;
    }

    // Verificar que el usuario actual es el especialista del turno
    const session = await this.registroService.getSesionActual();
    const userId = session?.data?.session?.user?.id;
    if (!userId) {
      this.mensaje = 'Debes iniciar sesión';
      return;
    }

    // Cargar datos del turno
    this.turnosService.getTurnoPorId(this.turnoId).subscribe({
      next: (turno: any) => {
        this.turno = turno;
        if (turno.especialista_id !== userId) {
          this.mensaje = 'No tienes permisos para crear historia clínica para este turno';
          return;
        }
        this.cargarDatosPaciente(turno.paciente_id);
        this.cargarDatosEspecialista(turno.especialista_id);
      },
      error: (error: any) => {
        this.mensaje = 'Error al cargar el turno';
        console.error(error);
      }
    });
  }

  private async cargarDatosPaciente(pacienteId: string) {
    this.paciente = await this.registroService.getPerfilPorUserId(pacienteId);
  }

  private async cargarDatosEspecialista(especialistaId: string) {
    this.especialista = await this.registroService.getPerfilPorUserId(especialistaId);
  }

  agregarDatoDinamico() {
    const clave = this.form.get('claveDinamica')?.value?.trim();
    const valor = this.form.get('valorDinamico')?.value?.trim();
    
    if (!clave || !valor) {
      this.mensaje = 'Completa ambos campos para agregar un dato dinámico';
      return;
    }

    if (this.datosDinamicos.length >= 3) {
      this.mensaje = 'Máximo 3 datos dinámicos permitidos';
      return;
    }

    if (this.datosDinamicos.some(d => d.clave === clave)) {
      this.mensaje = 'Ya existe un dato con esa clave';
      return;
    }

    this.datosDinamicos.push({ clave, valor });
    this.form.patchValue({ claveDinamica: '', valorDinamico: '' });
    this.mensaje = '';
  }

  eliminarDatoDinamico(index: number) {
    this.datosDinamicos.splice(index, 1);
  }

  async guardarHistoriaClinica() {
    if (this.form.invalid) {
      this.mensaje = 'Completa todos los campos obligatorios';
      return;
    }

    this.isLoading = true;
    this.mensaje = '';
    this.esExito = false;

    try {
      const formData = this.form.value;
      const historia: Omit<HistoriaClinica, 'id' | 'created_at' | 'updated_at'> = {
        paciente_id: this.turno.paciente_id,
        especialista_id: this.turno.especialista_id,
        turno_id: this.turnoId,
        fecha_atencion: new Date().toISOString(),
        altura: formData.altura,
        peso: formData.peso,
        temperatura: formData.temperatura,
        presion: formData.presion,
        datos_dinamicos: this.datosDinamicos
      };

      await this.historiaClinicaService.crearHistoriaClinica(historia);
      // Marcar turno como realizado
      await this.turnosService.finalizarTurno(this.turnoId, this.reseña || '');
      this.mensaje = 'Historia clínica creada exitosamente';
      this.esExito = true;
      setTimeout(() => {
        this.router.navigate(['/mis-turnos-especialista']);
      }, 2000);
    } catch (error: any) {
      this.mensaje = 'Error al crear la historia clínica: ' + (error.message || 'Error desconocido');
      this.esExito = false;
    } finally {
      this.isLoading = false;
    }
  }

  cancelar() {
    this.router.navigate(['/mis-turnos-especialista']);
  }
} 