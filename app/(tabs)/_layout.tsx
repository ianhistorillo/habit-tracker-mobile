import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  Activity,
  Calendar,
  LineChart,
  Settings,
  Home,
  Target,
} from "lucide-react-native";

const Tab = createBottomTabNavigator();

import DashboardScreen from "../(tabs)";
import HabitsScreen from "./habits";
import CalendarScreen from "./calendar";

export default function TabLayout() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
        },
        tabBarActiveTintColor: "#0d9488",
        tabBarInactiveTintColor: "#6b7280",
      }}
    >
      <Tab.Screen
        name="index"
        component={DashboardScreen}
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="habits"
        component={HabitsScreen}
        options={{
          title: "Habits",
          tabBarIcon: ({ color, size }) => (
            <Activity size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="calendar"
        component={CalendarScreen}
        options={{
          title: "Calendar",
          tabBarIcon: ({ color, size }) => (
            <Calendar size={size} color={color} />
          ),
        }}
      />
      {/* <Tab.Screen
        name="planner"
        options={{
          title: "Planner",
          tabBarIcon: ({ color, size }) => <Target size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="reports"
        options={{
          title: "Reports",
          tabBarIcon: ({ color, size }) => (
            <LineChart size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} />
          ),
        }}
      /> */}
    </Tab.Navigator>
  );
}
