import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Turno } from '../models/turno.model';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TurnosService {
  constructor(private supabaseService: SupabaseService) {}

  // Obtener turnos por paciente
  getTurnosPorPaciente(pacienteId: string): Observable<Turno[]> {
    return from(
      this.supabaseService.getSupabase()
        .from('turnos')
        .select('*')
        .eq('pacienteId', pacienteId)
    ).pipe(
      // @ts-ignore
      map((res) => res.data as Turno[])
    );
  }

  // Obtener turnos por especialista
  getTurnosPorEspecialista(especialistaId: string): Observable<Turno[]> {
    return from(
      this.supabaseService.getSupabase()
        .from('turnos')
        .select('*')
        .eq('especialistaId', especialistaId)
    ).pipe(
      // @ts-ignore
      map((res) => res.data as Turno[])
    );
  }

  // Obtener todos los turnos (para administrador)
  getTodosLosTurnos(): Observable<Turno[]> {
    return from(
      this.supabaseService.getSupabase()
        .from('turnos')
        .select('*')
    ).pipe(
      // @ts-ignore
      map((res) => res.data as Turno[])
    );
  }

  // Obtener un turno por id
  getTurnoPorId(turnoId: string): Observable<Turno> {
    return from(
      this.supabaseService.getSupabase()
        .from('turnos')
        .select('*')
        .eq('id', turnoId)
        .single()
    ).pipe(
      map((res: any) => res.data as Turno)
    );
  }

  // Solicitar un nuevo turno
  solicitarTurno(turno: any): Promise<any> {
    return Promise.resolve(
      this.supabaseService.getSupabase()
        .from('turnos')
        .insert([turno])
    );
  }

  // Cancelar turno (paciente o especialista)
  cancelarTurno(turnoId: string, comentario: string): Promise<any> {
    return Promise.resolve(
      this.supabaseService.getSupabase()
        .from('turnos')
        .update({ estado: 'cancelado', comentarioPaciente: comentario })
        .eq('id', turnoId)
    );
  }

  // Rechazar turno (especialista)
  rechazarTurno(turnoId: string, comentario: string): Promise<any> {
    return Promise.resolve(
      this.supabaseService.getSupabase()
        .from('turnos')
        .update({ estado: 'rechazado', comentarioEspecialista: comentario })
        .eq('id', turnoId)
    );
  }

  // Aceptar turno (especialista)
  aceptarTurno(turnoId: string): Promise<any> {
    return Promise.resolve(
      this.supabaseService.getSupabase()
        .from('turnos')
        .update({ estado: 'aceptado' })
        .eq('id', turnoId)
    );
  }

  // Finalizar turno (especialista)
  finalizarTurno(turnoId: string, reseña: string): Promise<any> {
    return Promise.resolve(
      this.supabaseService.getSupabase()
        .from('turnos')
        .update({ estado: 'realizado', reseña })
        .eq('id', turnoId)
    );
  }

  // Calificar atención (paciente)
  calificarAtencion(turnoId: string, puntaje: number, comentario: string): Promise<any> {
    return Promise.resolve(
      this.supabaseService.getSupabase()
        .from('turnos')
        .update({ calificacionAtencion: { puntaje, comentario } })
        .eq('id', turnoId)
    );
  }

  // Completar encuesta (paciente)
  completarEncuesta(turnoId: string): Promise<any> {
    return Promise.resolve(
      this.supabaseService.getSupabase()
        .from('turnos')
        .update({ encuestaCompletada: true })
        .eq('id', turnoId)
    );
  }
} 