import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  TrendingUp,
  Award,
  BarChart,
  Activity,
  Sparkles,
  Calendar,
} from "lucide-react-native";
import { useHabitStore } from "../../stores/habitStore";
import { formatDateToYYYYMMDD } from "../../utils/date";

export default function ReportsScreen() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week");

  const {
    getActiveHabits,
    getCompletionRateForDate,
    getHabitStreak,
    calculateCompletionRate,
    logs,
  } = useHabitStore();

  const activeHabits = getActiveHabits();

  // Calculate overall stats
  const totalActiveHabits = activeHabits.length;
  const totalLogEntries = logs.length;

  // Calculate streaks for all habits
  const habitStreaks = activeHabits
    .map((habit) => ({
      habit,
      streak: getHabitStreak(habit.id),
    }))
    .sort((a, b) => b.streak.current - a.streak.current);

  const topHabitsByStreak = habitStreaks.slice(0, 3);
  const bestStreak =
    habitStreaks.length > 0 ? habitStreaks[0].streak.longest : 0;

  // Calculate today's completion rate
  const today = new Date();
  const todayStr = formatDateToYYYYMMDD(today);
  const todayCompletionRate = getCompletionRateForDate(todayStr);

  // Calculate weekly completion rates for top habits
  const topHabitsWithCompletion = activeHabits
    .slice(0, 5)
    .map((habit) => ({
      habit,
      weeklyCompletion: calculateCompletionRate(habit.id, 7),
      monthlyCompletion: calculateCompletionRate(habit.id, 30),
    }))
    .sort((a, b) => b.weeklyCompletion - a.weeklyCompletion);

  // Generate last 7 days completion data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = formatDateToYYYYMMDD(date);
    return {
      date: date.toLocaleDateString("en-US", { weekday: "short" }),
      completion: getCompletionRateForDate(dateStr),
    };
  });

  const averageWeeklyCompletion =
    last7Days.reduce((sum, day) => sum + day.completion, 0) / 7;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reports</Text>
        <View style={styles.timeRangeContainer}>
          <TouchableOpacity
            style={[
              styles.timeRangeButton,
              timeRange === "week" && styles.timeRangeButtonActive,
            ]}
            onPress={() => setTimeRange("week")}
          >
            <Text
              style={[
                styles.timeRangeText,
                timeRange === "week" && styles.timeRangeTextActive,
              ]}
            >
              Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.timeRangeButton,
              timeRange === "month" && styles.timeRangeButtonActive,
            ]}
            onPress={() => setTimeRange("month")}
          >
            <Text
              style={[
                styles.timeRangeText,
                timeRange === "month" && styles.timeRangeTextActive,
              ]}
            >
              Month
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {activeHabits.length === 0 ? (
          <View style={styles.emptyContainer}>
            <BarChart size={48} color="#9ca3af" />
            <Text style={styles.emptyTitle}>No data to display</Text>
            <Text style={styles.emptyText}>
              Create some habits and start tracking to see your progress
              reports!
            </Text>
          </View>
        ) : (
          <>
            {/* Overall Stats */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <Text style={styles.statLabel}>Active Habits</Text>
                  <TrendingUp size={20} color="#0d9488" />
                </View>
                <Text style={styles.statValue}>{totalActiveHabits}</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <Text style={styles.statLabel}>Best Streak</Text>
                  <Award size={20} color="#f59e0b" />
                </View>
                <Text style={styles.statValue}>{bestStreak} days</Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <Text style={styles.statLabel}>Weekly Average</Text>
                  <BarChart size={20} color="#10b981" />
                </View>
                <Text style={styles.statValue}>
                  {Math.round(averageWeeklyCompletion)}%
                </Text>
              </View>

              <View style={styles.statCard}>
                <View style={styles.statHeader}>
                  <Text style={styles.statLabel}>Total Logs</Text>
                  <Calendar size={20} color="#8b5cf6" />
                </View>
                <Text style={styles.statValue}>{totalLogEntries}</Text>
              </View>
            </View>

            {/* Weekly Progress Chart */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Weekly Progress</Text>
              <View style={styles.chartContainer}>
                {last7Days.map((day, index) => (
                  <View key={index} style={styles.chartBar}>
                    <View style={styles.chartBarContainer}>
                      <View
                        style={[
                          styles.chartBarFill,
                          {
                            height: `${day.completion}%`,
                            backgroundColor:
                              day.completion >= 80
                                ? "#10b981"
                                : day.completion >= 50
                                ? "#f59e0b"
                                : "#ef4444",
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.chartBarLabel}>{day.date}</Text>
                    <Text style={styles.chartBarValue}>
                      {Math.round(day.completion)}%
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Current Streaks */}
            <View style={styles.streaksCard}>
              <Text style={styles.sectionTitle}>Current Streaks</Text>
              {topHabitsByStreak.length === 0 ? (
                <View style={styles.emptyStreaksContainer}>
                  <Sparkles size={24} color="#9ca3af" />
                  <Text style={styles.emptyStreaksText}>No streaks yet</Text>
                </View>
              ) : (
                <View style={styles.streaksList}>
                  {topHabitsByStreak.map(({ habit, streak }) => (
                    <View key={habit.id} style={styles.streakItem}>
                      <View style={styles.streakInfo}>
                        <View
                          style={[
                            styles.streakIcon,
                            { backgroundColor: `${habit.color}20` },
                          ]}
                        >
                          <Activity size={16} color={habit.color} />
                        </View>
                        <View style={styles.streakDetails}>
                          <Text style={styles.streakHabitName}>
                            {habit.name}
                          </Text>
                          <Text style={styles.streakSubtext}>
                            Longest: {streak.longest} days
                          </Text>
                        </View>
                      </View>
                      <View style={styles.streakBadge}>
                        <Sparkles size={14} color="#f59e0b" />
                        <Text style={styles.streakText}>
                          {streak.current} days
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Habit Performance */}
            <View style={styles.performanceCard}>
              <Text style={styles.sectionTitle}>Habit Performance</Text>
              {topHabitsWithCompletion.length === 0 ? (
                <View style={styles.emptyPerformanceContainer}>
                  <TrendingUp size={24} color="#9ca3af" />
                  <Text style={styles.emptyPerformanceText}>
                    No performance data yet
                  </Text>
                </View>
              ) : (
                <View style={styles.performanceList}>
                  {topHabitsWithCompletion.map(
                    ({ habit, weeklyCompletion }) => (
                      <View key={habit.id} style={styles.performanceItem}>
                        <View style={styles.performanceInfo}>
                          <View
                            style={[
                              styles.performanceIcon,
                              { backgroundColor: `${habit.color}20` },
                            ]}
                          >
                            <Activity size={16} color={habit.color} />
                          </View>
                          <Text style={styles.performanceHabitName}>
                            {habit.name}
                          </Text>
                        </View>
                        <View style={styles.performanceProgress}>
                          <View style={styles.performanceProgressBar}>
                            <View
                              style={[
                                styles.performanceProgressFill,
                                {
                                  width: `${weeklyCompletion}%`,
                                  backgroundColor: habit.color,
                                },
                              ]}
                            />
                          </View>
                          <Text
                            style={[
                              styles.performancePercentage,
                              { color: habit.color },
                            ]}
                          >
                            {Math.round(weeklyCompletion)}%
                          </Text>
                        </View>
                      </View>
                    )
                  )}
                </View>
              )}
            </View>
          </>
        )}
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
  timeRangeContainer: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    overflow: "hidden",
  },
  timeRangeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  timeRangeButtonActive: {
    backgroundColor: "#0d9488",
  },
  timeRangeText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: "#6b7280",
  },
  timeRangeTextActive: {
    color: "#ffffff",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: "#6b7280",
  },
  statValue: {
    fontSize: 24,
    fontFamily: "Inter-Bold",
    color: "#111827",
  },
  chartCard: {
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
  chartTitle: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    color: "#111827",
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 120,
  },
  chartBar: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 2,
  },
  chartBarContainer: {
    width: "100%",
    height: 80,
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  chartBarFill: {
    width: "100%",
    borderRadius: 4,
    minHeight: 4,
  },
  chartBarLabel: {
    fontSize: 10,
    fontFamily: "Inter-Medium",
    color: "#6b7280",
    marginTop: 4,
  },
  chartBarValue: {
    fontSize: 10,
    fontFamily: "Inter-Medium",
    color: "#111827",
    marginTop: 2,
  },
  streaksCard: {
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
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    color: "#111827",
    marginBottom: 16,
  },
  emptyStreaksContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyStreaksText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: "#6b7280",
    marginTop: 8,
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
  streakIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  streakDetails: {
    flex: 1,
  },
  streakHabitName: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: "#111827",
  },
  streakSubtext: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: "#6b7280",
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  streakText: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: "#f59e0b",
  },
  performanceCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  emptyPerformanceContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyPerformanceText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: "#6b7280",
    marginTop: 8,
  },
  performanceList: {
    gap: 16,
  },
  performanceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  performanceInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  performanceIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  performanceHabitName: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: "#111827",
    flex: 1,
  },
  performanceProgress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minWidth: 80,
  },
  performanceProgressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    overflow: "hidden",
  },
  performanceProgressFill: {
    height: "100%",
    borderRadius: 4,
  },
  performancePercentage: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    minWidth: 32,
    textAlign: "right",
  },
});
