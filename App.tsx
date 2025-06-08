import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import Toast from "react-native-toast-message";
import { useEffect } from "react";
import { useAuthStore } from "./stores/authStore";

// Screens
import TabLayout from "./app/(tabs)/_layout";
import AuthScreen from "./app/(auth)";

import DashboardScreen from "./app/(tabs)";
import HabitsScreen from "./app/(tabs)/habits";
import CalendarScreen from "./app/(tabs)/calendar";
import PlannerScreen from "./app/(tabs)/planner";
import ReportsScreen from "./app/(tabs)/reports";
import SettingsScreen from "./app/(tabs)/settings";

// import DashboardScreen from './screens/DashboardScreen';
// import HabitsScreen from './screens/HabitsScreen';
// import CalendarScreen from './screens/CalendarScreen';
// import PlannerScreen from './screens/PlannerScreen';
// import ReportsScreen from './screens/ReportsScreen';
// import SettingsScreen from './screens/SettingsScreen';

// Icons
import {
  Activity,
  Calendar,
  LineChart,
  Settings,
  Home,
  Target,
} from "./components/icons";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
        },
        tabBarActiveTintColor: "#0d9488",
        tabBarInactiveTintColor: "#6b7280",
        headerShown: false,
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
      <Tab.Screen
        name="planner"
        component={PlannerScreen}
        options={{
          title: "Planner",
          tabBarIcon: ({ color, size }) => (
            <Calendar size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="reports"
        component={ReportsScreen}
        options={{
          title: "Reports",
          tabBarIcon: ({ color, size }) => (
            <LineChart size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="settings"
        component={SettingsScreen}
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {/* <Stack.Screen name="Test" component={Test} /> */}
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="Auth" component={AuthScreen} />
          {/* <Stack.Screen name="Main" component={Tabs} /> */}
        </Stack.Navigator>
        <StatusBar style="auto" />
        <Toast />
      </NavigationContainer>
    </View>
  );
}
