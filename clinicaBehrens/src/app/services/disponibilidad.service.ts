import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Disponibilidad } from '../models/disponibilidad.model';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class DisponibilidadService {
  constructor(private supabaseService: SupabaseService) {}

  getDisponibilidadPorEspecialista(especialistaId: string): Observable<Disponibilidad[]> {
    return from(
      this.supabaseService.getSupabase()
        .from('disponibilidad')
        .select('*')
        .eq('especialista_id', especialistaId)
    ).pipe(
      // @ts-ignore
      map(res => res.data as Disponibilidad[])
    );
  }

  agregarDisponibilidad(d: Disponibilidad): Promise<any> {
    return Promise.resolve(
      this.supabaseService.getSupabase()
        .from('disponibilidad')
        .insert([d])
    );
  }

  eliminarDisponibilidad(id: string): Promise<any> {
    return Promise.resolve(
      this.supabaseService.getSupabase()
        .from('disponibilidad')
        .delete()
        .eq('id', id)
    );
  }
} 