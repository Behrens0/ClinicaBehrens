import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-paciente',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <h1>Dashboard Paciente</h1>
      <p>Bienvenido al dashboard de pacientes</p>
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
export class DashboardPacienteComponent {
} 