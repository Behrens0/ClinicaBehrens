-- Esquema actualizado para Supabase con políticas RLS corregidas

-- Habilitar RLS en todas las tablas
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE especialidades ENABLE ROW LEVEL SECURITY;

-- Políticas para la tabla perfiles
-- Permitir inserción a usuarios autenticados (para registro)
CREATE POLICY "Usuarios autenticados pueden insertar sus propios perfiles" ON perfiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Permitir lectura a usuarios autenticados de sus propios perfiles
CREATE POLICY "Usuarios pueden leer sus propios perfiles" ON perfiles
FOR SELECT USING (auth.uid() = user_id);

-- Permitir actualización a usuarios autenticados de sus propios perfiles
CREATE POLICY "Usuarios pueden actualizar sus propios perfiles" ON perfiles
FOR UPDATE USING (auth.uid() = user_id);

-- Permitir eliminación a usuarios autenticados de sus propios perfiles
CREATE POLICY "Usuarios pueden eliminar sus propios perfiles" ON perfiles
FOR DELETE USING (auth.uid() = user_id);

-- Políticas para la tabla especialidades
-- Permitir lectura a todos los usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden leer especialidades" ON especialidades
FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir inserción a usuarios autenticados (para agregar nuevas especialidades)
CREATE POLICY "Usuarios autenticados pueden insertar especialidades" ON especialidades
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir actualización a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden actualizar especialidades" ON especialidades
FOR UPDATE USING (auth.role() = 'authenticated');

-- Configuración del bucket de storage para perfiles
INSERT INTO storage.buckets (id, name, public) 
VALUES ('perfiles', 'perfiles', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas para el bucket de storage
CREATE POLICY "Usuarios autenticados pueden subir imágenes de perfil" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'perfiles' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Usuarios autenticados pueden ver imágenes de perfil" ON storage.objects
FOR SELECT USING (
  bucket_id = 'perfiles' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Usuarios autenticados pueden actualizar sus imágenes de perfil" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'perfiles' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Usuarios autenticados pueden eliminar sus imágenes de perfil" ON storage.objects
FOR DELETE USING (
  bucket_id = 'perfiles' AND 
  auth.role() = 'authenticated'
); 