export interface DefaultScheduleItem {
  title: string;
  category: string;
  start: string; // HH:mm format
  end: string;   // HH:mm format
  alarm?: boolean;
}

export const defaultScheduleTemplate: DefaultScheduleItem[] = [
  { title: 'Wake up, brush teeth, floss, exfoliate', category: 'wake_up', start: '06:30', end: '07:00', alarm: true },
  { title: 'Jog/Exercise', category: 'exercise', start: '07:00', end: '08:00', alarm: true },
  { title: 'Shower, hygiene', category: 'hygiene', start: '08:00', end: '08:30' },
  { title: 'Make/eat breakfast, grace, dishes', category: 'meal', start: '08:30', end: '09:00' },
  { title: 'Business cold calls', category: 'work', start: '09:00', end: '11:00' },
  { title: 'GED math study', category: 'study', start: '11:00', end: '17:00' },
  { title: 'Scripture & prayer', category: 'spiritual', start: '17:00', end: '18:00' },
  { title: 'Dinner + dishes + kitchen cleanup', category: 'meal', start: '18:00', end: '19:00' },
  { title: 'Personal development book reading', category: 'personal', start: '19:00', end: '20:00' },
  { title: 'Cooking video training', category: 'personal', start: '20:00', end: '21:00' },
  { title: 'PM hygiene', category: 'hygiene', start: '21:00', end: '21:30' },
  { title: 'Final prayer', category: 'spiritual', start: '21:30', end: '21:45', alarm: true },
  { title: 'Sleep', category: 'sleep', start: '21:45', end: '06:30', alarm: true },
];
