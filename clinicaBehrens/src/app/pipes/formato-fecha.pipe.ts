import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatoFecha',
  standalone: true
})
export class FormatoFechaPipe implements PipeTransform {
  transform(value: string | Date, formato: string = 'customDiaMesAnioDia'): string {
    if (!value) return '';
    
    let fecha: Date;
    
    if (typeof value === 'string') {
      // Si viene en formato "YYYY-MM-DD (Dia)"
      const match = /^(\d{4}-\d{2}-\d{2})/.exec(value);
      if (match) {
        fecha = new Date(match[1] + 'T00:00:00');
      } else {
        fecha = new Date(value);
      }
    } else {
      fecha = value;
    }
    
    if (isNaN(fecha.getTime())) {
      return value.toString();
    }
    
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const anio = fecha.getFullYear();
    const nombreDia = dias[fecha.getDay()];
    
    switch (formato) {
      case 'customDiaMesAnioDia':
        return `${dia} de ${mes} de ${anio} (${nombreDia})`;
      case 'corta':
        return `${dia}/${fecha.getMonth() + 1}/${anio}`;
      case 'larga':
        return `${nombreDia}, ${dia} de ${mes} de ${anio}`;
      default:
        return fecha.toLocaleDateString('es-AR');
    }
  }
}

