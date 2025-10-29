# Configuración de Supabase para el Proyecto

## 1. Configurar el Bucket de Storage

### Ejecutar en el SQL Editor de Supabase:

```sql
-- Crear el bucket de perfiles
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
```

### Configurar Políticas de Storage:

```sql
-- Eliminar políticas existentes (si las hay)
DROP POLICY IF EXISTS "Usuarios autenticados pueden subir imágenes de perfil" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver imágenes de perfil" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar sus imágenes de perfil" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados pueden eliminar sus imágenes de perfil" ON storage.objects;

-- Crear políticas permisivas
CREATE POLICY "Permitir subida de imágenes de perfil" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'perfiles' AND 
  (auth.role() = 'authenticated' OR auth.role() = 'anon')
);

CREATE POLICY "Permitir visualización de imágenes de perfil" ON storage.objects
FOR SELECT USING (
  bucket_id = 'perfiles' AND 
  (auth.role() = 'authenticated' OR auth.role() = 'anon')
);

CREATE POLICY "Permitir actualización de imágenes de perfil" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'perfiles' AND 
  (auth.role() = 'authenticated' OR auth.role() = 'anon')
);

CREATE POLICY "Permitir eliminación de imágenes de perfil" ON storage.objects
FOR DELETE USING (
  bucket_id = 'perfiles' AND 
  (auth.role() = 'authenticated' OR auth.role() = 'anon')
);
```

## 2. Configurar Políticas RLS para la Tabla Perfiles

```sql
-- Habilitar RLS
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;

-- Políticas para perfiles
CREATE POLICY "Usuarios autenticados pueden insertar sus propios perfiles" ON perfiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden leer sus propios perfiles" ON perfiles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden actualizar sus propios perfiles" ON perfiles
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuarios pueden eliminar sus propios perfiles" ON perfiles
FOR DELETE USING (auth.uid() = user_id);
```

## 3. Verificar Configuración

### Verificar Bucket:
```sql
SELECT * FROM storage.buckets WHERE id = 'perfiles';
```

### Verificar Políticas de Storage:
```sql
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
```

### Verificar Políticas de Perfiles:
```sql
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
WHERE tablename = 'perfiles';
```

## 4. Configuración en el Panel de Supabase

1. **Ir a Storage en el panel de Supabase**
2. **Verificar que existe el bucket "perfiles"**
3. **Si no existe, crearlo manualmente:**
   - Nombre: `perfiles`
   - Público: ✅ Sí
   - Límite de tamaño: 5MB
   - Tipos MIME permitidos: `image/jpeg, image/png, image/gif, image/webp`

## 5. Solución de Problemas

### Error 400 en subida de archivos:
- Verificar que el bucket existe
- Verificar que las políticas permiten subida
- Verificar que el usuario está autenticado
- Verificar el tipo de archivo y tamaño

### Error RLS:
- Verificar que el usuario está autenticado
- Verificar que el user_id coincide con auth.uid()
- Verificar que las políticas están correctamente configuradas

## 6. Archivos SQL Completos

- `storage-setup.sql` - Configuración de storage
- `supabase-schema-updated.sql` - Configuración de RLS 