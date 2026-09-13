import type { DayAvailability, Weekday, WeeklyAvailability } from '@/shared/types'
import type { Tables } from '@/shared/types/supabase'
import type { Disponibilidad } from '../domain/disponibilidad.types'

export type DisponibilidadRow = Tables<'disponibilidad'>

/**
 * Convencion de `dia_semana` en la base: 0 = domingo, como Date.getDay().
 *
 * SUPUESTO: la tabla estaba vacia al escribir esto, asi que no se pudo
 * confirmar contra datos reales. Si la base usa ISO (1 = lunes, 7 = domingo),
 * basta cambiar esta constante a 1 y el resto se ajusta solo.
 */
const DIA_SEMANA_BASE = 0

/** "10:00:00" -> "10:00". Postgres `time` llega con segundos. */
function aHoraCorta(valor: string): string {
  const [horas = '00', minutos = '00'] = valor.split(':')
  return `${horas.padStart(2, '0')}:${minutos.padStart(2, '0')}`
}

function aWeekday(diaSemana: number): Weekday {
  // Se normaliza contra la base declarada y se envuelve en 0..6, de modo que
  // un 7 (domingo en ISO) caiga en 0 y no en un indice inexistente.
  const normalizado = (((diaSemana - DIA_SEMANA_BASE) % 7) + 7) % 7
  return normalizado as Weekday
}

/** Fila de la base de datos -> entidad de dominio. */
export function toDisponibilidad(row: DisponibilidadRow): Disponibilidad {
  return {
    id: String(row.id),
    profesionalId: String(row.profesional_id),
    diaSemana: aWeekday(row.dia_semana),
    horaInicio: aHoraCorta(row.hora_inicio),
    horaFin: aHoraCorta(row.hora_fin),
  }
}

function diaCerrado(): DayAvailability {
  return { enabled: false, start: '10:00', end: '19:00', breaks: [] }
}

/**
 * Bloques sueltos -> horario semanal.
 *
 * `DayAvailability` modela un unico tramo con pausas, mientras que la base
 * guarda un bloque por fila. Para un dia con varios bloques se toma el inicio
 * del primero y el fin del ultimo, y cada hueco intermedio pasa a ser una
 * pausa. Asi "10:00-13:00" y "14:00-19:00" se leen como jornada de 10 a 19
 * con colacion de 13 a 14, que es lo que espera el calculo de horas.
 */
export function toWeeklyAvailability(bloques: Disponibilidad[]): WeeklyAvailability {
  const semana = {
    0: diaCerrado(),
    1: diaCerrado(),
    2: diaCerrado(),
    3: diaCerrado(),
    4: diaCerrado(),
    5: diaCerrado(),
    6: diaCerrado(),
  } as WeeklyAvailability

  for (let dia = 0 as Weekday; dia <= 6; dia = (dia + 1) as Weekday) {
    const delDia = bloques
      .filter((b) => b.diaSemana === dia)
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))

    if (delDia.length === 0) continue

    const primero = delDia[0]
    const ultimo = delDia[delDia.length - 1]

    const pausas = delDia.slice(0, -1).flatMap((bloque, i) => {
      const siguiente = delDia[i + 1]
      if (bloque.horaFin >= siguiente.horaInicio) return []
      return [
        {
          id: `${bloque.id}-pausa`,
          start: bloque.horaFin,
          end: siguiente.horaInicio,
          label: 'Colación',
        },
      ]
    })

    semana[dia] = {
      enabled: true,
      start: primero.horaInicio,
      end: ultimo.horaFin,
      breaks: pausas,
    }
  }

  return semana
}
