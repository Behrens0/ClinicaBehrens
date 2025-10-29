export interface Disponibilidad {
  id?: string;
  especialista_id: string;
  especialidad: string;
  dia: string; // Ej: 'Lunes'
  hora_inicio: string; // '08:00'
  hora_fin: string;    // '12:00'
} 