import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Especialidad } from '../models/usuario.model';
import { Observable, from, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EspecialidadesService {
  
  constructor(private supabaseService: SupabaseService) {}

  // Obtener todas las especialidades activas
  getEspecialidades(): Observable<Especialidad[]> {
    return from(
      this.supabaseService.getSupabase()
        .from('especialidades')
        .select('*')
        .eq('activa', true)
        .order('nombre')
    ).pipe(
      map((response: any) => response.data || [])
    );
  }

  // Agregar una nueva especialidad
  agregarEspecialidad(especialidad: Omit<Especialidad, 'id'>): Observable<Especialidad> {
    return from(
      this.supabaseService.getSupabase()
        .from('especialidades')
        .insert([especialidad])
        .select()
        .single()
    ).pipe(
      map((response: any) => response.data)
    );
  }

  // Verificar si una especialidad existe
  verificarEspecialidad(nombre: string): Observable<boolean> {
    return from(
      this.supabaseService.getSupabase()
        .from('especialidades')
        .select('id')
        .eq('nombre', nombre.toLowerCase())
        .eq('activa', true)
        .single()
    ).pipe(
      map((response: any) => !!response.data)
    );
  }
} 