import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CustomValidators } from '../../validators/custom-validators';
import { RegistroService } from '../../services/registro.service';
import { EspecialidadesService } from '../../services/especialidades.service';
import { Paciente, Especialista, Administrador, Especialidad } from '../../models/usuario.model';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss'
})
export class RegistroComponent implements OnInit {
  tipoUsuario: 'paciente' | 'especialista' | 'administrador' | null = null;
  mostrarFormulario = false;
  formPaciente!: FormGroup;
  formEspecialista!: FormGroup;
  especialidades: Especialidad[] = [];
  mostrarNuevaEspecialidad = false;
  isLoading = false;
  mensaje = '';
  esExito = false;
  esAdmin = false;

  // Variables para captcha propio
  captchaPregunta: string = '';
  captchaRespuesta: string = '';
  captchaCorrecta: number = 0;

  // Variables para manejo de imágenes
  imagenPerfil1: File | null = null;
  imagenPerfil2: File | null = null;
  imagenPerfil1Preview: string | null = null;
  imagenPerfil2Preview: string | null = null;
  imagenPerfilEsp: File | null = null;
  imagenPerfilEspPreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private registroService: RegistroService,
    private especialidadesService: EspecialidadesService,
    private router: Router
  ) {
    this.inicializarFormularios();
  }

  async ngOnInit() {
    this.cargarEspecialidades();
    this.generarCaptcha();
    // Verificar si el usuario logueado es admin
    const session = await this.registroService.getSesionActual();
    const user = session?.data?.session?.user;
    if (user) {
      const perfil = await this.registroService.getPerfilPorUserId(user.id);
      this.esAdmin = perfil?.tipo === 'administrador';
    }
  }

  private inicializarFormularios(): void {
    // Formulario para pacientes
    this.formPaciente = this.fb.group({
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      edad: ['', [Validators.required, CustomValidators.edadValidator()]],
      dni: ['', [Validators.required, CustomValidators.dniValidator()]],
      obraSocial: ['', [Validators.required]],
      email: ['', [Validators.required, CustomValidators.emailValidator()]],
      password: ['', [Validators.required, CustomValidators.passwordValidator()]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: CustomValidators.confirmPasswordValidator(this.fb.control(''))
    });

    // Formulario para especialistas y administradores
    this.formEspecialista = this.fb.group({
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      edad: ['', [Validators.required, CustomValidators.edadValidator()]],
      dni: ['', [Validators.required, CustomValidators.dniValidator()]],
      especialidad: [''],
      nuevaEspecialidad: [''],
      email: ['', [Validators.required, CustomValidators.emailValidator()]],
      password: ['', [Validators.required, CustomValidators.passwordValidator()]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: CustomValidators.confirmPasswordValidator(this.fb.control(''))
    });

    // Actualizar validadores de confirmación de contraseña
    this.formPaciente.get('password')?.valueChanges.subscribe(() => {
      this.formPaciente.get('confirmPassword')?.updateValueAndValidity();
    });

    this.formEspecialista.get('password')?.valueChanges.subscribe(() => {
      this.formEspecialista.get('confirmPassword')?.updateValueAndValidity();
    });
  }

  private cargarEspecialidades(): void {
    this.especialidadesService.getEspecialidades().subscribe({
      next: (especialidades) => {
        this.especialidades = especialidades;
      },
      error: (error) => {
        console.error('Error al cargar especialidades:', error);
        this.mostrarMensaje('Error al cargar las especialidades', false);
      }
    });
  }

  seleccionarTipo(tipo: 'paciente' | 'especialista' | 'administrador'): void {
    this.tipoUsuario = tipo;
    this.mostrarFormulario = true;
    this.limpiarMensajes();
    // Limpiar imágenes y formularios al cambiar tipo
    this.imagenPerfil1 = null;
    this.imagenPerfil2 = null;
    this.imagenPerfil1Preview = null;
    this.imagenPerfil2Preview = null;
    this.imagenPerfilEsp = null;
    this.imagenPerfilEspPreview = null;
    this.formPaciente.reset();
    this.formEspecialista.reset();
  }

  volverASeleccion(): void {
    this.mostrarFormulario = false;
    this.tipoUsuario = null;
    this.limpiarMensajes();
    this.formPaciente.reset();
    this.formEspecialista.reset();
    this.imagenPerfil1 = null;
    this.imagenPerfil2 = null;
    this.imagenPerfil1Preview = null;
    this.imagenPerfil2Preview = null;
    this.imagenPerfilEsp = null;
    this.imagenPerfilEspPreview = null;
  }

  onEspecialidadChange(event: any): void {
    const especialidad = event.target.value;
    this.mostrarNuevaEspecialidad = especialidad === 'nueva';
    if (especialidad === 'nueva') {
      this.formEspecialista.patchValue({ especialidad: '' });
    }
  }

  agregarEspecialidad(): void {
    const nuevaEspecialidad = this.formEspecialista.get('nuevaEspecialidad')?.value;
    if (!nuevaEspecialidad) return;
    this.especialidadesService.agregarEspecialidad({
      nombre: nuevaEspecialidad.toLowerCase(),
      descripcion: '',
      activa: true
    }).subscribe({
      next: (especialidad) => {
        this.especialidades.push(especialidad);
        this.formEspecialista.patchValue({ 
          especialidad: especialidad.nombre,
          nuevaEspecialidad: ''
        });
        this.mostrarNuevaEspecialidad = false;
        this.mostrarMensaje('Especialidad agregada exitosamente', true);
      },
      error: (error) => {
        console.error('Error al agregar especialidad:', error);
        this.mostrarMensaje('Error al agregar la especialidad', false);
      }
    });
  }

  // Captcha propio: genera una suma aleatoria
  generarCaptcha() {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    this.captchaPregunta = `¿Cuánto es ${a} + ${b}?`;
    this.captchaCorrecta = a + b;
    this.captchaRespuesta = '';
  }

  verificarCaptcha(): boolean {
    return Number(this.captchaRespuesta) === this.captchaCorrecta;
  }

  // Métodos para manejo de imágenes
  onImagenSeleccionada(event: any, tipo: 'perfil1' | 'perfil2' | 'especialista'): void {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.mostrarMensaje('Por favor selecciona un archivo de imagen válido.', false);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.mostrarMensaje('El archivo es demasiado grande. Máximo 5MB.', false);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e: any) => {
      switch (tipo) {
        case 'perfil1':
          this.imagenPerfil1 = file;
          this.imagenPerfil1Preview = e.target.result;
          break;
        case 'perfil2':
          this.imagenPerfil2 = file;
          this.imagenPerfil2Preview = e.target.result;
          break;
        case 'especialista':
          this.imagenPerfilEsp = file;
          this.imagenPerfilEspPreview = e.target.result;
          break;
      }
    };
    reader.readAsDataURL(file);
  }

  removerImagen(tipo: 'perfil1' | 'perfil2' | 'especialista'): void {
    switch (tipo) {
      case 'perfil1':
        this.imagenPerfil1 = null;
        this.imagenPerfil1Preview = null;
        break;
      case 'perfil2':
        this.imagenPerfil2 = null;
        this.imagenPerfil2Preview = null;
        break;
      case 'especialista':
        this.imagenPerfilEsp = null;
        this.imagenPerfilEspPreview = null;
        break;
    }
  }

  async registrarPaciente(): Promise<void> {
    if (this.formPaciente.invalid || !this.imagenPerfil1) {
      if (!this.imagenPerfil1) {
        this.mostrarMensaje('Debes seleccionar al menos una imagen de perfil', false);
      }
      return;
    }
    this.isLoading = true;
    this.limpiarMensajes();
    try {
      const formData = this.formPaciente.value;
      const dniExiste = await this.registroService.verificarDNIExistente(formData.dni);
      if (dniExiste) {
        this.mostrarMensaje('El DNI ya está registrado', false);
        return;
      }

      // Preparar datos del paciente (sin las URLs de imágenes todavía)
      const paciente: Omit<Paciente, 'id' | 'createdAt' | 'updatedAt'> = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        edad: formData.edad,
        dni: formData.dni,
        obraSocial: formData.obraSocial,
        email: formData.email.toLowerCase(),
        password: formData.password,
        tipo: 'paciente',
        imagenPerfil: '', // Se llenará en el servicio
        imagenPerfil2: undefined
      };

      // Pasar los archivos File al servicio para que suba después de crear el usuario
      await this.registroService.registrarPaciente(
        paciente,
        this.imagenPerfil1!,
        this.imagenPerfil2 || undefined
      );

      this.mostrarMensaje('✅ Paciente registrado exitosamente. Por favor verifica tu email.', true);
      
      // Redirigir a login
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2500);
    } catch (error: any) {
      console.error('Error en registro paciente:', error);
      if (error.message?.includes('User already registered')) {
        this.mostrarMensaje('❌ El email ya está registrado', false);
      } else if (error.message?.includes('Invalid email')) {
        this.mostrarMensaje('❌ El formato del email no es válido', false);
      } else if (error.message?.includes('Password should be at least')) {
        this.mostrarMensaje('❌ La contraseña debe tener al menos 6 caracteres', false);
      } else {
        this.mostrarMensaje('❌ Error al registrar el paciente: ' + (error.message || 'Error desconocido'), false);
      }
    } finally {
      this.isLoading = false;
    }
  }

  async registrarEspecialista(): Promise<void> {
    if (this.formEspecialista.invalid || !this.imagenPerfilEsp) {
      if (!this.imagenPerfilEsp) {
        this.mostrarMensaje('Debes seleccionar una imagen de perfil', false);
      }
      return;
    }
    this.isLoading = true;
    this.limpiarMensajes();
    try {
      const formData = this.formEspecialista.value;
      const dniExiste = await this.registroService.verificarDNIExistente(formData.dni);
      if (dniExiste) {
        this.mostrarMensaje('El DNI ya está registrado', false);
        return;
      }

      // Preparar datos del especialista (sin la URL de imagen todavía)
      const especialista: Omit<Especialista, 'id' | 'createdAt' | 'updatedAt'> = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        edad: formData.edad,
        dni: formData.dni,
        especialidad: formData.especialidad,
        email: formData.email.toLowerCase(),
        password: formData.password,
        tipo: 'especialista',
        imagenPerfil: '' // Se llenará en el servicio
      };

      // Pasar el archivo File al servicio para que suba después de crear el usuario
      await this.registroService.registrarEspecialista(especialista, this.imagenPerfilEsp!);

      this.mostrarMensaje('✅ Especialista registrado exitosamente. Por favor verifica tu email.', true);
      
      // Redirigir a login
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2500);
    } catch (error: any) {
      console.error('Error en registro especialista:', error);
      if (error.message?.includes('User already registered')) {
        this.mostrarMensaje('❌ El email ya está registrado', false);
      } else if (error.message?.includes('Invalid email')) {
        this.mostrarMensaje('❌ El formato del email no es válido', false);
      } else if (error.message?.includes('Password should be at least')) {
        this.mostrarMensaje('❌ La contraseña debe tener al menos 6 caracteres', false);
      } else {
        this.mostrarMensaje('❌ Error al registrar el especialista: ' + (error.message || 'Error desconocido'), false);
      }
    } finally {
      this.isLoading = false;
    }
  }

  async registrarAdministrador(): Promise<void> {
    if (this.formEspecialista.invalid || !this.imagenPerfilEsp) {
      if (!this.imagenPerfilEsp) {
        this.mostrarMensaje('Debes seleccionar una imagen de perfil', false);
      }
      return;
    }

    this.isLoading = true;
    this.limpiarMensajes();

    try {
      const formData = this.formEspecialista.value;
      const dniExiste = await this.registroService.verificarDNIExistente(formData.dni);
      if (dniExiste) {
        this.mostrarMensaje('El DNI ya está registrado', false);
        return;
      }

      // Preparar datos del administrador (sin la URL de imagen todavía)
      const administrador = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        edad: formData.edad,
        dni: formData.dni,
        email: formData.email.toLowerCase(),
        password: formData.password,
        tipo: 'administrador' as const,
        imagenPerfil: '' // Se llenará en el servicio
      };

      // Pasar el archivo File al servicio para que suba después de crear el usuario
      await this.registroService.registrarAdministrador(administrador, this.imagenPerfilEsp!);

      this.mostrarMensaje('✅ Administrador registrado exitosamente. Por favor verifica tu email.', true);
      
      // Limpiar formulario y redirigir
      this.formEspecialista.reset();
      this.imagenPerfilEsp = null;
      this.imagenPerfilEspPreview = null;

      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2500);
    } catch (error: any) {
      console.error('Error en registro administrador:', error);
      if (error.message?.includes('User already registered')) {
        this.mostrarMensaje('❌ El email ya está registrado', false);
      } else if (error.message?.includes('Invalid email')) {
        this.mostrarMensaje('❌ El formato del email no es válido', false);
      } else if (error.message?.includes('Password should be at least')) {
        this.mostrarMensaje('❌ La contraseña debe tener al menos 6 caracteres', false);
      } else {
        this.mostrarMensaje('❌ Error al registrar el administrador: ' + (error.message || 'Error desconocido'), false);
      }
    } finally {
      this.isLoading = false;
    }
  }

  private mostrarMensaje(mensaje: string, esExito: boolean): void {
    this.mensaje = mensaje;
    this.esExito = esExito;
  }

  private limpiarMensajes(): void {
    this.mensaje = '';
  }

  // Método para submit general
  async onSubmit() {
    if (!this.verificarCaptcha()) {
      this.mostrarMensaje('Captcha incorrecto. Intenta de nuevo.', false);
      this.generarCaptcha();
      return;
    }
    if (this.tipoUsuario === 'paciente') {
      await this.registrarPaciente();
    } else if (this.tipoUsuario === 'especialista') {
      await this.registrarEspecialista();
    } else if (this.tipoUsuario === 'administrador') {
      await this.registrarAdministrador();
    }
  }
}
