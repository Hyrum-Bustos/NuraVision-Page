-- ============================================================================
-- NuraVision · 0003 · Reservas
-- ============================================================================
-- Pone la tabla `reservas` al dia con el producto. Quedo desalineada respecto
-- de dos cosas que ya estan en develop:
--
--   · "Permite reservar sin tener cuenta": sin sesion, el nombre, el correo y
--     el telefono son el UNICO vinculo con la reserva. La tabla no tenia donde
--     guardarlos: solo tenia cliente_id, que asume una cuenta.
--   · profesionales.id es bigint, pero reservas.profesional_id era uuid. Es el
--     mismo desajuste que 0001 corrigio en profesional_servicios: no habia
--     valor valido que guardar.
--
-- Tambien faltaba hora_fin, y RLS bloqueaba por completo la insercion.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Cliente: invitado y cuenta opcional
-- ----------------------------------------------------------------------------
-- Con sesion se rellenan desde la cuenta; sin sesion son el unico contacto.
alter table public.reservas
  add column cliente_nombre   text,
  add column cliente_email    text,
  add column cliente_telefono text;

-- cliente_id se conserva y queda opcional: apunta al perfil cuando la reserva
-- la hizo alguien con cuenta, y es NULL cuando fue un invitado.
alter table public.reservas
  alter column cliente_id drop not null;

comment on column public.reservas.cliente_id is
  'Perfil asociado, o NULL si la reserva se hizo sin cuenta.';
comment on column public.reservas.cliente_email is
  'Contacto de la reserva. En una reserva de invitado es el unico vinculo.';

-- Una reserva tiene que poder contactarse de alguna forma: o tiene perfil, o
-- tiene correo. Nunca ninguno de los dos.
alter table public.reservas
  add constraint reservas_contacto_presente
  check (cliente_id is not null or nullif(btrim(cliente_email), '') is not null);

-- ----------------------------------------------------------------------------
-- 2. profesional_id: uuid -> bigint, con clave foranea
-- ----------------------------------------------------------------------------
-- La tabla esta vacia, asi que no hay datos que convertir. Si tuviera filas,
-- este using las perderia: conviene comprobarlo antes de aplicar.
alter table public.reservas
  alter column profesional_id type bigint using null;

alter table public.reservas
  add constraint reservas_profesional_fk
  foreign key (profesional_id) references public.profesionales (id);

-- Y servicio_id tampoco tenia FK declarada.
alter table public.reservas
  add constraint reservas_servicio_fk
  foreign key (servicio_id) references public.servicios (id);

-- ----------------------------------------------------------------------------
-- 3. hora_fin
-- ----------------------------------------------------------------------------
-- Se guarda en vez de derivarse de la duracion del servicio: si mañana esa
-- duracion cambia, las reservas ya tomadas deben conservar el bloque que
-- realmente se reservo.
alter table public.reservas
  add column hora_fin time;

alter table public.reservas
  add constraint reservas_rango_valido
  check (hora_fin is null or hora_fin > hora_inicio);

-- ----------------------------------------------------------------------------
-- 4. Codigo visible
-- ----------------------------------------------------------------------------
-- Es lo que se le muestra a quien reserva sin cuenta para identificar su hora,
-- ya que no tiene un historial donde consultarla.
alter table public.reservas
  add column codigo text;

create unique index reservas_codigo_idx
  on public.reservas (codigo)
  where codigo is not null;

-- ----------------------------------------------------------------------------
-- 5. Indices
-- ----------------------------------------------------------------------------
create index reservas_agenda_idx
  on public.reservas (profesional_id, fecha, hora_inicio);

create index reservas_cliente_idx
  on public.reservas (cliente_id)
  where cliente_id is not null;

-- ----------------------------------------------------------------------------
-- 6. RLS: solo INSERT para el rol anonimo
-- ----------------------------------------------------------------------------
-- Reservar sin cuenta obliga a que un visitante sin sesion pueda crear filas.
-- El costo es inherente a esa decision de producto: cualquiera con la anon key
-- puede insertar reservas. Se acota lo que se pueda:
--
--   · `estado` forzado a 'pendiente'. Nadie puede auto-confirmarse una hora;
--     confirmar queda del lado del equipo, con otro rol.
--   · Se exige contacto no vacio, para que no se puedan crear filas huerfanas.
--   · NO se otorga SELECT. Es deliberado: sin autenticacion no hay forma de
--     acotar la lectura a "mis reservas", y un SELECT abierto expondria
--     nombre, correo y telefono de todos los clientes.
--
-- CONSECUENCIA QUE CONVIENE TENER PRESENTE: desde el navegador la tabla es de
-- solo escritura. Ni siquiera se puede leer de vuelta la fila recien creada
-- (PostgREST necesita SELECT para devolverla), asi que la app no conoce el id
-- generado y usa su propio `codigo`. Cuando exista Supabase Auth, lo correcto
-- es agregar un SELECT acotado a cliente_id = auth.uid().
alter table public.reservas enable row level security;

create policy "insercion publica de reservas"
  on public.reservas
  for insert
  to anon, authenticated
  with check (
    estado = 'pendiente'
    and (cliente_id is not null or nullif(btrim(cliente_email), '') is not null)
  );

grant insert on public.reservas to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

-- Sin SELECT, UPDATE ni DELETE para anon.

notify pgrst, 'reload schema';
