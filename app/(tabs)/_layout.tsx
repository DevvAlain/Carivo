import { Tabs } from "expo-router";
import { Home, Star, CalendarDays, User } from "lucide-react-native";
import { View } from "react-native";

const COLORS = {
  primary: "#1a5fd4",
  secondary: "#dbe7fb",
  mutedForeground: "#7a8599",
  card: "#ffffff",
  border: "#e2e8f0",
};

function TabIcon({
  icon: Icon,
  focused,
}: {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  focused: boolean;
}) {
  return (
    <View className={focused ? "bg-secondary rounded-lg px-3 py-1" : "px-3 py-1"}>
      <Icon
        size={22}
        color={focused ? COLORS.primary : COLORS.mutedForeground}
        strokeWidth={2.2}
      />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.mutedForeground,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          marginTop: -2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ focused }) => <TabIcon icon={Home} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: "Điểm thưởng",
          tabBarIcon: ({ focused }) => <TabIcon icon={Star} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="booking"
        options={{
          title: "Đặt lịch",
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={CalendarDays} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Cá nhân",
          tabBarIcon: ({ focused }) => <TabIcon icon={User} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
