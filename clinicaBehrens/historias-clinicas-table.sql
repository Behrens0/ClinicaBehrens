-- Crear tabla de historias clínicas
CREATE TABLE IF NOT EXISTS historias_clinicas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id UUID NOT NULL REFERENCES perfiles(user_id) ON DELETE CASCADE,
  especialista_id UUID NOT NULL REFERENCES perfiles(user_id) ON DELETE CASCADE,
  turno_id UUID NOT NULL REFERENCES turnos(id) ON DELETE CASCADE,
  fecha_atencion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  altura DECIMAL(4,2) NOT NULL CHECK (altura >= 0.5 AND altura <= 3.0),
  peso DECIMAL(5,2) NOT NULL CHECK (peso >= 1 AND peso <= 500),
  temperatura DECIMAL(4,1) NOT NULL CHECK (temperatura >= 30 AND temperatura <= 45),
  presion VARCHAR(20) NOT NULL,
  datos_dinamicos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_historias_clinicas_paciente_id ON historias_clinicas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_historias_clinicas_especialista_id ON historias_clinicas(especialista_id);
CREATE INDEX IF NOT EXISTS idx_historias_clinicas_turno_id ON historias_clinicas(turno_id);
CREATE INDEX IF NOT EXISTS idx_historias_clinicas_fecha_atencion ON historias_clinicas(fecha_atencion);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at
CREATE TRIGGER update_historias_clinicas_updated_at 
    BEFORE UPDATE ON historias_clinicas 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Configurar RLS (Row Level Security)
ALTER TABLE historias_clinicas ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
-- Pacientes pueden ver solo sus propias historias clínicas
CREATE POLICY "Pacientes pueden ver sus historias clínicas" ON historias_clinicas
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM perfiles 
      WHERE user_id = auth.uid() AND tipo = 'paciente'
    ) AND paciente_id = auth.uid()
  );

-- Especialistas pueden ver historias clínicas de pacientes que han atendido
CREATE POLICY "Especialistas pueden ver historias de pacientes atendidos" ON historias_clinicas
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM perfiles 
      WHERE user_id = auth.uid() AND tipo = 'especialista'
    ) AND especialista_id = auth.uid()
  );

-- Administradores pueden ver todas las historias clínicas
CREATE POLICY "Administradores pueden ver todas las historias" ON historias_clinicas
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM perfiles 
      WHERE user_id = auth.uid() AND tipo = 'administrador'
    )
  );

-- Especialistas pueden crear historias clínicas
CREATE POLICY "Especialistas pueden crear historias clínicas" ON historias_clinicas
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM perfiles 
      WHERE user_id = auth.uid() AND tipo = 'especialista'
    ) AND especialista_id = auth.uid()
  );

-- Especialistas pueden actualizar sus historias clínicas
CREATE POLICY "Especialistas pueden actualizar sus historias" ON historias_clinicas
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM perfiles 
      WHERE user_id = auth.uid() AND tipo = 'especialista'
    ) AND especialista_id = auth.uid()
  );

-- Administradores pueden eliminar historias clínicas
CREATE POLICY "Administradores pueden eliminar historias" ON historias_clinicas
  FOR DELETE USING (
    auth.uid() IN (
      SELECT user_id FROM perfiles 
      WHERE user_id = auth.uid() AND tipo = 'administrador'
    )
  ); 