-- Tabla para registrar logs de ingresos al sistema
CREATE TABLE IF NOT EXISTS public.logs_ingresos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL,
  usuario_nombre TEXT NOT NULL,
  usuario_tipo TEXT NOT NULL,
  fecha_hora TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_logs_ingresos_usuario ON public.logs_ingresos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_logs_ingresos_fecha ON public.logs_ingresos(fecha_hora DESC);
CREATE INDEX IF NOT EXISTS idx_logs_ingresos_tipo ON public.logs_ingresos(usuario_tipo);
