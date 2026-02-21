/**
 * Demo data for the Live Board.
 * Used when no auth / no real data available.
 */

export interface BoardAppointment {
  id: string;
  title: string;
  client: string;
  time: string;      // HH:MM
  endTime: string;    // HH:MM
  status: 'completed' | 'in_progress' | 'upcoming' | 'cancelled';
  staff?: string;
}

export interface BoardOrder {
  id: string;
  number: string;
  customer: string;
  itemCount: number;
  status: 'new' | 'preparing' | 'ready' | 'completed';
  minutesAgo: number;
}

export interface BoardClass {
  id: string;
  name: string;
  instructor: string;
  time: string;       // HH:MM
  enrolled: number;
  capacity: number;
  status: 'completed' | 'in_progress' | 'upcoming';
}

export interface BoardQueueEntry {
  name: string;
  partySize: number;
  waitMinutes: number;
}

export interface BoardQueue {
  currentNumber: number;
  waiting: BoardQueueEntry[];
  avgWait: number;
}

export interface BoardPipelineStage {
  stage: string;
  color: string;
  count: number;
}

export interface BoardStats {
  appointments: number;
  orders: number;
  revenue: number;    // dollars
  customers: number;
}

export interface BoardData {
  stats: BoardStats;
  schedule: BoardAppointment[];
  orders: BoardOrder[];
  classes: BoardClass[];
  queue: BoardQueue;
  pipeline: BoardPipelineStage[];
}

// Helper: get current hour to make demo data feel "live"
function currentHour(): number {
  return new Date().getHours();
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function makeTime(h: number, m: number): string {
  return `${pad(h)}:${pad(m)}`;
}

export function getDemoBoardData(): BoardData {
  const h = currentHour();

  return {
    stats: {
      appointments: 12,
      orders: 34,
      revenue: 2850,
      customers: 28,
    },

    schedule: [
      { id: 's1', title: 'Consultation', client: 'Sarah Chen', time: makeTime(h - 2, 0), endTime: makeTime(h - 2, 30), status: 'completed', staff: 'Emily R.' },
      { id: 's2', title: 'Haircut', client: 'Mike Davis', time: makeTime(h - 1, 0), endTime: makeTime(h - 1, 30), status: 'completed', staff: 'James L.' },
      { id: 's3', title: 'Color Treatment', client: 'Lisa Park', time: makeTime(h, 0), endTime: makeTime(h, 45), status: 'in_progress', staff: 'Emily R.' },
      { id: 's4', title: 'Blowout', client: 'Anna Kim', time: makeTime(h, 30), endTime: makeTime(h + 1, 0), status: 'upcoming', staff: 'James L.' },
      { id: 's5', title: 'Deep Conditioning', client: 'Rachel Green', time: makeTime(h + 1, 0), endTime: makeTime(h + 1, 30), status: 'upcoming', staff: 'Emily R.' },
      { id: 's6', title: 'Manicure', client: 'Tom Wilson', time: makeTime(h + 1, 30), endTime: makeTime(h + 2, 0), status: 'upcoming', staff: 'Sofia M.' },
      { id: 's7', title: 'Full Set', client: 'Jessica Brown', time: makeTime(h + 2, 0), endTime: makeTime(h + 3, 0), status: 'upcoming', staff: 'Sofia M.' },
      { id: 's8', title: 'Trim & Style', client: 'David Lee', time: makeTime(h + 2, 30), endTime: makeTime(h + 3, 0), status: 'upcoming', staff: 'James L.' },
    ],

    orders: [
      { id: 'o1', number: '#1048', customer: 'Walk-in', itemCount: 3, status: 'new', minutesAgo: 1 },
      { id: 'o2', number: '#1047', customer: 'John S.', itemCount: 2, status: 'new', minutesAgo: 3 },
      { id: 'o3', number: '#1046', customer: 'Maria G.', itemCount: 4, status: 'preparing', minutesAgo: 8 },
      { id: 'o4', number: '#1045', customer: 'Alex T.', itemCount: 1, status: 'preparing', minutesAgo: 12 },
      { id: 'o5', number: '#1044', customer: 'Emily R.', itemCount: 2, status: 'ready', minutesAgo: 18 },
      { id: 'o6', number: '#1043', customer: 'Sam P.', itemCount: 3, status: 'completed', minutesAgo: 25 },
      { id: 'o7', number: '#1042', customer: 'Chris L.', itemCount: 1, status: 'completed', minutesAgo: 32 },
      { id: 'o8', number: '#1041', customer: 'Nina K.', itemCount: 2, status: 'completed', minutesAgo: 45 },
    ],

    classes: [
      { id: 'c1', name: 'Morning Yoga', instructor: 'Sarah J.', time: makeTime(h - 2, 0), enrolled: 18, capacity: 20, status: 'completed' },
      { id: 'c2', name: 'HIIT Bootcamp', instructor: 'Mike D.', time: makeTime(h, 0), enrolled: 25, capacity: 25, status: 'in_progress' },
      { id: 'c3', name: 'Spin Class', instructor: 'Lisa P.', time: makeTime(h + 1, 0), enrolled: 14, capacity: 20, status: 'upcoming' },
      { id: 'c4', name: 'Pilates', instructor: 'Anna K.', time: makeTime(h + 2, 0), enrolled: 8, capacity: 15, status: 'upcoming' },
      { id: 'c5', name: 'Boxing Fundamentals', instructor: 'Coach Ray', time: makeTime(h + 3, 0), enrolled: 10, capacity: 16, status: 'upcoming' },
    ],

    queue: {
      currentNumber: 12,
      waiting: [
        { name: 'John Smith', partySize: 4, waitMinutes: 12 },
        { name: 'Sarah Johnson', partySize: 2, waitMinutes: 8 },
        { name: 'Mike Chen', partySize: 1, waitMinutes: 5 },
        { name: 'Emma Davis', partySize: 3, waitMinutes: 2 },
        { name: 'Alex Turner', partySize: 2, waitMinutes: 0 },
      ],
      avgWait: 15,
    },

    pipeline: [
      { stage: 'New', color: '#3B82F6', count: 12 },
      { stage: 'Contacted', color: '#F59E0B', count: 8 },
      { stage: 'Qualified', color: '#8B5CF6', count: 5 },
      { stage: 'Proposal', color: '#06B6D4', count: 3 },
      { stage: 'Won', color: '#10B981', count: 2 },
    ],
  };
}
