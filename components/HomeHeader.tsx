import { View, Text, Image, TouchableOpacity } from "react-native";
import { Bell } from "lucide-react-native";

interface HomeHeaderProps {
  userName?: string;
  avatarUrl?: string;
  onNotificationPress?: () => void;
}

export default function HomeHeader({
  userName = "User",
  avatarUrl = "https://storage.googleapis.com/banani-avatars/avatar/male/25-35/European/0",
  onNotificationPress,
}: HomeHeaderProps) {
  const resolvedAvatarUrl =
    avatarUrl && avatarUrl.trim().length > 0
      ? avatarUrl
      : "https://storage.googleapis.com/banani-avatars/avatar/male/25-35/European/0";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";

  return (
    <View className="flex-row items-center justify-between px-4 pt-5 pb-3 bg-background">
      <View className="flex-row items-center gap-3">
        <View className="w-11 h-11 rounded-xl overflow-hidden">
          <Image source={{ uri: resolvedAvatarUrl }} className="w-11 h-11" />
        </View>
        <Text className="text-primary font-semibold text-lg">
          {greeting}, {userName}
        </Text>
      </View>
      <TouchableOpacity
        onPress={onNotificationPress}
        className="w-9 h-9 items-center justify-center rounded-lg bg-card border border-border"
      >
        <Bell size={18} color="#0d0d0d" strokeWidth={2.7} />
      </TouchableOpacity>
    </View>
  );
}
