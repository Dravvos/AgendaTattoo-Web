import type { Artist, Appointment } from '../types/schedule'
import { addDays, startOfWeek } from '../utils/date'

export const mockArtists: Artist[] = [
  { id: 'artist-1', name: 'Você', colorVar: '--artist-1' },
  { id: 'artist-2', name: 'Bia Ferraz', colorVar: '--artist-2' },
  { id: 'artist-3', name: 'Renan Souza', colorVar: '--artist-3' },
]

function at(day: Date, hours: number, minutes = 0): Date {
  const result = new Date(day)
  result.setHours(hours, minutes, 0, 0)
  return result
}

// Ancorados na semana atual (segunda-feira como referência) só pra tela nunca
// abrir vazia nesta versão sem API. Ao navegar pra outras semanas, a grade
// aparece sem agendamentos — o normal, já que ainda não há dados reais.
const monday = startOfWeek(new Date())

export const mockAppointments: Appointment[] = [
  {
    id: 'apt-1',
    artistId: 'artist-1',
    clientName: 'Marina Alves',
    service: 'Fechamento de braço — blackwork',
    start: at(monday, 10),
    end: at(monday, 14),
    status: 'confirmado',
  },
  {
    id: 'apt-2',
    artistId: 'artist-2',
    clientName: 'João Pedro',
    service: 'Rosa old school — antebraço',
    start: at(addDays(monday, 1), 13),
    end: at(addDays(monday, 1), 15),
    status: 'pendente',
  },
  {
    id: 'apt-3',
    artistId: 'artist-3',
    clientName: 'Camila Duarte',
    service: 'Fine line — tornozelo',
    start: at(addDays(monday, 1), 16, 30),
    end: at(addDays(monday, 1), 17, 30),
    status: 'confirmado',
  },
  {
    id: 'apt-4',
    artistId: 'artist-1',
    clientName: 'Diego Nogueira',
    service: 'Cobertura — costas (sessão 1 de 3)',
    start: at(addDays(monday, 2), 11),
    end: at(addDays(monday, 2), 16),
    status: 'confirmado',
  },
  {
    id: 'apt-5',
    artistId: 'artist-2',
    clientName: 'Larissa Teixeira',
    service: 'Lettering — costela',
    start: at(addDays(monday, 3), 10),
    end: at(addDays(monday, 3), 11, 30),
    status: 'pendente',
  },
  {
    id: 'apt-6',
    artistId: 'artist-3',
    clientName: 'Pedro Antunes',
    service: 'Retoque — manga japonesa',
    start: at(addDays(monday, 4), 14),
    end: at(addDays(monday, 4), 17),
    status: 'concluido',
  },
  {
    id: 'apt-7',
    artistId: 'artist-1',
    clientName: 'Yasmin Rocha',
    service: 'Flash day — borboleta',
    start: at(addDays(monday, 5), 10, 30),
    end: at(addDays(monday, 5), 12),
    status: 'confirmado',
  },
  {
    id: 'apt-8',
    artistId: 'artist-2',
    clientName: 'Otávio Lima',
    service: 'Consulta — orçamento de fechamento',
    start: at(addDays(monday, 5), 15),
    end: at(addDays(monday, 5), 15, 30),
    status: 'cancelado',
  },
]
