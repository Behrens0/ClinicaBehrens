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
  async getHistoriasPorPacienteAsync(pacienteId: string): Promise<any[]> {
    console.log('🔵 [HistoriaClinicaService] === OBTENER HISTORIAS POR PACIENTE ===');
    console.log('📋 [HistoriaClinicaService] Paciente ID:', pacienteId);
    
    try {
      // 1. Obtener historias clínicas
      const { data: historias, error: errorHistorias } = await this.supabaseService.getSupabase()
        .from('historias_clinicas')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('fecha_atencion', { ascending: false });
      
      if (errorHistorias) {
        console.error('❌ [HistoriaClinicaService] Error al obtener historias:', errorHistorias);
        throw errorHistorias;
      }
      
      console.log('📋 [HistoriaClinicaService] Historias encontradas:', historias);
      console.log('📊 [HistoriaClinicaService] Cantidad:', historias?.length || 0);
      
      if (!historias || historias.length === 0) {
        return [];
      }
      
      // 2. Obtener IDs únicos de especialistas
      const especialistaIds = [...new Set(historias.map(h => h.especialista_id))];
      console.log('👨‍⚕️ [HistoriaClinicaService] IDs de especialistas:', especialistaIds);
      
      // 3. Obtener datos de especialistas
      const { data: especialistas, error: errorEsp } = await this.supabaseService.getSupabase()
        .from('perfiles')
        .select('user_id, nombre, apellido, email, tipo')
        .in('user_id', especialistaIds);
      
      if (errorEsp) {
        console.error('❌ [HistoriaClinicaService] Error al obtener especialistas:', errorEsp);
      }
      
      console.log('👨‍⚕️ [HistoriaClinicaService] Especialistas encontrados:', especialistas);
      
      // 4. Combinar datos
      const historiasCompletas = historias.map(historia => {
        const especialista = especialistas?.find(e => e.user_id === historia.especialista_id);
        return {
          historia,
          especialista: especialista || null,
          paciente: null,
          turno: null
        };
      });
      
      console.log('✅ [HistoriaClinicaService] Historias completas:', historiasCompletas);
      
      return historiasCompletas;
    } catch (error: any) {
      console.error('❌ [HistoriaClinicaService] Error crítico:', error);
      throw error;
    }
  }
  
  // Obtener historias clínicas de un paciente (versión Observable para compatibilidad)
  getHistoriasPorPaciente(pacienteId: string): Observable<any[]> {
    return from(this.getHistoriasPorPacienteAsync(pacienteId));
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
  async getTodasHistoriasAsync(): Promise<any[]> {
    console.log('🔵 [HistoriaClinicaService] === OBTENER TODAS LAS HISTORIAS (ADMIN) ===');
    
    try {
      // 1. Obtener todas las historias clínicas
      const { data: historias, error: errorHistorias } = await this.supabaseService.getSupabase()
        .from('historias_clinicas')
        .select('*')
        .order('fecha_atencion', { ascending: false });
      
      if (errorHistorias) {
        console.error('❌ [HistoriaClinicaService] Error al obtener historias:', errorHistorias);
        throw errorHistorias;
      }
      
      console.log('📋 [HistoriaClinicaService] Historias encontradas:', historias);
      console.log('📊 [HistoriaClinicaService] Cantidad:', historias?.length || 0);
      
      if (!historias || historias.length === 0) {
        return [];
      }
      
      // 2. Obtener IDs únicos de pacientes y especialistas
      const pacienteIds = [...new Set(historias.map(h => h.paciente_id))];
      const especialistaIds = [...new Set(historias.map(h => h.especialista_id))];
      
      console.log('👥 [HistoriaClinicaService] IDs de pacientes:', pacienteIds);
      console.log('👨‍⚕️ [HistoriaClinicaService] IDs de especialistas:', especialistaIds);
      
      // 3. Obtener datos de pacientes
      const { data: pacientes, error: errorPac } = await this.supabaseService.getSupabase()
        .from('perfiles')
        .select('user_id, nombre, apellido, email, tipo, dni, edad, obra_social')
        .in('user_id', pacienteIds);
      
      if (errorPac) {
        console.error('❌ [HistoriaClinicaService] Error al obtener pacientes:', errorPac);
      }
      
      // 4. Obtener datos de especialistas
      const { data: especialistas, error: errorEsp } = await this.supabaseService.getSupabase()
        .from('perfiles')
        .select('user_id, nombre, apellido, email, tipo, especialidad')
        .in('user_id', especialistaIds);
      
      if (errorEsp) {
        console.error('❌ [HistoriaClinicaService] Error al obtener especialistas:', errorEsp);
      }
      
      console.log('👥 [HistoriaClinicaService] Pacientes encontrados:', pacientes?.length || 0);
      console.log('👨‍⚕️ [HistoriaClinicaService] Especialistas encontrados:', especialistas?.length || 0);
      
      // 5. Combinar datos
      const historiasCompletas = historias.map(historia => {
        const paciente = pacientes?.find(p => p.user_id === historia.paciente_id);
        const especialista = especialistas?.find(e => e.user_id === historia.especialista_id);
        return {
          historia,
          paciente: paciente || null,
          especialista: especialista || null,
          turno: null
        };
      });
      
      console.log('✅ [HistoriaClinicaService] Historias completas:', historiasCompletas.length);
      
      return historiasCompletas;
    } catch (error: any) {
      console.error('❌ [HistoriaClinicaService] Error crítico:', error);
      throw error;
    }
  }
  
  // Obtener todas las historias clínicas (versión Observable para compatibilidad)
  getTodasHistorias(): Observable<any[]> {
    return from(this.getTodasHistoriasAsync());
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