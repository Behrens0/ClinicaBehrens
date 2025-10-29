-- Crear tabla de perfiles
CREATE TABLE IF NOT EXISTS perfiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255) NOT NULL,
  edad INTEGER NOT NULL CHECK (edad >= 0 AND edad <= 120),
  dni VARCHAR(8) NOT NULL UNIQUE,
  obra_social VARCHAR(255),
  especialidad VARCHAR(255),
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('paciente', 'especialista')),
  imagen_perfil TEXT,
  imagen_perfil2 TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de especialidades
CREATE TABLE IF NOT EXISTS especialidades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL UNIQUE,
  descripcion TEXT,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear bucket de storage para perfiles
INSERT INTO storage.buckets (id, name, public) 
VALUES ('perfiles', 'perfiles', true)
ON CONFLICT (id) DO NOTHING;

-- Crear políticas RLS para perfiles
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan ver su propio perfil
CREATE POLICY "Users can view own profile" ON perfiles
  FOR SELECT USING (auth.uid() = user_id);

-- Política para que los usuarios puedan insertar su propio perfil
CREATE POLICY "Users can insert own profile" ON perfiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para que los usuarios puedan actualizar su propio perfil
CREATE POLICY "Users can update own profile" ON perfiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para que los administradores puedan ver todos los perfiles
CREATE POLICY "Admins can view all profiles" ON perfiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Crear políticas RLS para especialidades
ALTER TABLE especialidades ENABLE ROW LEVEL SECURITY;

-- Política para que todos puedan ver especialidades activas
CREATE POLICY "Anyone can view active specialties" ON especialidades
  FOR SELECT USING (activa = true);

-- Política para que los administradores puedan gestionar especialidades
CREATE POLICY "Admins can manage specialties" ON especialidades
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Crear políticas para storage
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'perfiles');

CREATE POLICY "Users can upload own profile images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'perfiles' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own profile images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'perfiles' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own profile images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'perfiles' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Insertar algunas especialidades por defecto
INSERT INTO especialidades (nombre, descripcion) VALUES
  ('Cardiología', 'Especialidad médica que se encarga del diagnóstico y tratamiento de las enfermedades del corazón'),
  ('Dermatología', 'Especialidad médica que se encarga del diagnóstico y tratamiento de las enfermedades de la piel'),
  ('Ginecología', 'Especialidad médica que se encarga de la salud reproductiva de la mujer'),
  ('Neurología', 'Especialidad médica que se encarga del diagnóstico y tratamiento de las enfermedades del sistema nervioso'),
  ('Oftalmología', 'Especialidad médica que se encarga del diagnóstico y tratamiento de las enfermedades de los ojos'),
  ('Ortopedia', 'Especialidad médica que se encarga del diagnóstico y tratamiento de las enfermedades del sistema músculo-esquelético'),
  ('Pediatría', 'Especialidad médica que se encarga del cuidado de la salud de los niños'),
  ('Psiquiatría', 'Especialidad médica que se encarga del diagnóstico y tratamiento de las enfermedades mentales'),
  ('Traumatología', 'Especialidad médica que se encarga del diagnóstico y tratamiento de las lesiones traumáticas'),
  ('Urología', 'Especialidad médica que se encarga del diagnóstico y tratamiento de las enfermedades del sistema urinario')
ON CONFLICT (nombre) DO NOTHING; 