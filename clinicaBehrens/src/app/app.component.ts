import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RegistroService } from './services/registro.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LoadingSpinnerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: [
    // Animación 1: Fade con desplazamiento vertical
    trigger('routeFade', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ]),
    // Animación 2: Slide desde la derecha con zoom
    trigger('routeSlide', [
      transition('* <=> *', [
        style({ opacity: 0, transform: 'translateX(100%) scale(0.9)' }),
        animate('500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)', 
          style({ opacity: 1, transform: 'translateX(0) scale(1)' }))
      ])
    ])
  ]
})
export class AppComponent implements OnInit {
  title = 'clinicaBehrens';
  mostrarNavbar = false;
  usuarioLogueado = false;
  nombreUsuario = '';
  tipoUsuario = '';
  avatarUsuario = '';
  
  // Rutas donde NO se debe mostrar la navbar
  private rutasPublicas = ['/', '/login', '/registro', '/home'];

  constructor(
    private registroService: RegistroService, 
    private router: Router
  ) {}

  async ngOnInit() {
    // Verificar sesión al cargar
    await this.verificarSesion();
    this.actualizarMostrarNavbar(); // Actualizar navbar en carga inicial
    
    // Escuchar cambios de ruta
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(async () => {
        await this.verificarSesion();
        this.actualizarMostrarNavbar();
      });
  }

  private async verificarSesion() {
    try {
      const { data: { session } } = await this.registroService.getSesionActual();
      
      if (session && session.user) {
        this.usuarioLogueado = true;
        
        // Obtener datos del perfil
        const perfil = await this.registroService.getPerfilPorUserId(session.user.id);
        if (perfil) {
          this.nombreUsuario = `${perfil.nombre} ${perfil.apellido}`;
          this.tipoUsuario = perfil.tipo;
          this.avatarUsuario = perfil.imagen_perfil || '';
          console.log('✅ Usuario logueado:', this.nombreUsuario, '- Tipo:', this.tipoUsuario);
        }
      } else {
        this.usuarioLogueado = false;
        this.nombreUsuario = '';
        this.tipoUsuario = '';
        this.avatarUsuario = '';
        console.log('❌ No hay sesión activa');
      }
    } catch (error) {
      console.error('❌ Error al verificar sesión:', error);
      this.usuarioLogueado = false;
    }
  }

  private actualizarMostrarNavbar() {
    const rutaActual = this.router.url;
    this.mostrarNavbar = !this.rutasPublicas.some(ruta => rutaActual === ruta);
    console.log('🔍 Ruta actual:', rutaActual, '| Mostrar navbar:', this.mostrarNavbar, '| Usuario logueado:', this.usuarioLogueado);
  }

  async logout() {
    try {
      await this.registroService.cerrarSesion();
      this.usuarioLogueado = false;
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  irAInicio() {
    // Redirigir según el tipo de usuario
    if (this.tipoUsuario === 'administrador') {
      this.router.navigate(['/dashboard-admin']);
    } else if (this.tipoUsuario === 'especialista') {
      this.router.navigate(['/dashboard-especialista']);
    } else if (this.tipoUsuario === 'paciente') {
      this.router.navigate(['/dashboard-paciente']);
    } else {
      this.router.navigate(['/home']);
    }
  }

  irAPerfil() {
    this.router.navigate(['/mi-perfil']);
  }
}
