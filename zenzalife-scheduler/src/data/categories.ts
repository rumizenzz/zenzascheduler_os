export interface TaskCategory {
  value: string;
  label: string;
  color: string;
  icon: string;
}

export const categories: TaskCategory[] = [
  { value: 'exercise', label: 'Exercise', color: '#f59e0b', icon: '🏃' },
  { value: 'study', label: 'Study', color: '#3b82f6', icon: '📚' },
  { value: 'spiritual', label: 'Spiritual', color: '#ec4899', icon: '🙏' },
  { value: 'work', label: 'Work', color: '#10b981', icon: '💼' },
  { value: 'personal', label: 'Personal', color: '#6366f1', icon: '🌟' },
  { value: 'family', label: 'Family', color: '#ef4444', icon: '👪' },
  { value: 'hygiene', label: 'Hygiene', color: '#0ea5e9', icon: '🛁' },
  { value: 'meal', label: 'Meal', color: '#65a30d', icon: '🍽️' },
  { value: 'doordash', label: 'DoorDash', color: '#ee2723', icon: '🍔' },
  { value: 'ubereats', label: 'Uber Eats', color: '#06c167', icon: '🍕' },
  { value: 'olivegarden', label: 'Olive Garden', color: '#6c9321', icon: '🥗' },
  { value: 'other', label: 'Other', color: '#6b7280', icon: '📌' },
];

export const getCategoryColor = (category: string) => {
  return categories.find((c) => c.value === category)?.color || '#6b7280';
};
