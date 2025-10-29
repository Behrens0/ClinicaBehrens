export interface Turno {
  id: string;
  pacienteId: string;
  pacienteNombre: string;
  especialistaId: string;
  especialistaNombre: string;
  especialidad: string;
  fecha: string; // ISO
  estado: 'pendiente' | 'aceptado' | 'realizado' | 'cancelado' | 'rechazado';
  comentarioPaciente?: string;
  comentarioEspecialista?: string;
  encuestaCompletada?: boolean;
  calificacionAtencion?: {
    puntaje: number;
    comentario: string;
  };
  resena?: string;
} 