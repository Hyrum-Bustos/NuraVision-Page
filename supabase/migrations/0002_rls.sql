-- ============================================================================
-- NuraVision · 0002 · Row Level Security
-- ============================================================================
-- El catalogo lo lee el navegador con la anon key, que es publica por diseno:
-- viaja dentro del bundle y cualquiera puede extraerla. La seguridad real la
-- dan estas politicas, no la clave.
--
-- POR QUE ESTE ARCHIVO NO ES OPCIONAL:
-- Activar RLS sin politicas no produce un error, produce cero filas. La app
-- compila, no muestra nada y no hay mensaje que lo explique. Es el peor modo
-- de fallar, asi que este archivo hace las dos cosas juntas: activa RLS y
-- crea de inmediato el SELECT publico.
--
-- Solo se abre SELECT. Escribir queda fuera del alcance del rol anonimo: hoy
-- la app no inserta nada, y cuando lo haga (reservas) tendra que ser con un
-- usuario autenticado y politicas propias.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Activar RLS
-- ----------------------------------------------------------------------------
alter table public.servicios             enable row level security;
alter table public.profesionales         enable row level security;
alter table public.profesional_servicios enable row level security;
alter table public.disponibilidad        enable row level security;

-- ----------------------------------------------------------------------------
-- Lectura publica
-- ----------------------------------------------------------------------------
-- `to anon, authenticated` cubre tanto al visitante sin sesion como al que ya
-- inicio sesion. `using (true)` = todas las filas son legibles.
--
-- El filtro de activo NO se hace aqui a proposito: el panel de administracion
-- necesita ver los inactivos, y "mis reservas" tiene que poder mostrar el
-- nombre de un servicio dado de baja. Quien filtra es la consulta
-- (.eq('activo', true)), no la politica.

create policy "lectura publica de servicios"
  on public.servicios
  for select
  to anon, authenticated
  using (true);

create policy "lectura publica de profesionales"
  on public.profesionales
  for select
  to anon, authenticated
  using (true);

create policy "lectura publica de profesional_servicios"
  on public.profesional_servicios
  for select
  to anon, authenticated
  using (true);

create policy "lectura publica de disponibilidad"
  on public.disponibilidad
  for select
  to anon, authenticated
  using (true);

-- ----------------------------------------------------------------------------
-- Permisos de tabla
-- ----------------------------------------------------------------------------
-- En Supabase los roles anon y authenticated ya reciben estos permisos por
-- privilegios por defecto sobre el esquema public. Se declaran igual para que
-- la migracion se baste a si misma y funcione tambien en una base Postgres que
-- no venga preconfigurada.
--
-- RLS y GRANT son dos capas distintas y hacen falta las dos: el GRANT permite
-- consultar la tabla, la politica decide que filas devuelve.
grant usage on schema public to anon, authenticated;

grant select on public.servicios             to anon, authenticated;
grant select on public.profesionales         to anon, authenticated;
grant select on public.profesional_servicios to anon, authenticated;
grant select on public.disponibilidad        to anon, authenticated;

-- Sin INSERT, UPDATE ni DELETE para anon: no se otorgan, y al no existir
-- politicas para esas operaciones tampoco habria filas que afectar.

-- ----------------------------------------------------------------------------
-- Refrescar el cache de PostgREST
-- ----------------------------------------------------------------------------
-- PostgREST cachea el esquema. Sin esto, las tablas recien creadas pueden
-- responder 404 durante un rato. El dashboard suele hacerlo solo; se incluye
-- por si se aplica la migracion por fuera.
notify pgrst, 'reload schema';
