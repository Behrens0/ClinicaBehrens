-- EJECUTAR ESTE SCRIPT EN SUPABASE SQL EDITOR
-- Esto quitará las restricciones CHECK y ampliará los rangos permitidos

-- 1. Eliminar las restricciones CHECK
ALTER TABLE historias_clinicas 
  DROP CONSTRAINT IF EXISTS historias_clinicas_altura_check;

ALTER TABLE historias_clinicas 
  DROP CONSTRAINT IF EXISTS historias_clinicas_peso_check;

ALTER TABLE historias_clinicas 
  DROP CONSTRAINT IF EXISTS historias_clinicas_temperatura_check;

-- 2. Modificar los tipos de datos para permitir rangos más amplios
-- De NUMERIC(4,2) a NUMERIC(10,2) para altura
ALTER TABLE historias_clinicas 
  ALTER COLUMN altura TYPE NUMERIC(10,2);

-- De NUMERIC(5,2) a NUMERIC(10,2) para peso  
ALTER TABLE historias_clinicas 
  ALTER COLUMN peso TYPE NUMERIC(10,2);

-- De NUMERIC(4,1) a NUMERIC(10,2) para temperatura
ALTER TABLE historias_clinicas 
  ALTER COLUMN temperatura TYPE NUMERIC(10,2);

-- 3. Verificar que los cambios se aplicaron
SELECT 
  column_name, 
  data_type, 
  numeric_precision, 
  numeric_scale,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'historias_clinicas' 
  AND column_name IN ('altura', 'peso', 'temperatura', 'presion')
ORDER BY column_name;

-- 4. Verificar que no hay restricciones CHECK
SELECT 
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'historias_clinicas'
  AND constraint_type = 'CHECK';

-- ✅ Después de ejecutar este script:
-- - Podrás ingresar alturas desde 0.01 hasta 99,999,999.99
-- - Podrás ingresar pesos desde 0.01 hasta 99,999,999.99
-- - Podrás ingresar temperaturas desde 0.01 hasta 99,999,999.99
-- - Sin restricciones de rangos mínimos o máximos

