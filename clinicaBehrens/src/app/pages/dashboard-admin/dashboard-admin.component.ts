import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RegistroService } from '../../services/registro.service';
import * as XLSX from 'xlsx';

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

  // Habilitar/Inhabilitar acceso al sistema
  async habilitarEspecialista(especialista: any) {
    if (!confirm(`¿Estás seguro que deseas habilitar el acceso de ${especialista.nombre} ${especialista.apellido}?`)) {
      return;
    }

    try {
      // Cambiar estado a aprobado y no rechazado
      const { error } = await this.registroService.getSupabase()
        .from('perfiles')
        .update({ 
          aprobado: true,
          rechazado: false
        })
        .eq('user_id', especialista.user_id);

      if (error) throw error;

      // Actualizar listas
      await this.cargarUsuarios();
      await this.cargarEspecialistasPendientes();

      alert('Especialista habilitado exitosamente');
    } catch (error) {
      console.error('Error habilitando especialista:', error);
      alert('Error al habilitar especialista');
    }
  }

  async inhabilitarEspecialista(especialista: any) {
    if (!confirm(`¿Estás seguro que deseas inhabilitar el acceso de ${especialista.nombre} ${especialista.apellido}?\n\nEsto bloqueará su acceso al sistema.`)) {
      return;
    }

    try {
      // Cambiar estado a no aprobado (mantener rechazado en false para diferenciarlo)
      const { error } = await this.registroService.getSupabase()
        .from('perfiles')
        .update({ 
          aprobado: false
        })
        .eq('user_id', especialista.user_id);

      if (error) throw error;

      // Actualizar listas
      await this.cargarUsuarios();
      await this.cargarEspecialistasPendientes();

      alert('Especialista inhabilitado. Ya no podrá acceder al sistema.');
    } catch (error) {
      console.error('Error inhabilitando especialista:', error);
      alert('Error al inhabilitar especialista');
    }
  }

  descargarExcelUsuarios() {
    // Preparar datos para Excel
    const datosExcel = this.usuarios.map(u => ({
      'Tipo': u.tipo,
      'Nombre': u.nombre,
      'Apellido': u.apellido,
      'DNI': u.dni || '',
      'Email': u.email,
      'Especialidad': u.especialidad || '-',
      'Obra Social': u.obra_social || '-',
      'Estado': u.tipo === 'especialista' ? (u.aprobado ? 'Aprobado' : (u.rechazado ? 'Rechazado' : 'Pendiente')) : '-'
    }));

    // Crear hoja de cálculo
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosExcel);
    
    // Crear libro de trabajo
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');
    
    // Generar archivo Excel
    const fecha = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `usuarios-clinica-${fecha}.xlsx`);
  }
}
