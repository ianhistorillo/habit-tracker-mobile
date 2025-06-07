import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          icon: string | null;
          color: string;
          frequency: "daily" | "weekly" | "custom";
          target_days: number[];
          target_value: number | null;
          unit: string | null;
          created_at: string;
          archived_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          icon?: string | null;
          color: string;
          frequency: "daily" | "weekly" | "custom";
          target_days: number[];
          target_value?: number | null;
          unit?: string | null;
          created_at?: string;
          archived_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          icon?: string | null;
          color?: string;
          frequency?: "daily" | "weekly" | "custom";
          target_days?: number[];
          target_value?: number | null;
          unit?: string | null;
          created_at?: string;
          archived_at?: string | null;
        };
      };
      habit_logs: {
        Row: {
          id: string;
          habit_id: string;
          user_id: string;
          date: string;
          completed: boolean;
          value: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          habit_id: string;
          user_id: string;
          date: string;
          completed?: boolean;
          value?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          habit_id?: string;
          user_id?: string;
          date?: string;
          completed?: boolean;
          value?: number | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      streaks: {
        Row: {
          habit_id: string;
          user_id: string;
          current: number;
          longest: number;
          last_completed_date: string | null;
        };
        Insert: {
          habit_id: string;
          user_id: string;
          current?: number;
          longest?: number;
          last_completed_date?: string | null;
        };
        Update: {
          habit_id?: string;
          user_id?: string;
          current?: number;
          longest?: number;
          last_completed_date?: string | null;
        };
      };
      habit_goals: {
        Row: {
          id: string;
          habit_id: string;
          user_id: string;
          target_days: number;
          start_date: string;
          end_date: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          habit_id: string;
          user_id: string;
          target_days: number;
          start_date: string;
          end_date: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          habit_id?: string;
          user_id?: string;
          target_days?: number;
          start_date?: string;
          end_date?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
    };
  };
};
