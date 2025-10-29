import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RegistroService } from '../../services/registro.service';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.scss']
})
export class DashboardAdminComponent implements OnInit {
  usuarios: any[] = [];
  especialistasPendientes: any[] = [];
  isLoading = false;

  constructor(private registroService: RegistroService) {}

  async ngOnInit() {
    await this.cargarUsuarios();
    await this.cargarEspecialistasPendientes();
  }

  async cargarUsuarios() {
    try {
      this.isLoading = true;
      const { data, error } = await this.registroService.getSupabase()
        .from('perfiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      this.usuarios = data || [];
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async cargarEspecialistasPendientes() {
    try {
      const { data, error } = await this.registroService.getSupabase()
        .from('perfiles')
        .select('*')
        .eq('tipo', 'especialista')
        .eq('aprobado', false)
        .eq('rechazado', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      this.especialistasPendientes = data || [];
    } catch (error) {
      console.error('Error cargando especialistas pendientes:', error);
    }
  }

  getUsuariosPorTipo(tipo: string): any[] {
    return this.usuarios.filter(u => u.tipo === tipo);
  }

  async aprobarEspecialista(especialista: any) {
    try {
      const { error } = await this.registroService.getSupabase()
        .from('perfiles')
        .update({ aprobado: true })
        .eq('user_id', especialista.user_id);

      if (error) throw error;

      // Actualizar listas
      await this.cargarUsuarios();
      await this.cargarEspecialistasPendientes();

      alert('Especialista aprobado exitosamente');
    } catch (error) {
      console.error('Error aprobando especialista:', error);
      alert('Error al aprobar especialista');
    }
  }

  async rechazarEspecialista(especialista: any) {
    try {
      const { error } = await this.registroService.getSupabase()
        .from('perfiles')
        .update({ rechazado: true })
        .eq('user_id', especialista.user_id);

      if (error) throw error;

      // Actualizar listas
      await this.cargarUsuarios();
      await this.cargarEspecialistasPendientes();

      alert('Especialista rechazado');
    } catch (error) {
      console.error('Error rechazando especialista:', error);
      alert('Error al rechazar especialista');
    }
  }

  async desaprobarEspecialista(especialista: any) {
    try {
      const { error } = await this.registroService.getSupabase()
        .from('perfiles')
        .update({ aprobado: false })
        .eq('user_id', especialista.user_id);

      if (error) throw error;

      // Actualizar listas
      await this.cargarUsuarios();
      await this.cargarEspecialistasPendientes();

      alert('Especialista desaprobado');
    } catch (error) {
      console.error('Error desaprobando especialista:', error);
      alert('Error al desaprobar especialista');
    }
  }

  getEstadoEspecialista(usuario: any): string {
    if (usuario.tipo !== 'especialista') return '';
    
    if (usuario.rechazado) {
      return 'status-rechazado';
    } else if (usuario.aprobado) {
      return 'status-aprobado';
    } else {
      return 'status-pendiente';
    }
  }

  getEstadoEspecialistaTexto(usuario: any): string {
    if (usuario.tipo !== 'especialista') return '';
    
    if (usuario.rechazado) {
      return 'Rechazado';
    } else if (usuario.aprobado) {
      return 'Aprobado';
    } else {
      return 'Pendiente';
    }
  }
}
