export interface HistoriaClinica {
  id?: string;
  paciente_id: string;
  especialista_id: string;
  turno_id: string;
  fecha_atencion: string;
  altura: number;
  peso: number;
  temperatura: number;
  presion: string;
  datos_dinamicos: DatoDinamico[];
  created_at?: string;
  updated_at?: string;
}

export interface DatoDinamico {
  clave: string;
  valor: string;
}

export interface HistoriaClinicaCompleta {
  historia: HistoriaClinica;
  paciente: any;
  especialista: any;
  turno: any;
} 