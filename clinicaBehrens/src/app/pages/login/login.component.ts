import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RegistroService } from '../../services/registro.service';
import { LogService } from '../../services/log.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  mensaje = '';
  esExito = false;
  mostrarPassword = false;
  sesionActiva = false;
  usuarioActual: any = null;

  // Botones de acceso rápido (se cargarán las fotos desde la BD)
  accesoRapido = [
    { 
      email: 'admin@clinica.com', 
      password: 'admin123', 
      label: 'Admin',
      nombre: 'Dr. Carlos Admin',
      tipo: 'administrador',
      foto: 'https://via.placeholder.com/150?text=Admin'
    },
    { 
      email: 'paciente1@test.com', 
      password: 'paciente123', 
      label: 'Paciente 1',
      nombre: 'Juan Pérez',
      tipo: 'paciente',
      foto: 'https://via.placeholder.com/150?text=P1'
    },
    { 
      email: 'paciente2@test.com', 
      password: 'paciente123', 
      label: 'Paciente 2',
      nombre: 'María García',
      tipo: 'paciente',
      foto: 'https://via.placeholder.com/150?text=P2'
    },
    { 
      email: 'paciente3@test.com', 
      password: 'paciente123', 
      label: 'Paciente 3',
      nombre: 'Pedro López',
      tipo: 'paciente',
      foto: 'https://via.placeholder.com/150?text=P3'
    },
    { 
      email: 'especialista1@test.com', 
      password: 'especialista123', 
      label: 'Especialista 1',
      nombre: 'Dra. Ana Martínez',
      tipo: 'especialista',
      foto: 'https://via.placeholder.com/150?text=E1'
    },
    { 
      email: 'especialista2@test.com', 
      password: 'especialista123', 
      label: 'Especialista 2',
      nombre: 'Dr. Luis Rodríguez',
      tipo: 'especialista',
      foto: 'https://via.placeholder.com/150?text=E2'
    }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: RegistroService,
    private router: Router,
    private logService: LogService
  ) {
    this.inicializarFormulario();
  }

  async ngOnInit(): Promise<void> {
    // Verificar si ya hay una sesión activa
    await this.verificarSesionActiva();
    
    // Cargar las fotos reales desde la base de datos
    await this.cargarFotosAccesoRapido();
  }

  private inicializarFormulario(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  private async verificarSesionActiva(): Promise<void> {
    try {
      const { data: { session } } = await this.authService.getSesionActual();
      if (session && session.user) {
        console.log('Sesión activa encontrada:', session);
        this.sesionActiva = true;
        this.usuarioActual = session.user;
        
        // Verificar que el usuario tenga un perfil válido antes de redirigir
        try {
          const estadoCuenta = await this.authService.verificarEstadoCuenta(session.user.id);
          console.log('Estado de cuenta encontrado:', estadoCuenta);
          
          if (estadoCuenta.verificado) {
            // Solo redirigir si el usuario está verificado
            this.redirigirSegunTipoUsuario(session.user.id);
          } else {
            console.log('Usuario no verificado, mostrando login');
          }
        } catch (perfilError) {
          console.log('Error verificando perfil, mostrando login:', perfilError);
        }
      } else {
        console.log('No hay sesión activa');
        this.sesionActiva = false;
        this.usuarioActual = null;
      }
    } catch (error) {
      console.log('Error verificando sesión activa:', error);
      this.sesionActiva = false;
      this.usuarioActual = null;
    }
  }

  async iniciarSesion(): Promise<void> {
    if (this.loginForm.invalid) {
      this.mostrarMensaje('Por favor completa todos los campos correctamente', false);
      return;
    }

    this.isLoading = true;
    this.limpiarMensajes();

    try {
      const { email, password } = this.loginForm.value;
      console.log('Intentando iniciar sesión con:', email);

      const resultado = await this.authService.iniciarSesion(email, password);
      console.log('Resultado del login:', resultado);

      // Obtener perfil y usuario
      const user = resultado.user;
      const perfil = await this.authService.getPerfilPorUserId(user.id);

      // Si es administrador, permitir acceso aunque no esté verificado
      if (perfil?.tipo === 'administrador') {
        // Registrar log de ingreso para admin
        await this.logService.registrarIngreso(
          user.id,
          `${perfil.nombre} ${perfil.apellido}`,
          perfil.tipo
        );
        
        this.mostrarMensaje('Inicio de sesión exitoso', true);
        setTimeout(() => {
          this.router.navigate(['/dashboard-admin']);
        }, 1500);
        return;
      }

      // Para paciente o especialista, verificar email
      const emailConfirmado = await this.authService.verificarEmailConfirmado();
      if (!emailConfirmado) {
        this.mostrarMensaje('Debes confirmar tu email antes de iniciar sesión. Revisa tu bandeja de entrada.', false);
        await this.authService.cerrarSesion();
        return;
      }

      // Verificar estado de la cuenta según el tipo de usuario
      const estadoCuenta = await this.authService.verificarEstadoCuenta(user.id);
      console.log('Estado de la cuenta:', estadoCuenta);

      if (!estadoCuenta.verificado) {
        this.mostrarMensaje('Tu cuenta no está verificada. Contacta al administrador.', false);
        await this.authService.cerrarSesion();
        return;
      }

      if (estadoCuenta.tipo === 'especialista' && !estadoCuenta.aprobado) {
        this.mostrarMensaje('Tu cuenta de especialista está pendiente de aprobación por el administrador.', false);
        await this.authService.cerrarSesion();
        return;
      }

      // Login exitoso - Registrar log de ingreso (reutilizar perfil ya obtenido)
      if (perfil) {
        await this.logService.registrarIngreso(
          user.id,
          `${perfil.nombre} ${perfil.apellido}`,
          perfil.tipo
        );
      }
      
      this.mostrarMensaje('Inicio de sesión exitoso', true);
      setTimeout(() => {
        this.redirigirSegunTipoUsuario(user.id);
      }, 1500);

    } catch (error: any) {
      console.error('Error en login:', error);
      // Manejar errores específicos
      if (error.message?.includes('Invalid login credentials')) {
        this.mostrarMensaje('Email o contraseña incorrectos', false);
      } else if (error.message?.includes('Email not confirmed')) {
        this.mostrarMensaje('Debes confirmar tu email antes de iniciar sesión', false);
      } else if (error.message?.includes('Too many requests')) {
        this.mostrarMensaje('Demasiados intentos. Intenta más tarde', false);
      } else {
        this.mostrarMensaje('Error al iniciar sesión: ' + (error.message || 'Error desconocido'), false);
      }
    } finally {
      this.isLoading = false;
    }
  }

  private async redirigirSegunTipoUsuario(userId: string): Promise<void> {
    try {
      const estadoCuenta = await this.authService.verificarEstadoCuenta(userId);
      
      if (estadoCuenta.tipo === 'paciente') {
        this.router.navigate(['/dashboard-paciente']);
      } else if (estadoCuenta.tipo === 'especialista') {
        this.router.navigate(['/dashboard-especialista']);
      } else {
        this.router.navigate(['/dashboard-admin']);
      }
    } catch (error) {
      console.error('Error redirigiendo usuario:', error);
      this.router.navigate(['/dashboard']);
    }
  }

  // Acceso rápido con datos predefinidos
  accesoRapidoClick(datos: { email: string; password: string; label: string }): void {
    this.loginForm.patchValue({
      email: datos.email,
      password: datos.password
    });
    
    console.log(`Acceso rápido: ${datos.label}`);
    this.iniciarSesion();
  }

  // Mostrar/ocultar contraseña
  togglePassword(): void {
    this.mostrarPassword = !this.mostrarPassword;
  }

  // Ir al registro
  irARegistro(): void {
    this.router.navigate(['/registro']);
  }

  // Recuperar contraseña
  recuperarPassword(): void {
    const email = this.loginForm.get('email')?.value;
    if (!email) {
      this.mostrarMensaje('Ingresa tu email para recuperar la contraseña', false);
      return;
    }
    
    // TODO: Implementar recuperación de contraseña
    this.mostrarMensaje('Función de recuperación de contraseña en desarrollo', false);
  }

  // Cerrar sesión actual
  async cerrarSesion(): Promise<void> {
    try {
      await this.authService.cerrarSesion();
      console.log('Sesión cerrada exitosamente');
      this.mostrarMensaje('Sesión cerrada exitosamente', true);
      
      // Limpiar formulario
      this.loginForm.reset();
      
      // Recargar la página para limpiar cualquier estado
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error cerrando sesión:', error);
      this.mostrarMensaje('Error al cerrar sesión', false);
    }
  }

  // Cargar las fotos reales desde la base de datos
  private async cargarFotosAccesoRapido(): Promise<void> {
    try {
      console.log('🖼️ Cargando fotos de acceso rápido desde la BD...');
      
      // Obtener todos los emails del acceso rápido
      const emails = this.accesoRapido.map(acceso => acceso.email);
      
      // Buscar los perfiles en la base de datos
      const perfiles = await this.authService.getPerfilesByEmails(emails);
      
      if (perfiles && perfiles.length > 0) {
        // Actualizar las fotos y nombres de los accesos rápidos
        this.accesoRapido = this.accesoRapido.map(acceso => {
          const perfil = perfiles.find((p: any) => p.email === acceso.email);
          if (perfil) {
            return {
              ...acceso,
              foto: perfil.imagen_perfil || acceso.foto,
              nombre: `${perfil.nombre} ${perfil.apellido}` || acceso.nombre
            };
          }
          return acceso;
        });
        
        console.log('✅ Fotos de acceso rápido cargadas:', this.accesoRapido.length);
      } else {
        console.log('⚠️ No se encontraron perfiles en la BD, usando fotos por defecto');
      }
    } catch (error) {
      console.error('❌ Error al cargar fotos de acceso rápido:', error);
      // Si hay error, mantener las fotos por defecto
    }
  }

  private mostrarMensaje(mensaje: string, esExito: boolean): void {
    this.mensaje = mensaje;
    this.esExito = esExito;
  }

  private limpiarMensajes(): void {
    this.mensaje = '';
  }
}
