import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { LogIngreso } from '../models/log.model';
import { Observable, from, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LogService {
  constructor(private supabaseService: SupabaseService) {}

  // Registrar ingreso al sistema
  async registrarIngreso(usuarioId: string, usuarioNombre: string, usuarioTipo: string): Promise<void> {
    const log: Omit<LogIngreso, 'id' | 'created_at'> = {
      usuario_id: usuarioId,
      usuario_nombre: usuarioNombre,
      usuario_tipo: usuarioTipo,
      fecha_hora: new Date().toISOString()
    };

    const { error } = await this.supabaseService.getSupabase()
      .from('logs_ingresos')
      .insert([log]);

    if (error) {
      console.error('Error al registrar ingreso:', error);
    }
  }

  // Obtener todos los logs
  getLogs(): Observable<LogIngreso[]> {
    return from(
      this.supabaseService.getSupabase()
        .from('logs_ingresos')
        .select('*')
        .order('fecha_hora', { ascending: false })
    ).pipe(
      map((res: any) => res.data as LogIngreso[] || [])
    );
  }

  // Obtener logs por rango de fechas
  getLogsPorFecha(fechaInicio: string, fechaFin: string): Observable<LogIngreso[]> {
    return from(
      this.supabaseService.getSupabase()
        .from('logs_ingresos')
        .select('*')
        .gte('fecha_hora', fechaInicio)
        .lte('fecha_hora', fechaFin)
        .order('fecha_hora', { ascending: false })
    ).pipe(
      map((res: any) => res.data as LogIngreso[] || [])
    );
  }
}

