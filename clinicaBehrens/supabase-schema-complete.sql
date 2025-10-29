-- Esquema completo para el sistema de clínica

-- 1. Tabla de perfiles (actualizada con campo aprobado)
CREATE TABLE IF NOT EXISTS perfiles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  edad INTEGER NOT NULL CHECK (edad >= 0 AND edad <= 150),
  dni VARCHAR(20) UNIQUE NOT NULL,
  obra_social VARCHAR(100), -- Solo para pacientes
  especialidad VARCHAR(100), -- Solo para especialistas
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('paciente', 'especialista', 'admin')),
  imagen_perfil TEXT,
  imagen_perfil2 TEXT, -- Solo para pacientes
  aprobado BOOLEAN DEFAULT false, -- Para especialistas
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de especialidades
CREATE TABLE IF NOT EXISTS especialidades (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) UNIQUE NOT NULL,
  descripcion TEXT,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Habilitar RLS
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE especialidades ENABLE ROW LEVEL SECURITY;

-- 4. Políticas para perfiles
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

-- Política para administradores (pueden ver todos los perfiles)
CREATE POLICY "Administradores pueden ver todos los perfiles" ON perfiles
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM perfiles p 
    WHERE p.user_id = auth.uid() AND p.tipo = 'admin'
  )
);

-- Política para administradores (pueden aprobar especialistas)
CREATE POLICY "Administradores pueden aprobar especialistas" ON perfiles
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM perfiles p 
    WHERE p.user_id = auth.uid() AND p.tipo = 'admin'
  )
);

-- 5. Políticas para especialidades
-- Permitir lectura a todos los usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden leer especialidades" ON especialidades
FOR SELECT USING (auth.role() = 'authenticated');

-- Permitir inserción a usuarios autenticados (para agregar nuevas especialidades)
CREATE POLICY "Usuarios autenticados pueden insertar especialidades" ON especialidades
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir actualización a usuarios autenticados
CREATE POLICY "Usuarios autenticados pueden actualizar especialidades" ON especialidades
FOR UPDATE USING (auth.role() = 'authenticated');

-- 6. Configuración del bucket de storage para perfiles
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

-- 7. Políticas para el bucket de storage
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

-- 8. Insertar especialidades básicas
INSERT INTO especialidades (nombre, descripcion, activa) VALUES
('Cardiología', 'Especialidad médica que se encarga del diagnóstico y tratamiento de las enfermedades del corazón', true),
('Dermatología', 'Especialidad médica que se encarga del diagnóstico y tratamiento de las enfermedades de la piel', true),
('Ginecología', 'Especialidad médica que se encarga del diagnóstico y tratamiento de las enfermedades del aparato reproductor femenino', true),
('Neurología', 'Especialidad médica que se encarga del diagnóstico y tratamiento de las enfermedades del sistema nervioso', true),
('Oftalmología', 'Especialidad médica que se encarga del diagnóstico y tratamiento de las enfermedades de los ojos', true),
('Ortopedia', 'Especialidad médica que se encarga del diagnóstico y tratamiento de las enfermedades del sistema músculo-esquelético', true),
('Pediatría', 'Especialidad médica que se encarga del diagnóstico y tratamiento de las enfermedades de los niños', true),
('Psicología', 'Especialidad que se encarga del diagnóstico y tratamiento de los trastornos mentales y del comportamiento', true),
('Traumatología', 'Especialidad médica que se encarga del diagnóstico y tratamiento de las lesiones traumáticas', true),
('Urología', 'Especialidad médica que se encarga del diagnóstico y tratamiento de las enfermedades del aparato urinario', true)
ON CONFLICT (nombre) DO NOTHING;

-- 9. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_perfiles_user_id ON perfiles(user_id);
CREATE INDEX IF NOT EXISTS idx_perfiles_tipo ON perfiles(tipo);
CREATE INDEX IF NOT EXISTS idx_perfiles_dni ON perfiles(dni);
CREATE INDEX IF NOT EXISTS idx_perfiles_aprobado ON perfiles(aprobado);
CREATE INDEX IF NOT EXISTS idx_especialidades_nombre ON especialidades(nombre);
CREATE INDEX IF NOT EXISTS idx_especialidades_activa ON especialidades(activa);

-- 10. Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. Triggers para actualizar updated_at
CREATE TRIGGER update_perfiles_updated_at BEFORE UPDATE ON perfiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_especialidades_updated_at BEFORE UPDATE ON especialidades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 