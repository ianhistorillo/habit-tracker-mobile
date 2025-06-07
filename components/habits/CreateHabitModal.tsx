import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import {
  CalendarClock,
  Activity,
  Smile,
  Check,
  Timer,
  Dumbbell,
  BookOpen,
  Coffee,
  Droplets,
  PieChart,
  X,
} from "lucide-react-native";
import { useHabitStore } from "../../stores/habitStore";
import Modal from "../ui/Modal";

interface CreateHabitModalProps {
  onClose: () => void;
}

const HABIT_ICONS = [
  { icon: Activity, name: "Activity" },
  { icon: Dumbbell, name: "Exercise" },
  { icon: BookOpen, name: "Reading" },
  { icon: Coffee, name: "Coffee" },
  { icon: Droplets, name: "Water" },
  { icon: Timer, name: "Timer" },
  { icon: Smile, name: "Smile" },
  { icon: PieChart, name: "Progress" },
];

const HABIT_COLORS = [
  { color: "#0D9488", name: "Teal" },
  { color: "#8B5CF6", name: "Purple" },
  { color: "#EC4899", name: "Pink" },
  { color: "#F59E0B", name: "Amber" },
  { color: "#10B981", name: "Emerald" },
  { color: "#3B82F6", name: "Blue" },
  { color: "#EF4444", name: "Red" },
  { color: "#6366F1", name: "Indigo" },
];

export default function CreateHabitModal({ onClose }: CreateHabitModalProps) {
  const { addHabit } = useHabitStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "custom">(
    "daily"
  );
  const [targetDays, setTargetDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [selectedColor, setSelectedColor] = useState(HABIT_COLORS[0].color);
  const [selectedIcon, setSelectedIcon] = useState("Activity");
  const [targetValue, setTargetValue] = useState<string>("");
  const [unit, setUnit] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFrequencyChange = (freq: "daily" | "weekly" | "custom") => {
    setFrequency(freq);

    if (freq === "daily") {
      setTargetDays([0, 1, 2, 3, 4, 5, 6]);
    } else if (freq === "weekly") {
      setTargetDays([1, 2, 3, 4, 5]); // Monday to Friday
    }
  };

  const toggleDaySelection = (day: number) => {
    if (targetDays.includes(day)) {
      setTargetDays(targetDays.filter((d) => d !== day));
    } else {
      setTargetDays([...targetDays, day].sort());
    }
  };

  const getDayLabel = (day: number) => {
    const days = ["S", "M", "T", "W", "T", "F", "S"];
    return days[day];
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      // Show error toast
      return;
    }

    if (frequency !== "daily" && targetDays.length === 0) {
      // Show error toast
      return;
    }

    try {
      setLoading(true);
      await addHabit({
        name: name.trim(),
        description: description.trim() || undefined,
        frequency,
        target_days: targetDays,
        color: selectedColor,
        icon: selectedIcon,
        target_value: targetValue ? parseInt(targetValue) : undefined,
        unit: unit.trim() || undefined,
      });

      onClose();
    } catch (error) {
      console.error("Error creating habit:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible onClose={onClose}>
      <View style={styles.header}>
        <Text style={styles.title}>Create New Habit</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Habit Name*</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Read a book"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="e.g., Read at least 20 pages"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Frequency</Text>
            <View style={styles.frequencyButtons}>
              {["daily", "weekly", "custom"].map((freq) => (
                <TouchableOpacity
                  key={freq}
                  style={[
                    styles.frequencyButton,
                    frequency === freq && styles.frequencyButtonActive,
                  ]}
                  onPress={() =>
                    handleFrequencyChange(freq as typeof frequency)
                  }
                >
                  <Text
                    style={[
                      styles.frequencyButtonText,
                      frequency === freq && styles.frequencyButtonTextActive,
                    ]}
                  >
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {frequency === "custom" && (
            <View style={styles.formGroup}>
              <Text style={styles.label}>Select Days</Text>
              <View style={styles.daysContainer}>
                {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayButton,
                      targetDays.includes(day) && styles.dayButtonActive,
                    ]}
                    onPress={() => toggleDaySelection(day)}
                  >
                    <Text
                      style={[
                        styles.dayButtonText,
                        targetDays.includes(day) && styles.dayButtonTextActive,
                      ]}
                    >
                      {getDayLabel(day)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Color</Text>
            <View style={styles.colorGrid}>
              {HABIT_COLORS.map((colorObj) => (
                <TouchableOpacity
                  key={colorObj.color}
                  style={[
                    styles.colorButton,
                    { backgroundColor: colorObj.color },
                    selectedColor === colorObj.color &&
                      styles.colorButtonSelected,
                  ]}
                  onPress={() => setSelectedColor(colorObj.color)}
                >
                  {selectedColor === colorObj.color && (
                    <Check size={16} color="#ffffff" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Icon</Text>
            <View style={styles.iconGrid}>
              {HABIT_ICONS.map((iconObj) => {
                const IconComponent = iconObj.icon;
                return (
                  <TouchableOpacity
                    key={iconObj.name}
                    style={[
                      styles.iconButton,
                      selectedIcon === iconObj.name &&
                        styles.iconButtonSelected,
                    ]}
                    onPress={() => setSelectedIcon(iconObj.name)}
                  >
                    <IconComponent
                      size={20}
                      color={
                        selectedIcon === iconObj.name ? "#0d9488" : "#6b7280"
                      }
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.measurementContainer}>
            <View style={styles.measurementHeader}>
              <CalendarClock size={16} color="#6b7280" />
              <Text style={styles.measurementTitle}>
                Measurement (Optional)
              </Text>
            </View>

            <View style={styles.measurementInputs}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Goal Amount</Text>
                <TextInput
                  style={styles.input}
                  value={targetValue}
                  onChangeText={setTargetValue}
                  placeholder="e.g., 8"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Unit</Text>
                <TextInput
                  style={styles.input}
                  value={unit}
                  onChangeText={setUnit}
                  placeholder="e.g., glasses"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? "Creating..." : "Create Habit"}
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 18,
    fontFamily: "Inter-SemiBold",
    color: "#111827",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
    gap: 20,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: "#374151",
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
  frequencyButtons: {
    flexDirection: "row",
    gap: 8,
  },
  frequencyButton: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  frequencyButtonActive: {
    backgroundColor: "#0d9488",
  },
  frequencyButtonText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: "#4b5563",
  },
  frequencyButtonTextActive: {
    color: "#ffffff",
  },
  daysContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  dayButtonActive: {
    backgroundColor: "#0d9488",
  },
  dayButtonText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: "#4b5563",
  },
  dayButtonTextActive: {
    color: "#ffffff",
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  colorButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  colorButtonSelected: {
    borderWidth: 2,
    borderColor: "#ffffff",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },
  iconButtonSelected: {
    backgroundColor: "#f0fdfa",
    borderColor: "#0d9488",
  },
  measurementContainer: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    padding: 16,
    gap: 12,
  },
  measurementHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  measurementTitle: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: "#374151",
  },
  measurementInputs: {
    flexDirection: "row",
    gap: 12,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: "#4b5563",
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#0d9488",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    fontSize: 14,
    fontFamily: "Inter-Medium",
    color: "#ffffff",
  },
});
