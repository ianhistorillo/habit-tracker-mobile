import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { Plus, Filter, Search } from "lucide-react-native";
import { useHabitStore } from "../../stores/habitStore";
import HabitCard from "../../components/habits/HabitCard";
import CreateHabitModal from "../../components/habits/CreateHabitModal";

export default function HabitsScreen() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterActive, setFilterActive] = useState(true);

  const { getActiveHabits, getArchivedHabits } = useHabitStore();

  const activeHabits = getActiveHabits();
  const archivedHabits = getArchivedHabits();

  const filteredHabits = (filterActive ? activeHabits : archivedHabits).filter(
    (habit) =>
      habit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (habit.description?.toLowerCase().includes(searchQuery.toLowerCase()) ??
        false)
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Habits</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Plus size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search habits..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterActive && styles.filterButtonActive,
            ]}
            onPress={() => setFilterActive(true)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterActive && styles.filterButtonTextActive,
              ]}
            >
              Active
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              !filterActive && styles.filterButtonActive,
            ]}
            onPress={() => setFilterActive(false)}
          >
            <Text
              style={[
                styles.filterButtonText,
                !filterActive && styles.filterButtonTextActive,
              ]}
            >
              Archived
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {filteredHabits.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Filter size={48} color="#9ca3af" />
          <Text style={styles.emptyTitle}>
            {searchQuery
              ? "No matching habits found"
              : filterActive
              ? "No active habits"
              : "No archived habits"}
          </Text>
          <Text style={styles.emptyText}>
            {searchQuery
              ? `No habits matching "${searchQuery}"`
              : filterActive
              ? "Create your first habit to start tracking your progress!"
              : "You haven't archived any habits yet."}
          </Text>
          {filterActive && !searchQuery && (
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Plus size={20} color="#ffffff" />
              <Text style={styles.createButtonText}>New Habit</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <ScrollView
          style={styles.habitsList}
          contentContainerStyle={styles.habitsListContent}
        >
          {filteredHabits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} />
          ))}
        </ScrollView>
      )}

      {showCreateModal && (
        <CreateHabitModal onClose={() => setShowCreateModal(false)} />
      )}
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
  addButton: {
    backgroundColor: "#0d9488",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    padding: 16,
    gap: 12,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: "#111827",
  },
  filterContainer: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: "#f0fdfa",
  },
  filterButtonText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: "#6b7280",
  },
  filterButtonTextActive: {
    color: "#0d9488",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
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
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0d9488",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 16,
  },
  createButtonText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: "#ffffff",
    marginLeft: 8,
  },
  habitsList: {
    flex: 1,
  },
  habitsListContent: {
    padding: 16,
    gap: 12,
  },
});
