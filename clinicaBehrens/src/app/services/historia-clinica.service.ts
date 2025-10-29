import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { HistoriaClinica, HistoriaClinicaCompleta } from '../models/historia-clinica.model';
import { Observable, from, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HistoriaClinicaService {

  constructor(private supabaseService: SupabaseService) {}

  // Crear nueva historia clínica
  async crearHistoriaClinica(historia: Omit<HistoriaClinica, 'id' | 'created_at' | 'updated_at'>): Promise<HistoriaClinica> {
    const { data, error } = await this.supabaseService.getSupabase()
      .from('historias_clinicas')
      .insert([{
        ...historia,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Obtener historias clínicas de un paciente
  getHistoriasPorPaciente(pacienteId: string): Observable<HistoriaClinicaCompleta[]> {
    return from(this.supabaseService.getSupabase()
      .from('historias_clinicas')
      .select(`
        *,
        paciente:perfiles!historias_clinicas_paciente_id_fkey(*),
        especialista:perfiles!historias_clinicas_especialista_id_fkey(*),
        turno:turnos(*)
      `)
      .eq('paciente_id', pacienteId)
      .order('fecha_atencion', { ascending: false }))
      .pipe(
        map(({ data, error }) => {
          if (error) throw error;
          return data || [];
        })
      );
  }

  // Obtener historias clínicas por especialista
  getHistoriasPorEspecialista(especialistaId: string): Observable<HistoriaClinicaCompleta[]> {
    return from(this.supabaseService.getSupabase()
      .from('historias_clinicas')
      .select(`
        *,
        paciente:perfiles!historias_clinicas_paciente_id_fkey(*),
        especialista:perfiles!historias_clinicas_especialista_id_fkey(*),
        turno:turnos(*)
      `)
      .eq('especialista_id', especialistaId)
      .order('fecha_atencion', { ascending: false }))
      .pipe(
        map(({ data, error }) => {
          if (error) throw error;
          return data || [];
        })
      );
  }

  // Obtener todas las historias clínicas (para administradores)
  getTodasHistorias(): Observable<HistoriaClinicaCompleta[]> {
    return from(this.supabaseService.getSupabase()
      .from('historias_clinicas')
      .select(`
        *,
        paciente:perfiles!historias_clinicas_paciente_id_fkey(*),
        especialista:perfiles!historias_clinicas_especialista_id_fkey(*),
        turno:turnos(*)
      `)
      .order('fecha_atencion', { ascending: false }))
      .pipe(
        map(({ data, error }) => {
          if (error) throw error;
          return data || [];
        })
      );
  }

  // Obtener pacientes atendidos por un especialista
  getPacientesAtendidosPorEspecialista(especialistaId: string): Observable<any[]> {
    return from(this.supabaseService.getSupabase()
      .from('historias_clinicas')
      .select('paciente_id')
      .eq('especialista_id', especialistaId))
      .pipe(
        map(({ data, error }) => {
          if (error) throw error;
          const pacienteIds = [...new Set(data?.map(h => h.paciente_id) || [])];
          return pacienteIds;
        })
      );
  }

  // Obtener historias clínicas de un paciente por un especialista específico
  getHistoriasPacientePorEspecialista(pacienteId: string, especialistaId: string): Observable<HistoriaClinicaCompleta[]> {
    return from(this.supabaseService.getSupabase()
      .from('historias_clinicas')
      .select(`
        *,
        paciente:perfiles!historias_clinicas_paciente_id_fkey(*),
        especialista:perfiles!historias_clinicas_especialista_id_fkey(*),
        turno:turnos(*)
      `)
      .eq('paciente_id', pacienteId)
      .eq('especialista_id', especialistaId)
      .order('fecha_atencion', { ascending: false }))
      .pipe(
        map(({ data, error }) => {
          if (error) throw error;
          return data || [];
        })
      );
  }

  // Actualizar historia clínica
  async actualizarHistoriaClinica(id: string, historia: Partial<HistoriaClinica>): Promise<HistoriaClinica> {
    const { data, error } = await this.supabaseService.getSupabase()
      .from('historias_clinicas')
      .update({
        ...historia,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Eliminar historia clínica
  async eliminarHistoriaClinica(id: string): Promise<void> {
    const { error } = await this.supabaseService.getSupabase()
      .from('historias_clinicas')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
} 