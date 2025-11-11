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
    console.log('🔍 [TurnosService] Buscando turnos para paciente:', pacienteId);
    return from(
      this.supabaseService.getSupabase()
        .from('turnos')
        .select('*')
        .eq('pacienteid', pacienteId)
    ).pipe(
      // @ts-ignore
      map((res) => {
        console.log('📦 [TurnosService] Respuesta de Supabase:', res);
        if (res.error) {
          console.error('❌ [TurnosService] Error:', res.error);
        }
        const turnos = res.data as Turno[];
        console.log('✅ [TurnosService] Turnos encontrados:', turnos?.length || 0);
        return turnos;
      })
    );
  }

  // Obtener turnos por especialista
  getTurnosPorEspecialista(especialistaId: string): Observable<Turno[]> {
    console.log('🔍 [TurnosService] Buscando turnos para especialista:', especialistaId);
    return from(
      this.supabaseService.getSupabase()
        .from('turnos')
        .select('*')
        .eq('especialistaid', especialistaId)
    ).pipe(
      // @ts-ignore
      map((res) => {
        console.log('📦 [TurnosService] Respuesta de Supabase:', res);
        if (res.error) {
          console.error('❌ [TurnosService] Error:', res.error);
        }
        const turnos = res.data as Turno[];
        console.log('✅ [TurnosService] Turnos encontrados:', turnos?.length || 0);
        return turnos;
      })
    );
  }

  // Obtener todos los turnos (para administrador)
  getTodosLosTurnos(): Observable<Turno[]> {
    console.log('🔍 [TurnosService] Obteniendo TODOS los turnos...');
    return from(
      this.supabaseService.getSupabase()
        .from('turnos')
        .select('*')
        .order('fecha', { ascending: false })
    ).pipe(
      // @ts-ignore
      map((res) => {
        console.log('📦 [TurnosService] Respuesta de Supabase:', res);
        if (res.error) {
          console.error('❌ [TurnosService] Error:', res.error);
        }
        const turnos = res.data as Turno[];
        console.log('✅ [TurnosService] Total de turnos encontrados:', turnos?.length || 0);
        return turnos;
      })
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
  async solicitarTurno(turno: any): Promise<any> {
    console.log('🔵 [TurnosService] Intentando insertar turno:', turno);
    
    const { data, error } = await this.supabaseService.getSupabase()
      .from('turnos')
      .insert([turno])
      .select();
    
    if (error) {
      console.error('❌ [TurnosService] Error al insertar turno:', error);
      throw error;
    }
    
    console.log('✅ [TurnosService] Turno insertado correctamente:', data);
    return data;
  }

  // Cancelar turno (paciente o especialista)
  cancelarTurno(turnoId: string, comentario: string): Promise<any> {
    return Promise.resolve(
      this.supabaseService.getSupabase()
        .from('turnos')
        .update({ estado: 'cancelado', comentariopaciente: comentario })
        .eq('id', turnoId)
    );
  }

  // Rechazar turno (especialista)
  rechazarTurno(turnoId: string, comentario: string): Promise<any> {
    return Promise.resolve(
      this.supabaseService.getSupabase()
        .from('turnos')
        .update({ estado: 'rechazado', comentarioespecialista: comentario })
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
        .update({ calificacionatencion: { puntaje, comentario } })
        .eq('id', turnoId)
    );
  }

  // Completar encuesta (paciente)
  completarEncuesta(turnoId: string, comentario: string, estrellas: number): Promise<any> {
    return Promise.resolve(
      this.supabaseService.getSupabase()
        .from('turnos')
        .update({ 
          encuestacompletada: true,
          encuestacomentario: comentario,
          encuestaestrellas: estrellas
        })
        .eq('id', turnoId)
    );
  }
} 