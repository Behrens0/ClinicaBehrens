-- Configuración completa del bucket de storage para perfiles

-- 1. Crear el bucket si no existe
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'perfiles', 
  'perfiles', 
  true, 
  5242880, -- 5MB en bytes
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Eliminar políticas existentes del bucket (si las hay)
DROP POLICY IF EXISTS "Usuarios autenticados pueden subir imágenes de perfil" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver imágenes de perfil" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar sus imágenes de perfil" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar sus imágenes de perfil" ON storage.objects;

-- 3. Crear políticas más permisivas para el bucket
-- Política para INSERT (subir archivos)
CREATE POLICY "Permitir subida de imágenes de perfil" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'perfiles' AND 
  (auth.role() = 'authenticated' OR auth.role() = 'anon')
);

-- Política para SELECT (ver archivos)
CREATE POLICY "Permitir visualización de imágenes de perfil" ON storage.objects
FOR SELECT USING (
  bucket_id = 'perfiles' AND 
  (auth.role() = 'authenticated' OR auth.role() = 'anon')
);

-- Política para UPDATE (actualizar archivos)
CREATE POLICY "Permitir actualización de imágenes de perfil" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'perfiles' AND 
  (auth.role() = 'authenticated' OR auth.role() = 'anon')
);

-- Política para DELETE (eliminar archivos)
CREATE POLICY "Permitir eliminación de imágenes de perfil" ON storage.objects
FOR DELETE USING (
  bucket_id = 'perfiles' AND 
  (auth.role() = 'authenticated' OR auth.role() = 'anon')
);

-- 4. Verificar que el bucket se creó correctamente
SELECT * FROM storage.buckets WHERE id = 'perfiles';

-- 5. Verificar las políticas creadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'; 