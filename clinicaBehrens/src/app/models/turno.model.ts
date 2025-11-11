export interface Turno {
  id: string;
  pacienteid: string;
  pacientenombre: string;
  especialistaid: string;
  especialistanombre: string;
  especialidad: string;
  fecha: string; // ISO timestamp
  estado: 'pendiente' | 'aceptado' | 'realizado' | 'cancelado' | 'rechazado';
  comentariopaciente?: string;
  comentarioespecialista?: string;
  encuestacompletada?: boolean;
  encuestacomentario?: string;
  encuestaestrellas?: number;
  calificacionatencion?: {
    puntaje: number;
    comentario: string;
  };
  resena?: string;
  created_at?: string;
  updated_at?: string;
} 