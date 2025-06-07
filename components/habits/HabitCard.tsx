import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { CheckCircle, MoreVertical, ChevronUp } from "lucide-react-native";
import { useHabitStore } from "../../stores/habitStore";
import { formatDateToYYYYMMDD } from "../../utils/date";
import { Habit } from "../../types";

interface HabitCardProps {
  habit: Habit;
  date?: Date;
}

export default function HabitCard({
  habit,
  date = new Date(),
}: HabitCardProps) {
  const { toggleHabitCompletion, getHabitStreak, getHabitLogsForDate } =
    useHabitStore();
  const [loading, setLoading] = useState(false);

  const formattedDate = formatDateToYYYYMMDD(date);
  const logs = getHabitLogsForDate(formattedDate);

  const log = logs.find((log) => log.habit_id === habit.id);
  const isCompleted = log?.completed || false;
  const streak = getHabitStreak(habit.id).current;

  const handleToggleComplete = async () => {
    try {
      setLoading(true);
      await toggleHabitCompletion(habit.id, formattedDate);
    } catch (error) {
      console.error("Error toggling habit:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: `${habit.color}20` },
            ]}
          >
            <CheckCircle size={20} color={habit.color} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{habit.name}</Text>
            {habit.description && (
              <Text style={styles.description}>{habit.description}</Text>
            )}
          </View>
        </View>

        <View style={styles.actionsContainer}>
          {streak > 0 && (
            <View style={styles.streakBadge}>
              <ChevronUp size={14} color="#0d9488" />
              <Text style={styles.streakText}>{streak}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.menuButton}>
            <MoreVertical size={18} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        onPress={handleToggleComplete}
        disabled={loading}
        style={[
          styles.completeButton,
          isCompleted && { backgroundColor: habit.color },
        ]}
      >
        <Text
          style={[
            styles.completeButtonText,
            isCompleted && styles.completeButtonTextActive,
          ]}
        >
          {isCompleted ? "Completed" : "Mark as Done"}
        </Text>
        {isCompleted && <CheckCircle size={18} color="#ffffff" />}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: "Inter-Medium",
    color: "#111827",
  },
  description: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: "#6b7280",
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdfa",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  streakText: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: "#0d9488",
    marginLeft: 2,
  },
  menuButton: {
    padding: 4,
  },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  completeButtonText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: "#4b5563",
  },
  completeButtonTextActive: {
    color: "#ffffff",
  },
});
