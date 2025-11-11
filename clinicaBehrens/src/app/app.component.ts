import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RegistroService } from './services/registro.service';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';

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
export class AppComponent {
  title = 'clinicaBehrens';

  constructor(private registroService: RegistroService, private router: Router) {}

  async logout() {
    await this.registroService.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
