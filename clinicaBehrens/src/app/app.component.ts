import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RegistroService } from './services/registro.service';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: [
    trigger('routeFade', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease', style({ opacity: 0, transform: 'translateY(-20px)' }))
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
