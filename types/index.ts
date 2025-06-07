export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  icon?: string;
  color: string;
  frequency: "daily" | "weekly" | "custom";
  target_days: number[];
  target_value?: number;
  unit?: string;
  created_at: string;
  archived_at?: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  date: string;
  completed: boolean;
  value?: number;
  notes?: string;
  created_at: string;
}

export interface Streak {
  habit_id: string;
  user_id: string;
  current: number;
  longest: number;
  last_completed_date?: string;
}

export interface HabitGoal {
  id: string;
  habit_id: string;
  user_id: string;
  target_days: number;
  start_date: string;
  end_date: string;
  notes?: string;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  name?: string;
  created_at: string;
  updated_at: string;
}
