import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from "react-native";
import {
  Settings,
  Moon,
  Sun,
  Bell,
  Download,
  Trash2,
  LogOut,
  User,
  Shield,
} from "lucide-react-native";
import { useAuthStore } from "../../stores/authStore";
import { useHabitStore } from "../../stores/habitStore";

export default function SettingsScreen({ navigation }) {
  const { user, signOut } = useAuthStore();
  const { habits, logs, streaks } = useHabitStore();

  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            await signOut();
            navigation.replace("Auth");
          } catch (error) {
            console.error("Error signing out:", error);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleExportData = () => {
    const data = {
      habits,
      logs,
      streaks,
      exportedAt: new Date().toISOString(),
    };

    // In a real app, this would trigger a file download or share
    Alert.alert(
      "Export Data",
      `Your data has been prepared for export.\n\nHabits: ${habits.length}\nLogs: ${logs.length}\nStreaks: ${streaks.length}`,
      [{ text: "OK" }]
    );
  };

  const handleClearAllData = () => {
    Alert.alert(
      "Clear All Data",
      "This will permanently delete all your habits, logs, and progress. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Everything",
          style: "destructive",
          onPress: () => {
            // In a real app, this would clear all user data
            Alert.alert("Data Cleared", "All your data has been deleted.");
          },
        },
      ]
    );
  };

  const settingSections = [
    {
      title: "Account",
      items: [
        {
          icon: <User size={20} color="#6b7280" />,
          title: "Profile",
          subtitle: user?.email || "Not signed in",
          onPress: () => {},
        },
      ],
    },
    {
      title: "Preferences",
      items: [
        {
          icon: darkMode ? (
            <Moon size={20} color="#6b7280" />
          ) : (
            <Sun size={20} color="#6b7280" />
          ),
          title: "Dark Mode",
          subtitle: "Toggle dark theme",
          rightComponent: (
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: "#e5e7eb", true: "#0d9488" }}
              thumbColor={darkMode ? "#ffffff" : "#f3f4f6"}
            />
          ),
        },
        {
          icon: <Bell size={20} color="#6b7280" />,
          title: "Notifications",
          subtitle: "Daily habit reminders",
          rightComponent: (
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#e5e7eb", true: "#0d9488" }}
              thumbColor={notificationsEnabled ? "#ffffff" : "#f3f4f6"}
            />
          ),
        },
      ],
    },
    {
      title: "Data",
      items: [
        {
          icon: <Download size={20} color="#6b7280" />,
          title: "Export Data",
          subtitle: "Download your habits and progress",
          onPress: handleExportData,
        },
        {
          icon: <Trash2 size={20} color="#ef4444" />,
          title: "Clear All Data",
          subtitle: "Permanently delete everything",
          onPress: handleClearAllData,
          destructive: true,
        },
      ],
    },
    {
      title: "Account Actions",
      items: [
        {
          icon: <LogOut size={20} color="#ef4444" />,
          title: "Sign Out",
          subtitle: "Sign out of your account",
          onPress: handleSignOut,
          destructive: true,
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.iconContainer}>
          <Settings size={20} color="#0d9488" />
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Stats Overview */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Your Progress</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{habits.length}</Text>
              <Text style={styles.statLabel}>Total Habits</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{logs.length}</Text>
              <Text style={styles.statLabel}>Log Entries</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{streaks.length}</Text>
              <Text style={styles.statLabel}>Active Streaks</Text>
            </View>
          </View>
        </View>

        {/* Settings Sections */}
        {settingSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.settingItem,
                    itemIndex === section.items.length - 1 &&
                      styles.settingItemLast,
                  ]}
                  onPress={item.onPress}
                  disabled={!item.onPress}
                >
                  <View style={styles.settingItemLeft}>
                    <View style={styles.settingIcon}>{item.icon}</View>
                    <View style={styles.settingText}>
                      <Text
                        style={[
                          styles.settingTitle,
                          item.destructive && styles.settingTitleDestructive,
                        ]}
                      >
                        {item.title}
                      </Text>
                      <Text style={styles.settingSubtitle}>
                        {item.subtitle}
                      </Text>
                    </View>
                  </View>
                  {item.rightComponent && (
                    <View style={styles.settingRight}>
                      {item.rightComponent}
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>HabitHub v1.0.0</Text>
          <Text style={styles.appInfoText}>
            Built with ❤️ for better habits
          </Text>
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
  statsCard: {
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
  statsTitle: {
    fontSize: 16,
    fontFamily: "Inter-SemiBold",
    color: "#111827",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontFamily: "Inter-Bold",
    color: "#0d9488",
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: "#6b7280",
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Inter-SemiBold",
    color: "#6b7280",
    marginBottom: 8,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  settingItemLast: {
    borderBottomWidth: 0,
  },
  settingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f9fafb",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontFamily: "Inter-Medium",
    color: "#111827",
  },
  settingTitleDestructive: {
    color: "#ef4444",
  },
  settingSubtitle: {
    fontSize: 14,
    fontFamily: "Inter-Regular",
    color: "#6b7280",
    marginTop: 2,
  },
  settingRight: {
    marginLeft: 12,
  },
  appInfo: {
    alignItems: "center",
    padding: 24,
  },
  appInfoText: {
    fontSize: 12,
    fontFamily: "Inter-Regular",
    color: "#9ca3af",
    marginBottom: 4,
  },
});
