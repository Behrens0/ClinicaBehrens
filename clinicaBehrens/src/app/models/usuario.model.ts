export interface Usuario {
  id?: string;
  nombre: string;
  apellido: string;
  edad: number;
  dni: string;
  email: string;
  password: string;
  tipo: 'paciente' | 'especialista' | 'administrador';
  imagenPerfil?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Paciente extends Usuario {
  tipo: 'paciente';
  obraSocial: string;
  imagenPerfil2?: string;
}

export interface Especialista extends Usuario {
  tipo: 'especialista';
  especialidad: string;
}

export interface Administrador extends Usuario {
  tipo: 'administrador';
}

export interface Especialidad {
  id?: string;
  nombre: string;
  descripcion?: string;
  activa: boolean;
} 