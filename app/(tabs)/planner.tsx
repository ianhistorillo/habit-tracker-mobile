import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import {
  Target,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Plus,
} from "lucide-react-native";
import { useHabitStore } from "../../stores/habitStore";
import { useAuthStore } from "../../stores/authStore";
import { supabase } from "../../lib/supabase";
import { HabitGoal } from "../../types";

export default function PlannerScreen() {
  const { user } = useAuthStore();
  const { getActiveHabits, getHabitLogsForDate } = useHabitStore();
  const activeHabits = getActiveHabits();

  const [selectedHabit, setSelectedHabit] = useState(activeHabits[0]?.id || "");
  const [targetDays, setTargetDays] = useState("30");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState<HabitGoal[]>([]);

  useEffect(() => {
    if (activeHabits.length > 0 && !selectedHabit) {
      setSelectedHabit(activeHabits[0].id);
    }
  }, [activeHabits, selectedHabit]);

  useEffect(() => {
    fetchGoals();
  }, [user]);

  const fetchGoals = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data: goalsData, error } = await supabase
        .from("habit_goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGoals(goalsData || []);
    } catch (error) {
      console.error("Error fetching goals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    if (!selectedHabit || !user) return;

    const targetDaysNum = parseInt(targetDays);
    if (isNaN(targetDaysNum) || targetDaysNum < 1) return;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + targetDaysNum);

    try {
      setLoading(true);
      const { data: newGoal, error } = await supabase
        .from("habit_goals")
        .insert({
          habit_id: selectedHabit,
          user_id: user.id,
          target_days: targetDaysNum,
          start_date: startDate.toISOString().split("T")[0],
          end_date: endDate.toISOString().split("T")[0],
          notes: notes.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      setGoals((prevGoals) => [newGoal, ...prevGoals]);
      setNotes("");
      setTargetDays("30");
    } catch (error) {
      console.error("Error creating goal:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      const { error } = await supabase
        .from("habit_goals")
        .delete()
        .eq("id", goalId);

      if (error) throw error;
      setGoals(goals.filter((g) => g.id !== goalId));
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  };

  const calculateGoalProgress = (goal: HabitGoal) => {
    const startDate = new Date(goal.start_date);
    const endDate = new Date(goal.end_date);
    const today = new Date();

    const totalDays =
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;
    const daysPassed = Math.min(
      Math.ceil(
        (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1,
      totalDays
    );

    let completedDays = 0;
    for (let i = 0; i < daysPassed; i++) {
      const checkDate = new Date(startDate);
      checkDate.setDate(startDate.getDate() + i);
      const dateStr = checkDate.toISOString().split("T")[0];

      const logs = getHabitLogsForDate(dateStr);
      if (logs.some((log) => log.habit_id === goal.habit_id && log.completed)) {
        completedDays++;
      }
    }

    const progress = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;
    const isEffective = progress >= 80;

    return {
      completedDays,
      totalDays,
      daysPassed,
      progress,
      isEffective,
    };
  };

  if (activeHabits.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Planner</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Target size={48} color="#9ca3af" />
          <Text style={styles.emptyTitle}>No habits available</Text>
          <Text style={styles.emptyText}>
            Create some habits first to start planning your goals!
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Planner</Text>
        <View style={styles.iconContainer}>
          <Target size={20} color="#0d9488" />
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.createGoalCard}>
          <Text style={styles.cardTitle}>Create New Goal</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Select Habit</Text>
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerText}>
                {activeHabits.find((h) => h.id === selectedHabit)?.name ||
                  "Select a habit"}
              </Text>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Target Days</Text>
            <TextInput
              style={styles.input}
              value={targetDays}
              onChangeText={setTargetDays}
              placeholder="30"
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add motivation or notes for this goal..."
              multiline
              numberOfLines={3}
              placeholderTextColor="#9ca3af"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.createButton,
              loading && styles.createButtonDisabled,
            ]}
            onPress={handleCreateGoal}
            disabled={loading || !selectedHabit}
          >
            <Plus size={20} color="#ffffff" />
            <Text style={styles.createButtonText}>
              {loading ? "Creating..." : "Create Goal"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.goalsSection}>
          <Text style={styles.sectionTitle}>Active Goals</Text>

          {goals.length === 0 ? (
            <View style={styles.emptyGoalsContainer}>
              <Calendar size={24} color="#9ca3af" />
              <Text style={styles.emptyGoalsText}>
                No active goals yet. Create one to start tracking!
              </Text>
            </View>
          ) : (
            <View style={styles.goalsList}>
              {goals.map((goal) => {
                const habit = activeHabits.find((h) => h.id === goal.habit_id);
                if (!habit) return null;

                const { completedDays, totalDays, progress, isEffective } =
                  calculateGoalProgress(goal);

                return (
                  <View key={goal.id} style={styles.goalCard}>
                    <View style={styles.goalHeader}>
                      <View style={styles.goalInfo}>
                        <Text style={styles.goalHabitName}>{habit.name}</Text>
                        <Text style={styles.goalDates}>
                          {new Date(goal.start_date).toLocaleDateString()} -{" "}
                          {new Date(goal.end_date).toLocaleDateString()}
                        </Text>
                      </View>
                      <View style={styles.goalActions}>
                        <TouchableOpacity
                          onPress={() => handleDeleteGoal(goal.id)}
                          style={styles.deleteButton}
                        >
                          <Trash2 size={16} color="#ef4444" />
                        </TouchableOpacity>
                        <View
                          style={[
                            styles.goalIcon,
                            { backgroundColor: `${habit.color}20` },
                          ]}
                        >
                          <Target size={20} color={habit.color} />
                        </View>
                      </View>
                    </View>

                    <View style={styles.progressSection}>
                      <View style={styles.progressHeader}>
                        <Text style={styles.progressLabel}>Progress</Text>
                        <Text style={styles.progressText}>
                          {completedDays}/{totalDays} days
                        </Text>
                      </View>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${progress}%`,
                              backgroundColor: habit.color,
                            },
                          ]}
                        />
                      </View>
                    </View>

                    <View style={styles.statusSection}>
                      <View style={styles.statusIndicator}>
                        {isEffective ? (
                          <CheckCircle size={20} color="#10b981" />
                        ) : progress >= 50 ? (
                          <AlertCircle size={20} color="#f59e0b" />
                        ) : (
                          <XCircle size={20} color="#ef4444" />
                        )}
                        <Text style={styles.statusText}>
                          {isEffective
                            ? "Highly Effective"
                            : progress >= 50
                            ? "Moderately Effective"
                            : "Needs Improvement"}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.progressPercentage,
                          { color: habit.color },
                        ]}
                      >
                        {Math.round(progress)}%
                      </Text>
                    </View>

                    {goal.notes && (
                      <Text style={styles.goalNotes}>{goal.notes}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter-Bold",
    color: "#111827",
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0fdfa",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  createGoalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    color: "#111827",
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: "#374151",
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
  },
  pickerText: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: "#111827",
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: "#111827",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0d9488",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: 16,
    fontFamily: "Inter-Medium",
    color: "#ffffff",
  },
  goalsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    color: "#111827",
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: "#6b7280",
    textAlign: "center",
  },
  emptyGoalsContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyGoalsText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: "#6b7280",
    marginTop: 8,
    textAlign: "center",
  },
  goalsList: {
    gap: 16,
  },
  goalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  goalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  goalInfo: {
    flex: 1,
  },
  goalHabitName: {
    fontSize: 16,
    fontFamily: "Inter-Medium",
    color: "#111827",
  },
  goalDates: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: "#6b7280",
    marginTop: 2,
  },
  goalActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deleteButton: {
    padding: 8,
  },
  goalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: "#6b7280",
  },
  progressText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: "#111827",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  statusSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 8,
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: "#111827",
  },
  progressPercentage: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
  },
  goalNotes: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: "#6b7280",
    marginTop: 12,
    fontStyle: "italic",
  },
});
