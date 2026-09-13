-- ============================================================================
-- NuraVision · Datos de ejemplo
-- ============================================================================
-- Suficiente para recorrer el flujo de reserva completo: catalogo -> detalle
-- del servicio -> elegir profesional -> elegir fecha -> elegir hora.
--
-- Todas las personas son ficticias.
--
-- Se aplica DESPUES de 0001 y 0002.
--
-- ----------------------------------------------------------------------------
-- ⚠  ATENCION: la primera instruccion BORRA el contenido de las cuatro tablas.
--    Es para poder re-ejecutar el seed sin acumular duplicados en una base de
--    desarrollo. NO ejecutes este archivo contra datos que te importen.
--    Si no quieres el borrado, elimina el truncate antes de correrlo.
-- ----------------------------------------------------------------------------
truncate table
  public.disponibilidad,
  public.profesional_servicios,
  public.profesionales,
  public.servicios
restart identity cascade;

-- ----------------------------------------------------------------------------
-- Servicios
-- ----------------------------------------------------------------------------
-- La columna `categoria` es texto libre y el frontend la normaliza. Se usan a
-- proposito tres formas distintas para que el seed ejerza ese camino:
--   · ids del dominio en minusculas ('unas', 'cabello', 'piel', 'diagnostico')
--   · una variante de presentacion ('Estilismo' -> se resuelve a 'cabello')
--   · un NULL, que cae en la categoria por defecto
insert into public.servicios
  (nombre, categoria, descripcion, duracion_minutos, precio_base, activo)
values
  ('Manicure Ritual Nura', 'unas',
   'Baño de sales, limado, trabajo de cutículas, masaje con aceite y esmaltado a elección.',
   60, 18000, true),

  ('Pedicure Spa', 'unas',
   'Remojo, exfoliación, limado, masaje descontracturante de pies y piernas, y esmaltado.',
   75, 22000, true),

  ('Uñas esculpidas', 'unas',
   'Construcción en acrílico o gel con extensión, forma a elección y diseño de línea fina.',
   120, 35000, true),

  ('Corte y peinado', 'cabello',
   'Corte técnico según tipo de cabello y estructura facial, más peinado de salida.',
   45, 15000, true),

  ('Coloración', 'Estilismo',
   'Color global, retoque de raíz o técnicas de iluminación, con tratamiento post-color.',
   150, 52000, true),

  ('Tratamiento capilar reconstructivo', 'cabello',
   'Reconstrucción profunda de la fibra para cabello procesado o quebradizo.',
   90, 28000, true),

  ('Limpieza facial profunda', 'piel',
   'Doble limpieza, exfoliación, extracción y mascarilla según tipo de piel.',
   60, 25000, true),

  ('Diagnóstico capilar', 'diagnostico',
   'Evaluación del cuero cabelludo con lupa digital y plan de cuidado sugerido.',
   30, 12000, true),

  -- Sin categoría: ejercita el valor por defecto del mapper.
  ('Asesoría de imagen', null,
   'Sesión de orientación sobre color, corte y rutina de cuidado.',
   45, 20000, true),

  -- Inactivos: no deben aparecer en el catálogo ni poder reservarse.
  ('Alisado de keratina', 'cabello',
   'Servicio descontinuado. Sirve para comprobar que un inactivo no se ofrece.',
   180, 60000, false),

  ('Depilación con cera', 'piel',
   'Servicio suspendido. Sirve para comprobar que un inactivo no se ofrece.',
   40, 14000, false);

-- ----------------------------------------------------------------------------
-- Profesionales
-- ----------------------------------------------------------------------------
-- avatar_url queda en NULL: el frontend muestra las iniciales cuando no hay
-- foto, y así el seed no depende de imágenes alojadas en ningún lado.
insert into public.profesionales (nombre, especialidad, avatar_url, activo)
values
  ('Camila Reyes',    'Nail artist',            null, true),
  ('Valentina Soto',  'Estilista y colorista',  null, true),
  ('Josefa Miranda',  'Cosmetóloga',            null, true),
  ('Andrés Fuentes',  'Barbero y estilista',    null, true),
  -- Inactiva: no debe aparecer entre quienes realizan un servicio.
  ('Rocío Cárdenas',  'Manicurista',            null, false);

-- ----------------------------------------------------------------------------
-- Vínculos profesional ↔ servicio
-- ----------------------------------------------------------------------------
-- Se resuelven por nombre en vez de por id, así el seed no depende de qué
-- valores haya entregado la secuencia.
insert into public.profesional_servicios (profesional_id, servicio_id)
select p.id, s.id
from (values
  ('Camila Reyes',   'Manicure Ritual Nura'),
  ('Camila Reyes',   'Pedicure Spa'),
  ('Camila Reyes',   'Uñas esculpidas'),

  ('Valentina Soto', 'Corte y peinado'),
  ('Valentina Soto', 'Coloración'),
  ('Valentina Soto', 'Tratamiento capilar reconstructivo'),
  ('Valentina Soto', 'Asesoría de imagen'),

  ('Josefa Miranda', 'Limpieza facial profunda'),
  ('Josefa Miranda', 'Diagnóstico capilar'),

  ('Andrés Fuentes', 'Corte y peinado'),
  ('Andrés Fuentes', 'Asesoría de imagen'),

  -- Vínculo de una profesional inactiva: el listado debe excluirla igual.
  ('Rocío Cárdenas', 'Manicure Ritual Nura')
) as v(profesional, servicio)
join public.profesionales p on p.nombre = v.profesional
join public.servicios     s on s.nombre = v.servicio;

-- ----------------------------------------------------------------------------
-- Disponibilidad semanal
-- ----------------------------------------------------------------------------
-- dia_semana: 0 = domingo … 6 = sábado (mismo índice que Date.getDay).
--
-- Varios días traen DOS bloques. El hueco entre ellos lo lee el frontend como
-- colación: "10:00-13:00" y "14:00-19:00" se muestran como jornada de 10 a 19
-- con pausa de 13 a 14. Hay también días de bloque único, para cubrir ambos
-- casos. Los bloques son de horas completas para que el cálculo de slots de 30
-- minutos entregue tramos parejos.
insert into public.disponibilidad (profesional_id, dia_semana, hora_inicio, hora_fin)
select p.id, v.dia, v.inicio::time, v.fin::time
from (values
  -- Camila Reyes · martes a sábado, con colación
  ('Camila Reyes',   2, '10:00', '13:00'),
  ('Camila Reyes',   2, '14:00', '19:00'),
  ('Camila Reyes',   3, '10:00', '13:00'),
  ('Camila Reyes',   3, '14:00', '19:00'),
  ('Camila Reyes',   4, '10:00', '13:00'),
  ('Camila Reyes',   4, '14:00', '19:00'),
  ('Camila Reyes',   5, '10:00', '13:00'),
  ('Camila Reyes',   5, '14:00', '19:00'),
  ('Camila Reyes',   6, '10:00', '15:00'),

  -- Valentina Soto · martes a sábado, jornada más larga
  ('Valentina Soto', 2, '09:00', '13:00'),
  ('Valentina Soto', 2, '14:00', '20:00'),
  ('Valentina Soto', 3, '09:00', '13:00'),
  ('Valentina Soto', 3, '14:00', '20:00'),
  ('Valentina Soto', 4, '09:00', '13:00'),
  ('Valentina Soto', 4, '14:00', '20:00'),
  ('Valentina Soto', 5, '09:00', '13:00'),
  ('Valentina Soto', 5, '14:00', '20:00'),
  ('Valentina Soto', 6, '10:00', '16:00'),

  -- Josefa Miranda · no atiende martes; bloque único los demás días
  ('Josefa Miranda', 3, '11:00', '18:00'),
  ('Josefa Miranda', 4, '11:00', '18:00'),
  ('Josefa Miranda', 5, '11:00', '18:00'),
  ('Josefa Miranda', 6, '11:00', '16:00'),

  -- Andrés Fuentes · incluye lunes, con colación corta
  ('Andrés Fuentes', 1, '10:00', '14:00'),
  ('Andrés Fuentes', 1, '15:00', '19:00'),
  ('Andrés Fuentes', 2, '10:00', '14:00'),
  ('Andrés Fuentes', 2, '15:00', '19:00'),
  ('Andrés Fuentes', 4, '10:00', '14:00'),
  ('Andrés Fuentes', 4, '15:00', '19:00'),
  ('Andrés Fuentes', 6, '09:00', '14:00')
) as v(profesional, dia, inicio, fin)
join public.profesionales p on p.nombre = v.profesional;

-- ----------------------------------------------------------------------------
-- Resumen
-- ----------------------------------------------------------------------------
select
  (select count(*) from public.servicios)                        as servicios,
  (select count(*) from public.servicios where activo)           as servicios_activos,
  (select count(*) from public.profesionales)                    as profesionales,
  (select count(*) from public.profesionales where activo)       as profesionales_activos,
  (select count(*) from public.profesional_servicios)            as vinculos,
  (select count(*) from public.disponibilidad)                   as bloques_horario;
