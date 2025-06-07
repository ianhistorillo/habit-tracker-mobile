import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { Habit, HabitLog, Streak } from "../types";
import { useAuthStore } from "./authStore";

interface HabitStore {
  habits: Habit[];
  logs: HabitLog[];
  streaks: Streak[];
  loading: boolean;

  // Actions
  fetchUserData: () => Promise<void>;
  addHabit: (
    habit: Omit<Habit, "id" | "user_id" | "created_at">
  ) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  archiveHabit: (id: string) => Promise<void>;
  toggleHabitCompletion: (habitId: string, date: string) => Promise<void>;

  // Getters
  getActiveHabits: () => Habit[];
  getArchivedHabits: () => Habit[];
  getHabitLogsForDate: (date: string) => HabitLog[];
  getHabitStreak: (habitId: string) => Streak;
  isHabitDueToday: (habit: Habit) => boolean;
  getCompletionRateForDate: (date: string) => number;
  calculateCompletionRate: (habitId: string, days?: number) => number;
}

export const useHabitStore = create<HabitStore>((set, get) => ({
  habits: [],
  logs: [],
  streaks: [],
  loading: false,

  fetchUserData: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      set({ loading: true });

      // Fetch habits
      const { data: habits, error: habitsError } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (habitsError) throw habitsError;

      // Fetch logs
      const { data: logs, error: logsError } = await supabase
        .from("habit_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (logsError) throw logsError;

      // Fetch streaks
      const { data: streaks, error: streaksError } = await supabase
        .from("streaks")
        .select("*")
        .eq("user_id", user.id);

      if (streaksError) throw streaksError;

      set({ habits: habits || [], logs: logs || [], streaks: streaks || [] });
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      set({ loading: false });
    }
  },

  addHabit: async (habitData) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    try {
      const { data: habit, error } = await supabase
        .from("habits")
        .insert([{ ...habitData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        habits: [habit, ...state.habits],
        streaks: [
          ...state.streaks,
          {
            habit_id: habit.id,
            user_id: user.id,
            current: 0,
            longest: 0,
          },
        ],
      }));
    } catch (error) {
      console.error("Error creating habit:", error);
      throw error;
    }
  },

  updateHabit: async (id, updates) => {
    try {
      const { error } = await supabase
        .from("habits")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      set((state) => ({
        habits: state.habits.map((habit) =>
          habit.id === id ? { ...habit, ...updates } : habit
        ),
      }));
    } catch (error) {
      console.error("Error updating habit:", error);
      throw error;
    }
  },

  archiveHabit: async (id) => {
    try {
      const { error } = await supabase
        .from("habits")
        .update({ archived_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      set((state) => ({
        habits: state.habits.map((habit) =>
          habit.id === id
            ? { ...habit, archived_at: new Date().toISOString() }
            : habit
        ),
      }));
    } catch (error) {
      console.error("Error archiving habit:", error);
      throw error;
    }
  },

  toggleHabitCompletion: async (habitId, date) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const existingLog = get().logs.find(
      (log) => log.habit_id === habitId && log.date === date
    );

    try {
      if (existingLog) {
        const { error } = await supabase
          .from("habit_logs")
          .update({ completed: !existingLog.completed })
          .eq("id", existingLog.id);

        if (error) throw error;

        set((state) => ({
          logs: state.logs.map((log) =>
            log.id === existingLog.id
              ? { ...log, completed: !log.completed }
              : log
          ),
        }));
      } else {
        const { data: newLog, error } = await supabase
          .from("habit_logs")
          .insert([
            {
              habit_id: habitId,
              user_id: user.id,
              date,
              completed: true,
            },
          ])
          .select()
          .single();

        if (error) throw error;

        set((state) => ({
          logs: [newLog, ...state.logs],
        }));
      }

      // Update streaks
      await get().updateStreak(habitId);
    } catch (error) {
      console.error("Error updating habit completion:", error);
      throw error;
    }
  },

  updateStreak: async (habitId) => {
    const user = useAuthStore.getState().user;
    if (!user) return;

    const logs = get()
      .logs.filter((log) => log.habit_id === habitId && log.completed)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let currentStreak = 0;
    let longestStreak = 0;
    let lastCompletedDate = null;

    if (logs.length > 0) {
      currentStreak = 1;
      longestStreak = 1;
      lastCompletedDate = logs[logs.length - 1].date;

      for (let i = logs.length - 1; i > 0; i--) {
        const currentDate = new Date(logs[i].date);
        const prevDate = new Date(logs[i - 1].date);

        const diffInDays = Math.floor(
          (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffInDays === 1) {
          currentStreak++;
          longestStreak = Math.max(longestStreak, currentStreak);
        } else {
          break;
        }
      }
    }

    try {
      const { error } = await supabase.from("streaks").upsert({
        habit_id: habitId,
        user_id: user.id,
        current: currentStreak,
        longest: longestStreak,
        last_completed_date: lastCompletedDate,
      });

      if (error) throw error;

      set((state) => ({
        streaks: state.streaks.map((streak) =>
          streak.habit_id === habitId
            ? {
                ...streak,
                current: currentStreak,
                longest: longestStreak,
                last_completed_date: lastCompletedDate,
              }
            : streak
        ),
      }));
    } catch (error) {
      console.error("Error updating streak:", error);
    }
  },

  getActiveHabits: () => {
    return get().habits.filter((habit) => !habit.archived_at);
  },

  getArchivedHabits: () => {
    return get().habits.filter((habit) => habit.archived_at);
  },

  getHabitLogsForDate: (date) => {
    return get().logs.filter((log) => log.date === date);
  },

  getHabitStreak: (habitId) => {
    const streak = get().streaks.find((s) => s.habit_id === habitId);
    return streak || { habit_id: habitId, user_id: "", current: 0, longest: 0 };
  },

  isHabitDueToday: (habit) => {
    const today = new Date();
    const dayOfWeek = today.getDay();

    if (habit.frequency === "daily") {
      return true;
    }

    if (habit.frequency === "weekly" || habit.frequency === "custom") {
      return habit.target_days.includes(dayOfWeek);
    }

    return false;
  },

  getCompletionRateForDate: (date) => {
    const habits = get()
      .getActiveHabits()
      .filter((habit) => get().isHabitScheduledForDate(habit, date));

    if (habits.length === 0) return 0;

    const logs = get().getHabitLogsForDate(date);
    const completedHabits = habits.filter((habit) =>
      logs.some((log) => log.habit_id === habit.id && log.completed)
    ).length;

    return (completedHabits / habits.length) * 100;
  },

  isHabitScheduledForDate: (habit, dateStr) => {
    if (habit.frequency === "daily") return true;

    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();

    return habit.target_days.includes(dayOfWeek);
  },

  calculateCompletionRate: (habitId, days = 30) => {
    const habit = get().habits.find((h) => h.id === habitId);
    if (!habit) return 0;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const dateRange = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split("T")[0];
      if (get().isHabitScheduledForDate(habit, dateStr)) {
        dateRange.push(dateStr);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (dateRange.length === 0) return 0;

    const logs = get()
      .logs.filter((log) => log.habit_id === habitId && log.completed)
      .map((log) => log.date);

    const completedDays = dateRange.filter((date) =>
      logs.includes(date)
    ).length;

    return (completedDays / dateRange.length) * 100;
  },
}));

// Initialize user data when auth state changes
useAuthStore.subscribe((state, prevState) => {
  if (state.user?.id !== prevState?.user?.id) {
    useHabitStore.getState().fetchUserData();
  }
});
