export const monthlyBookingTrend = [
  { label: 'Mar', value: 60 },
  { label: 'Abr', value: 68 },
  { label: 'May', value: 78 },
  { label: 'Jun', value: 86 },
  { label: 'Jul', value: 96 },
  { label: 'Ago', value: 112 },
  { label: 'Sep', value: 55 },
]

export const topServices = [
  { name: 'Manicure Ritual Nura', count: 92 },
  { name: 'Uñas esculpidas', count: 74 },
  { name: 'Corte y peinado', count: 58 },
  { name: 'Coloración', count: 41 },
  { name: 'Limpieza facial profunda', count: 29 },
]

export const dashboardStats = {
  reservasDelMes: { value: 318, delta: '+12,4%', tone: 'positive' as const },
  reservasHoy: { value: 24, caption: '6 pendientes' },
  clientesRegistrados: { value: 1204, delta: '+38 este mes', tone: 'positive' as const },
  tasaCancelacion: { value: '4,1%', delta: '-0,8%', tone: 'negative' as const },
}
