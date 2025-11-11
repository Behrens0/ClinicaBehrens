import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'estadoTurno',
  standalone: true
})
export class EstadoTurnoPipe implements PipeTransform {
  transform(value: string): string {
    const estados: {[key: string]: string} = {
      'pendiente': 'Pendiente',
      'confirmado': 'Confirmado',
      'aceptado': 'Aceptado',
      'realizado': 'Realizado',
      'rechazado': 'Rechazado',
      'cancelado': 'Cancelado'
    };
    
    return estados[value] || value;
  }
}

