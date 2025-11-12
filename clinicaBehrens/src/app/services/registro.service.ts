import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Paciente, Especialista } from '../models/usuario.model';
import { Observable, from, map, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegistroService {
  
  constructor(private supabaseService: SupabaseService) {}

  // Registrar un paciente usando autenticación de Supabase
  async registrarPaciente(
    paciente: Omit<Paciente, 'id' | 'createdAt' | 'updatedAt'>,
    imagenPerfil1?: File,
    imagenPerfil2?: File
  ): Promise<any> {
    try {
      console.log('=== INICIO REGISTRO PACIENTE ===');
      console.log('Datos del paciente a registrar:', paciente);
      
      // 1. Crear usuario en Supabase Auth
      console.log('1. Creando usuario en Supabase Auth...');
      const { data: authData, error: authError } = await this.supabaseService.getSupabase().auth.signUp({
        email: paciente.email,
        password: paciente.password,
        options: {
          data: {
            nombre: paciente.nombre,
            apellido: paciente.apellido,
            tipo: 'paciente'
          }
        }
      });
      
      console.log('Auth Data:', authData);
      console.log('Auth Error:', authError);
      
      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) throw new Error('No se pudo obtener el ID del usuario');

      // 2. Subir imágenes a Supabase Storage
      let imagenPerfil1Url = paciente.imagenPerfil;
      let imagenPerfil2Url = paciente.imagenPerfil2;

      if (imagenPerfil1) {
        console.log('2a. Subiendo imagen de perfil 1...');
        imagenPerfil1Url = await this.subirImagenPerfil(imagenPerfil1, userId);
        console.log('Imagen 1 URL:', imagenPerfil1Url);
      }

      if (imagenPerfil2) {
        console.log('2b. Subiendo imagen de perfil 2...');
        imagenPerfil2Url = await this.subirImagenPerfil(imagenPerfil2, userId);
        console.log('Imagen 2 URL:', imagenPerfil2Url);
      }

      // 3. Preparar datos del perfil
      const perfilData = {
        user_id: userId,
        nombre: paciente.nombre,
        apellido: paciente.apellido,
        edad: paciente.edad,
        dni: paciente.dni,
        email: paciente.email,
        obra_social: paciente.obraSocial,
        tipo: 'paciente',
        imagen_perfil: imagenPerfil1Url,
        imagen_perfil2: imagenPerfil2Url,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('3. Datos del perfil a insertar:', perfilData);

      // 4. Guardar perfil en tabla personalizada
      console.log('4. Insertando perfil en tabla perfiles...');
      const { data: profileData, error: profileError } = await this.supabaseService.getSupabase()
        .from('perfiles')
        .insert([perfilData])
        .select()
        .single();

      console.log('Profile Data:', profileData);
      console.log('Profile Error:', profileError);

      if (profileError) {
        console.error('ERROR AL INSERTAR PERFIL:', profileError);
        throw profileError;
      }

      console.log('=== REGISTRO PACIENTE EXITOSO ===');
      return { authData, profileData };
    } catch (error) {
      console.error('=== ERROR EN REGISTRO PACIENTE ===');
      console.error('Error completo:', error);
      throw error;
    }
  }

  // Registrar un especialista usando autenticación de Supabase
  async registrarEspecialista(
    especialista: Omit<Especialista, 'id' | 'createdAt' | 'updatedAt'>,
    imagenPerfil?: File
  ): Promise<any> {
    try {
      console.log('=== INICIO REGISTRO ESPECIALISTA ===');
      console.log('Datos del especialista a registrar:', especialista);
      
      // 1. Crear usuario en Supabase Auth
      console.log('1. Creando usuario en Supabase Auth...');
      const { data: authData, error: authError } = await this.supabaseService.getSupabase().auth.signUp({
        email: especialista.email,
        password: especialista.password,
        options: {
          data: {
            nombre: especialista.nombre,
            apellido: especialista.apellido,
            tipo: 'especialista'
          }
        }
      });

      console.log('Auth Data:', authData);
      console.log('Auth Error:', authError);

      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) throw new Error('No se pudo obtener el ID del usuario');

      // 2. Subir imagen a Supabase Storage
      let imagenPerfilUrl = especialista.imagenPerfil;

      if (imagenPerfil) {
        console.log('2. Subiendo imagen de perfil...');
        imagenPerfilUrl = await this.subirImagenPerfil(imagenPerfil, userId);
        console.log('Imagen URL:', imagenPerfilUrl);
      }

      // 3. Preparar datos del perfil
      const perfilData = {
        user_id: userId,
        nombre: especialista.nombre,
        apellido: especialista.apellido,
        edad: especialista.edad,
        dni: especialista.dni,
        email: especialista.email,
        especialidad: especialista.especialidad,
        tipo: 'especialista',
        imagen_perfil: imagenPerfilUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('3. Datos del perfil a insertar:', perfilData);

      // 4. Guardar perfil en tabla personalizada
      console.log('4. Insertando perfil en tabla perfiles...');
      const { data: profileData, error: profileError } = await this.supabaseService.getSupabase()
        .from('perfiles')
        .insert([perfilData])
        .select()
        .single();

      console.log('Profile Data:', profileData);
      console.log('Profile Error:', profileError);

      if (profileError) {
        console.error('ERROR AL INSERTAR PERFIL:', profileError);
        throw profileError;
      }

      console.log('=== REGISTRO ESPECIALISTA EXITOSO ===');
      return { authData, profileData };
    } catch (error) {
      console.error('=== ERROR EN REGISTRO ESPECIALISTA ===');
      console.error('Error completo:', error);
      throw error;
    }
  }

  // Verificar si el email ya existe en Supabase Auth
  // Nota: Supabase Auth maneja automáticamente emails duplicados
  async verificarEmailExistente(email: string): Promise<boolean> {
    // Por ahora, retornamos false para permitir el registro
    // Supabase Auth lanzará un error si el email ya existe
    return false;
  }

  // Verificar si el DNI ya existe en la tabla de perfiles
  async verificarDNIExistente(dni: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabaseService.getSupabase()
        .from('perfiles')
        .select('id')
        .eq('dni', dni)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      
      return !!data;
    } catch (error) {
      console.error('Error verificando DNI:', error);
      return false;
    }
  }

  // Subir imagen de perfil a Supabase Storage
  async subirImagenPerfil(file: File, userId: string): Promise<string> {
    try {
      console.log('=== INICIO SUBIDA DE IMAGEN ===');
      console.log('📁 File:', file.name, '- Size:', (file.size / 1024).toFixed(2), 'KB');
      console.log('👤 User ID:', userId);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}_${Date.now()}.${fileExt}`;
      
      console.log('📝 File name final:', fileName);
      
      // Intentar subir archivo directamente
      console.log('⬆️ Subiendo archivo a Supabase Storage bucket "perfiles"...');
      const { data: uploadData, error: uploadError } = await this.supabaseService.getSupabase()
        .storage
        .from('perfiles')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true // Cambiar a true para permitir reemplazar si existe
        });

      console.log('📤 Upload Data:', uploadData);
      console.log('❌ Upload Error:', uploadError);

      if (uploadError) {
        console.error('🚨 ERROR AL SUBIR ARCHIVO:', uploadError);
        console.error('🚨 Error message:', uploadError.message);
        console.error('🚨 Error name:', uploadError.name);
        
        // Si falla la subida, usar una URL temporal para continuar con el registro
        console.log('⚠️ Usando URL temporal para continuar con el registro...');
        return `https://via.placeholder.com/150x150/cccccc/666666?text=Imagen+${fileExt?.toUpperCase()}`;
      }

      // Obtener URL pública
      console.log('🔗 Obteniendo URL pública...');
      const { data: urlData } = this.supabaseService.getSupabase()
        .storage
        .from('perfiles')
        .getPublicUrl(fileName);

      console.log('✅ URL pública obtenida:', urlData.publicUrl);
      console.log('=== ✅ SUBIDA DE IMAGEN EXITOSA ===\n');

      return urlData.publicUrl;
    } catch (error: any) {
      console.error('=== ❌ ERROR EN SUBIDA DE IMAGEN ===');
      console.error('🚨 Error completo:', error);
      console.error('🚨 Error message:', error?.message);
      console.error('🚨 Error name:', error?.name);
      
      // En caso de error, usar URL temporal
      console.log('⚠️ Usando URL temporal debido a error...');
      const fileExt = file.name.split('.').pop();
      return `https://via.placeholder.com/150x150/cccccc/666666?text=Imagen+${fileExt?.toUpperCase()}`;
    }
  }

  // Método para iniciar sesión
  async iniciarSesion(email: string, password: string): Promise<any> {
    try {
      console.log('=== INICIO DE SESIÓN ===');
      console.log('Email:', email);
      
      const { data, error } = await this.supabaseService.getSupabase().auth.signInWithPassword({
        email: email.toLowerCase(),
        password
      });

      console.log('Login Data:', data);
      console.log('Login Error:', error);

      if (error) throw error;
      
      // Obtener perfil del usuario
      if (data.user) {
        const { data: perfil, error: perfilError } = await this.supabaseService.getSupabase()
          .from('perfiles')
          .select('*')
          .eq('user_id', data.user.id)
          .single();

        console.log('Perfil del usuario:', perfil);
        console.log('Error del perfil:', perfilError);

        if (perfilError) throw perfilError;
        
        return { ...data, perfil };
      }

      return data;
    } catch (error) {
      console.error('=== ERROR EN INICIO DE SESIÓN ===');
      console.error('Error completo:', error);
      throw error;
    }
  }

  // Método para cerrar sesión
  async cerrarSesion(): Promise<void> {
    try {
      const { error } = await this.supabaseService.getSupabase().auth.signOut();
      if (error) throw error;
    } catch (error) {
      throw error;
    }
  }

  // Obtener usuario actual
  getUsuarioActual() {
    return this.supabaseService.getSupabase().auth.getUser();
  }

  // Obtener sesión actual
  getSesionActual() {
    return this.supabaseService.getSupabase().auth.getSession();
  }

  // Obtener instancia de Supabase
  getSupabase() {
    return this.supabaseService.getSupabase();
  }

  // Verificar si el usuario está verificado
  async verificarEstadoCuenta(userId: string): Promise<{ verificado: boolean; aprobado?: boolean; tipo?: string }> {
    try {
      const { data: perfil, error } = await this.supabaseService.getSupabase()
        .from('perfiles')
        .select('tipo, aprobado')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      // Para pacientes: solo necesitan estar verificados
      if (perfil.tipo === 'paciente') {
        return { verificado: true, tipo: 'paciente' };
      }

      // Para especialistas: necesitan estar verificados Y aprobados
      if (perfil.tipo === 'especialista') {
        return { 
          verificado: true, 
          aprobado: perfil.aprobado || false, 
          tipo: 'especialista' 
        };
      }

      return { verificado: true };
    } catch (error) {
      console.error('Error verificando estado de cuenta:', error);
      return { verificado: false };
    }
  }

  // Verificar si el email está confirmado
  async verificarEmailConfirmado(): Promise<boolean> {
    try {
      const { data: { user } } = await this.supabaseService.getSupabase().auth.getUser();
      return user?.email_confirmed_at ? true : false;
    } catch (error) {
      console.error('Error verificando email:', error);
      return false;
    }
  }

  // Obtener perfil por user_id
  async getPerfilPorUserId(userId: string): Promise<any> {
    try {
      const { data, error } = await this.supabaseService.getSupabase()
        .from('perfiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      return null;
    }
  }

  // Registrar un administrador usando autenticación de Supabase
  async registrarAdministrador(admin: any, imagenPerfil?: File): Promise<any> {
    try {
      console.log('=== INICIO REGISTRO ADMINISTRADOR ===');
      console.log('Datos del administrador a registrar:', admin);
      
      // 1. Crear usuario en Supabase Auth
      console.log('1. Creando usuario en Supabase Auth...');
      const { data: authData, error: authError } = await this.supabaseService.getSupabase().auth.signUp({
        email: admin.email,
        password: admin.password,
        options: {
          data: {
            nombre: admin.nombre,
            apellido: admin.apellido,
            tipo: 'administrador'
          }
        }
      });
      
      console.log('Auth Data:', authData);
      console.log('Auth Error:', authError);
      
      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) throw new Error('No se pudo obtener el ID del usuario');

      // 2. Subir imagen a Supabase Storage
      let imagenPerfilUrl = admin.imagenPerfil;

      if (imagenPerfil) {
        console.log('2. Subiendo imagen de perfil...');
        imagenPerfilUrl = await this.subirImagenPerfil(imagenPerfil, userId);
        console.log('Imagen URL:', imagenPerfilUrl);
      }

      // 3. Preparar datos del perfil
      const perfilData = {
        user_id: userId,
        nombre: admin.nombre,
        apellido: admin.apellido,
        edad: admin.edad,
        dni: admin.dni,
        email: admin.email,
        tipo: 'administrador',
        imagen_perfil: imagenPerfilUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('3. Datos del perfil a insertar:', perfilData);

      // 4. Guardar perfil en tabla personalizada
      console.log('4. Insertando perfil en tabla perfiles...');
      const { data: profileData, error: profileError } = await this.supabaseService.getSupabase()
        .from('perfiles')
        .insert([perfilData])
        .select()
        .single();

      console.log('Profile Data:', profileData);
      console.log('Profile Error:', profileError);

      if (profileError) {
        console.error('ERROR AL INSERTAR PERFIL:', profileError);
        throw profileError;
      }

      console.log('=== REGISTRO ADMINISTRADOR EXITOSO ===');
      return { authData, profileData };
    } catch (error) {
      console.error('=== ERROR EN REGISTRO ADMINISTRADOR ===');
      console.error('Error completo:', error);
      throw error;
    }
  }

  // Obtener todos los pacientes
  async getPacientes(): Promise<any[]> {
    const { data, error } = await this.supabaseService.getSupabase()
      .from('perfiles')
      .select('*')
      .eq('tipo', 'paciente');
    if (error) return [];
    return data || [];
  }

  // Obtener todas las especialidades únicas
  async getTodasEspecialidades(): Promise<string[]> {
    const { data, error } = await this.supabaseService.getSupabase()
      .from('perfiles')
      .select('especialidad')
      .eq('tipo', 'especialista');
    if (error) return [];
    const especialidades: string[] = [];
    (data || []).forEach((esp: any) => {
      if (esp.especialidad) {
        if (Array.isArray(esp.especialidad)) {
          esp.especialidad.forEach((e: string) => especialidades.push(e.trim()));
        } else {
          esp.especialidad.split(',').forEach((e: string) => especialidades.push(e.trim()));
        }
      }
    });
    return Array.from(new Set(especialidades));
  }

  // Obtener todos los especialistas
  async getEspecialistas(): Promise<any[]> {
    const { data, error } = await this.supabaseService.getSupabase()
      .from('perfiles')
      .select('*')
      .eq('tipo', 'especialista');
    if (error) return [];
    return data || [];
  }

  // Obtener múltiples perfiles por emails (para acceso rápido)
  async getPerfilesByEmails(emails: string[]): Promise<any[]> {
    try {
      console.log('🔍 Buscando perfiles por emails:', emails);
      
      const { data, error } = await this.supabaseService.getSupabase()
        .from('perfiles')
        .select('email, nombre, apellido, imagen_perfil, tipo')
        .in('email', emails);

      if (error) {
        console.error('❌ Error buscando perfiles:', error);
        return [];
      }

      console.log('✅ Perfiles encontrados:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Error en getPerfilesByEmails:', error);
      return [];
    }
  }

  // Obtener especialidades con imágenes desde la tabla especialidades
  async getEspecialidadesConImagenes(): Promise<{ nombre: string, imagen: string }[]> {
    try {
      console.log('🎨 Obteniendo especialidades con imágenes desde la BD...');
      
      const { data, error } = await this.supabaseService.getSupabase()
        .from('especialidades')
        .select('nombre, imagen_url')
        .order('nombre', { ascending: true });

      if (error) {
        console.error('❌ Error obteniendo especialidades:', error);
        return [];
      }

      const especialidades = (data || []).map((esp: any) => ({
        nombre: esp.nombre,
        imagen: esp.imagen_url || 'https://cdn-icons-png.flaticon.com/512/2785/2785490.png'
      }));

      console.log('✅ Especialidades con imágenes cargadas:', especialidades.length);
      return especialidades;
    } catch (error) {
      console.error('❌ Error en getEspecialidadesConImagenes:', error);
      return [];
    }
  }
} 