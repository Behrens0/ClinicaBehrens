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
    console.log('🔵 [HistoriaClinicaService] === INICIO CREAR HISTORIA CLÍNICA ===');
    console.log('📋 [HistoriaClinicaService] Historia recibida:', historia);
    console.log('📋 [HistoriaClinicaService] Historia JSON:', JSON.stringify(historia, null, 2));
    console.log('📋 [HistoriaClinicaService] Tipos de datos:', {
      paciente_id: typeof historia.paciente_id,
      especialista_id: typeof historia.especialista_id,
      turno_id: typeof historia.turno_id,
      altura: typeof historia.altura,
      peso: typeof historia.peso,
      temperatura: typeof historia.temperatura,
      presion: typeof historia.presion,
      altura_value: historia.altura,
      peso_value: historia.peso,
      temperatura_value: historia.temperatura
    });

    const dataToInsert = {
      ...historia,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('📤 [HistoriaClinicaService] Datos a insertar:', dataToInsert);
    console.log('📤 [HistoriaClinicaService] Datos a insertar JSON:', JSON.stringify(dataToInsert, null, 2));

    try {
      const { data, error } = await this.supabaseService.getSupabase()
        .from('historias_clinicas')
        .insert([dataToInsert])
        .select()
        .single();

      if (error) {
        console.error('❌ [HistoriaClinicaService] Error al insertar:', error);
        console.error('❌ [HistoriaClinicaService] Error message:', error.message);
        console.error('❌ [HistoriaClinicaService] Error details:', error.details);
        console.error('❌ [HistoriaClinicaService] Error hint:', error.hint);
        console.error('❌ [HistoriaClinicaService] Error code:', error.code);
        throw error;
      }

      console.log('✅ [HistoriaClinicaService] Historia clínica creada exitosamente:', data);
      console.log('✅ [HistoriaClinicaService] === FIN CREAR HISTORIA CLÍNICA ===');
      return data;
    } catch (error: any) {
      console.error('❌ [HistoriaClinicaService] === ERROR CRÍTICO ===');
      console.error('❌ [HistoriaClinicaService] Error:', error);
      console.error('❌ [HistoriaClinicaService] Error stack:', error?.stack);
      throw error;
    }
  }

  // Obtener historias clínicas de un paciente
  getHistoriasPorPaciente(pacienteId: string): Observable<any[]> {
    console.log('🔵 [HistoriaClinicaService] === OBTENER HISTORIAS POR PACIENTE ===');
    console.log('📋 [HistoriaClinicaService] Paciente ID:', pacienteId);
    
    return from(this.supabaseService.getSupabase()
      .from('historias_clinicas')
      .select(`
        *,
        especialista:perfiles!especialista_id(user_id, nombre, apellido, email, tipo),
        paciente:perfiles!paciente_id(user_id, nombre, apellido, email, tipo),
        turno:turnos(id, fecha, especialidad)
      `)
      .eq('paciente_id', pacienteId)
      .order('fecha_atencion', { ascending: false }))
      .pipe(
        map(({ data, error }) => {
          console.log('📤 [HistoriaClinicaService] Respuesta de Supabase:', { data, error });
          
          if (error) {
            console.error('❌ [HistoriaClinicaService] Error al obtener historias:', error);
            throw error;
          }
          
          console.log('📋 [HistoriaClinicaService] Historias encontradas:', data);
          console.log('📋 [HistoriaClinicaService] Cantidad de historias:', data?.length || 0);
          
          const historiasFormateadas = (data || []).map(d => {
            // Supabase devuelve los datos anidados, necesitamos extraerlos
            const { especialista, paciente, turno, ...historia } = d;
            return { 
              historia, 
              especialista: especialista || null, 
              paciente: paciente || null, 
              turno: turno || null 
            };
          });
          
          console.log('✅ [HistoriaClinicaService] Historias formateadas:', historiasFormateadas);
          
          return historiasFormateadas;
        })
      );
  }

  // Obtener historias clínicas por especialista
  getHistoriasPorEspecialista(especialistaId: string): Observable<any[]> {
    return from(this.supabaseService.getSupabase()
      .from('historias_clinicas')
      .select('*')
      .eq('especialista_id', especialistaId)
      .order('fecha_atencion', { ascending: false }))
      .pipe(
        map(({ data, error }) => {
          if (error) {
            console.error('❌ Error al obtener historias:', error);
            throw error;
          }
          return (data || []).map(d => ({ historia: d, paciente: null, especialista: null, turno: null }));
        })
      );
  }

  // Obtener todas las historias clínicas (para administradores)
  getTodasHistorias(): Observable<any[]> {
    return from(this.supabaseService.getSupabase()
      .from('historias_clinicas')
      .select('*')
      .order('fecha_atencion', { ascending: false }))
      .pipe(
        map(({ data, error }) => {
          if (error) {
            console.error('❌ Error al obtener historias:', error);
            throw error;
          }
          return (data || []).map(d => ({ historia: d, paciente: null, especialista: null, turno: null }));
        })
      );
  }

  // Obtener pacientes atendidos por un especialista
  getPacientesAtendidosPorEspecialista(especialistaId: string): Observable<any[]> {
    console.log('🔵 [HistoriaClinicaService] === OBTENER PACIENTES ATENDIDOS ===');
    console.log('📋 [HistoriaClinicaService] Especialista ID:', especialistaId);
    
    return from(this.supabaseService.getSupabase()
      .from('historias_clinicas')
      .select('paciente_id')
      .eq('especialista_id', especialistaId))
      .pipe(
        map(({ data, error }) => {
          console.log('📤 [HistoriaClinicaService] Respuesta de Supabase:', { data, error });
          
          if (error) {
            console.error('❌ [HistoriaClinicaService] Error al obtener pacientes:', error);
            throw error;
          }
          
          console.log('📋 [HistoriaClinicaService] Historias encontradas:', data);
          console.log('📋 [HistoriaClinicaService] Cantidad de historias:', data?.length || 0);
          
          const pacienteIds = [...new Set(data?.map(h => h.paciente_id) || [])];
          
          console.log('✅ [HistoriaClinicaService] IDs únicos de pacientes:', pacienteIds);
          console.log('✅ [HistoriaClinicaService] Cantidad de pacientes únicos:', pacienteIds.length);
          
          return pacienteIds;
        })
      );
  }

  // Obtener historias clínicas de un paciente por un especialista específico
  getHistoriasPacientePorEspecialista(pacienteId: string, especialistaId: string): Observable<any[]> {
    return from(this.supabaseService.getSupabase()
      .from('historias_clinicas')
      .select('*')
      .eq('paciente_id', pacienteId)
      .eq('especialista_id', especialistaId)
      .order('fecha_atencion', { ascending: false }))
      .pipe(
        map(({ data, error }) => {
          if (error) {
            console.error('❌ Error al obtener historias:', error);
            throw error;
          }
          return (data || []).map(d => ({ historia: d, paciente: null, especialista: null, turno: null }));
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