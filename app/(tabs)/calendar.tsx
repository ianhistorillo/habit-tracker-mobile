import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Calendar, Flag, ChevronLeft, ChevronRight } from "lucide-react-native";
import {
  getDatesForWeek,
  formatDateForDisplay,
  formatDateToYYYYMMDD,
  isToday,
  getPreviousWeek,
  getNextWeek,
  getMonthDates,
} from "../../utils/date";
import { useHabitStore } from "../../stores/habitStore";
import HabitCard from "../../components/habits/HabitCard";

export default function CalendarScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const weekDates = getDatesForWeek(currentDate);
  const monthDates = getMonthDates(currentDate);

  const { getActiveHabits, getHabitLogsForDate } = useHabitStore();
  const activeHabits = getActiveHabits();

  const handlePreviousWeek = () => {
    setCurrentDate(getPreviousWeek(currentDate));
  };

  const handleNextWeek = () => {
    setCurrentDate(getNextWeek(currentDate));
  };

  const setSelectedDay = (date: Date) => {
    setCurrentDate(date);
  };

  const selectedDateStr = formatDateToYYYYMMDD(currentDate);
  const habitsForSelectedDate = activeHabits.filter((habit) => {
    const dayOfWeek = currentDate.getDay();

    if (habit.frequency === "daily") return true;

    if (habit.frequency === "weekly" || habit.frequency === "custom") {
      return habit.target_days.includes(dayOfWeek);
    }

    return false;
  });

  const getDayClass = (date: Date) => {
    const isSelected =
      formatDateToYYYYMMDD(date) === formatDateToYYYYMMDD(currentDate);

    let style = [styles.dayButton];

    if (isSelected) {
      style.push(styles.dayButtonSelected);
    } else if (isToday(date)) {
      style.push(styles.dayButtonToday);
    }

    return style;
  };

  const getHabitsForDay = (date: Date) => {
    const dateStr = formatDateToYYYYMMDD(date);
    const dayOfWeek = date.getDay();

    const habitsForDay = activeHabits.filter((habit) => {
      if (habit.frequency === "daily") return true;

      if (habit.frequency === "weekly" || habit.frequency === "custom") {
        return habit.target_days.includes(dayOfWeek);
      }

      return false;
    });

    const logs = getHabitLogsForDate(dateStr);
    const completedHabits = habitsForDay.filter((habit) =>
      logs.some((log) => log.habit_id === habit.id && log.completed)
    );

    return {
      total: habitsForDay.length,
      completed: completedHabits.length,
    };
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Calendar</Text>

        <View style={styles.viewModeContainer}>
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === "week" && styles.viewModeButtonActive,
            ]}
            onPress={() => setViewMode("week")}
          >
            <Text
              style={[
                styles.viewModeText,
                viewMode === "week" && styles.viewModeTextActive,
              ]}
            >
              Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.viewModeButton,
              viewMode === "month" && styles.viewModeButtonActive,
            ]}
            onPress={() => setViewMode("month")}
          >
            <Text
              style={[
                styles.viewModeText,
                viewMode === "month" && styles.viewModeTextActive,
              ]}
            >
              Month
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.calendarContainer}>
        {viewMode === "week" ? (
          <>
            <View style={styles.weekHeader}>
              <Text style={styles.weekTitle}>
                {formatDateForDisplay(weekDates[0])} -{" "}
                {formatDateForDisplay(weekDates[6])}
              </Text>

              <View style={styles.navigationButtons}>
                <TouchableOpacity
                  style={styles.navButton}
                  onPress={handlePreviousWeek}
                >
                  <ChevronLeft size={20} color="#6b7280" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.todayButton}
                  onPress={() => setCurrentDate(new Date())}
                >
                  <Text style={styles.todayButtonText}>Today</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.navButton}
                  onPress={handleNextWeek}
                >
                  <ChevronRight size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.weekGrid}>
              {weekDates.map((date) => {
                const dateStr = formatDateToYYYYMMDD(date);
                const dayName = date.toLocaleDateString("en-US", {
                  weekday: "short",
                });
                const dayNum = date.getDate();
                const { total, completed } = getHabitsForDay(date);

                return (
                  <TouchableOpacity
                    key={dateStr}
                    style={getDayClass(date)}
                    onPress={() => setSelectedDay(date)}
                  >
                    <Text style={styles.dayName}>{dayName}</Text>
                    <Text style={styles.dayNumber}>{dayNum}</Text>
                    {total > 0 && (
                      <View style={styles.habitIndicator}>
                        <Flag size={12} color="#0d9488" />
                        <Text style={styles.habitCount}>
                          {completed}/{total}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        ) : (
          <View style={styles.monthContainer}>
            <View style={styles.monthHeader}>
              <Text style={styles.monthTitle}>
                {currentDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </Text>
              <View style={styles.navigationButtons}>
                <TouchableOpacity
                  style={styles.navButton}
                  onPress={() =>
                    setCurrentDate(
                      new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth() - 1
                      )
                    )
                  }
                >
                  <ChevronLeft size={20} color="#6b7280" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.todayButton}
                  onPress={() => setCurrentDate(new Date())}
                >
                  <Text style={styles.todayButtonText}>Today</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.navButton}
                  onPress={() =>
                    setCurrentDate(
                      new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth() + 1
                      )
                    )
                  }
                >
                  <ChevronRight size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.monthDaysHeader}>
              {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                <Text key={day} style={styles.monthDayHeader}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.monthGrid}>
              {monthDates.map((week, weekIndex) => (
                <View key={weekIndex} style={styles.monthWeek}>
                  {week.map((date) => {
                    const { total, completed } = getHabitsForDay(date);
                    const isCurrentMonth =
                      date.getMonth() === currentDate.getMonth();

                    return (
                      <TouchableOpacity
                        key={date.toISOString()}
                        style={[
                          styles.monthDay,
                          !isCurrentMonth && styles.monthDayOtherMonth,
                          isToday(date) && styles.monthDayToday,
                        ]}
                        onPress={() => setSelectedDay(date)}
                      >
                        <Text
                          style={[
                            styles.monthDayText,
                            !isCurrentMonth && styles.monthDayTextOtherMonth,
                            isToday(date) && styles.monthDayTextToday,
                          ]}
                        >
                          {date.getDate()}
                        </Text>
                        {total > 0 && isCurrentMonth && (
                          <View
                            style={[
                              styles.monthHabitDot,
                              {
                                backgroundColor:
                                  completed === total ? "#0d9488" : "#f59e0b",
                              },
                            ]}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <View style={styles.selectedDateContainer}>
        <View style={styles.selectedDateHeader}>
          <Text style={styles.selectedDateTitle}>
            {formatDateForDisplay(currentDate)}
          </Text>
          <View style={styles.habitsBadge}>
            <Text style={styles.habitsBadgeText}>
              {habitsForSelectedDate.length} Habits
            </Text>
          </View>
        </View>

        {habitsForSelectedDate.length === 0 ? (
          <View style={styles.noHabitsContainer}>
            <Calendar size={24} color="#9ca3af" />
            <Text style={styles.noHabitsText}>
              No habits scheduled for this day.
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.habitsList}
            contentContainerStyle={styles.habitsListContent}
          >
            {habitsForSelectedDate.map((habit) => (
              <HabitCard key={habit.id} habit={habit} date={currentDate} />
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    marginTop: 40,
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
  viewModeContainer: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    overflow: "hidden",
  },
  viewModeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewModeButtonActive: {
    backgroundColor: "#0d9488",
  },
  viewModeText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: "#6b7280",
  },
  viewModeTextActive: {
    color: "#ffffff",
  },
  calendarContainer: {
    backgroundColor: "#ffffff",
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  weekTitle: {
    fontSize: 16,
    fontFamily: "Inter-Medium",
    color: "#111827",
  },
  navigationButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  navButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#f3f4f6",
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#f3f4f6",
  },
  todayButtonText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: "#6b7280",
  },
  weekGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayButton: {
    flex: 1,
    alignItems: "center",
    padding: 8,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  dayButtonSelected: {
    backgroundColor: "#0d9488",
  },
  dayButtonToday: {
    backgroundColor: "#f0fdfa",
  },
  dayName: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: "#6b7280",
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    color: "#111827",
    marginBottom: 4,
  },
  habitIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  habitCount: {
    fontSize: 10,
    fontFamily: "Inter-Medium",
    color: "#0d9488",
  },
  monthContainer: {
    flex: 1,
  },
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  monthTitle: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    color: "#111827",
  },
  monthDaysHeader: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  monthDayHeader: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: "#6b7280",
    textAlign: "center",
    width: 40,
  },
  monthGrid: {
    gap: 4,
  },
  monthWeek: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  monthDay: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    position: "relative",
  },
  monthDayOtherMonth: {
    opacity: 0.3,
  },
  monthDayToday: {
    backgroundColor: "#0d9488",
  },
  monthDayText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: "#111827",
  },
  monthDayTextOtherMonth: {
    color: "#9ca3af",
  },
  monthDayTextToday: {
    color: "#ffffff",
  },
  monthHabitDot: {
    position: "absolute",
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  selectedDateContainer: {
    flex: 1,
    margin: 16,
    marginTop: 0,
  },
  selectedDateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  selectedDateTitle: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    color: "#111827",
  },
  habitsBadge: {
    backgroundColor: "#f0fdfa",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  habitsBadgeText: {
    fontSize: 12,
    fontFamily: "Inter-Medium",
    color: "#0d9488",
  },
  noHabitsContainer: {
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
  noHabitsText: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: "#6b7280",
    marginTop: 8,
  },
  habitsList: {
    flex: 1,
  },
  habitsListContent: {
    gap: 12,
  },
});
