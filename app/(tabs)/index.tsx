import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import {
  Activity,
  Calendar,
  Clock,
  TrendingUp,
  Plus,
  Sparkles,
} from "lucide-react-native";
import { useAuthStore } from "../../stores/authStore";
import { useHabitStore } from "../../stores/habitStore";
import {
  formatDateToYYYYMMDD,
  formatDateForDisplay,
  isToday,
} from "../../utils/date";
import HabitCard from "../../components/habits/HabitCard";

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const {
    getActiveHabits,
    isHabitDueToday,
    getCompletionRateForDate,
    getHabitStreak,
    fetchUserData,
    loading,
  } = useHabitStore();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const today = new Date();
  const formattedToday = formatDateToYYYYMMDD(today);
  const todayForDisplay = formatDateForDisplay(today);

  const activeHabits = getActiveHabits();
  const habitsForToday = activeHabits.filter((habit) => isHabitDueToday(habit));
  const completionRate = getCompletionRateForDate(formattedToday);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();

    if (hour < 12) {
      return "Good Morning";
    } else if (hour < 18) {
      return "Good Afternoon";
    } else {
      return "Good Evening";
    }
  };

  const topStreaks = activeHabits
    .map((habit) => ({
      habit,
      streak: getHabitStreak(habit.id).current,
    }))
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 3);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <View style={styles.dateContainer}>
            <Calendar size={16} color="#6b7280" />
            <Text style={styles.dateText}>{todayForDisplay}</Text>
            <Clock size={16} color="#6b7280" style={styles.clockIcon} />
            <Text style={styles.timeText}>
              {currentTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        </View>

        {habitsForToday.length > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <TrendingUp size={16} color="#0d9488" />
              <Text style={styles.progressText}>
                {Math.round(completionRate)}% Complete
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View
                style={[styles.progressFill, { width: `${completionRate}%` }]}
              />
            </View>
          </View>
        )}
      </View>

      {habitsForToday.length === 0 ? (
        <View style={styles.emptyState}>
          <Activity size={48} color="#9ca3af" />
          <Text style={styles.emptyTitle}>No habits for today</Text>
          <Text style={styles.emptyText}>
            Create your first habit to start tracking your progress!
          </Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Plus size={20} color="#ffffff" />
            <Text style={styles.createButtonText}>Create Habit</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Habits</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {habitsForToday.length} Habits
              </Text>
            </View>
          </View>

          <View style={styles.habitsList}>
            {habitsForToday.map((habit) => (
              <HabitCard key={habit.id} habit={habit} />
            ))}
          </View>
        </View>
      )}

      <View style={styles.statsContainer}>
        <View style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <Text style={styles.statsTitle}>Current Streaks</Text>
            <Sparkles size={20} color="#f59e0b" />
          </View>

          {topStreaks.length === 0 ? (
            <Text style={styles.emptyStats}>No streaks yet</Text>
          ) : (
            <View style={styles.streaksList}>
              {topStreaks.map(({ habit, streak }) => (
                <View key={habit.id} style={styles.streakItem}>
                  <View style={styles.streakInfo}>
                    <View
                      style={[
                        styles.habitIcon,
                        { backgroundColor: `${habit.color}20` },
                      ]}
                    >
                      <Activity size={16} color={habit.color} />
                    </View>
                    <Text style={styles.habitName}>{habit.name}</Text>
                  </View>
                  <View style={styles.streakBadge}>
                    <Text style={styles.streakText}>{streak} days</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <Text style={styles.statsTitle}>Quick Stats</Text>
            <TrendingUp size={20} color="#0d9488" />
          </View>

          <View style={styles.quickStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{activeHabits.length}</Text>
              <Text style={styles.statLabel}>Active Habits</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {topStreaks.length > 0 ? topStreaks[0].streak : 0}
              </Text>
              <Text style={styles.statLabel}>Best Streak</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Math.round(completionRate)}%
              </Text>
              <Text style={styles.statLabel}>Today's Progress</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  greeting: {
    fontSize: 24,
    fontFamily: "Inter-Bold",
    color: "#111827",
    marginBottom: 8,
    marginTop: 40,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: "#6b7280",
    marginLeft: 4,
  },
  clockIcon: {
    marginLeft: 12,
  },
  timeText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: "#6b7280",
    marginLeft: 4,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: "#0d9488",
    marginLeft: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#0d9488",
    borderRadius: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    margin: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
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
    marginBottom: 20,
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0d9488",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: "#ffffff",
    marginLeft: 8,
  },
  section: {
    margin: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    color: "#111827",
  },
  badge: {
    backgroundColor: "#f0fdfa",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: "#0d9488",
  },
  habitsList: {
    gap: 12,
  },
  statsContainer: {
    margin: 16,
    gap: 16,
  },
  statsCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontFamily: "Inter-Medium",
    color: "#111827",
  },
  emptyStats: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: "#6b7280",
    textAlign: "center",
    padding: 20,
  },
  streaksList: {
    gap: 12,
  },
  streakItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
  },
  streakInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  habitIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  habitName: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: "#111827",
    flex: 1,
  },
  streakBadge: {
    backgroundColor: "#f0fdfa",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  streakText: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: "#0d9488",
  },
  quickStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontFamily: "Inter-Bold",
    color: "#111827",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: "#6b7280",
  },
});
