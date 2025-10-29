import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <h1>Dashboard General</h1>
      <p>Bienvenido al dashboard general</p>
      <p>Esta página está en desarrollo...</p>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;
      text-align: center;
    }
  `]
})
export class DashboardComponent {
} 