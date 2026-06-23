import { View, Text, TouchableOpacity } from "react-native";
import type { LucideIcon } from "lucide-react-native";

interface ServiceItemProps {
  icon: LucideIcon;
  iconVariant?: "primary" | "muted";
  name: string;
  subtitle: string;
  price: string;
  onPress?: () => void;
}

export default function ServiceItem({
  icon: Icon,
  iconVariant = "muted",
  name,
  subtitle,
  price,
  onPress,
}: ServiceItemProps) {
  const bgClass = iconVariant === "primary" ? "bg-primary" : "bg-muted";
  const iconColor = iconVariant === "primary" ? "#ffffff" : "#0d0d0d";

  return (
    <View className="flex-row items-center gap-4 py-3">
      <View
        className={`w-14 h-14 rounded-xl items-center justify-center flex-shrink-0 ${bgClass}`}
      >
        <Icon size={26} color={iconColor} strokeWidth={1.85} />
      </View>
      <View className="flex-1">
        <Text className="font-semibold text-base text-foreground">{name}</Text>
        <Text className="text-sm text-muted-foreground">{subtitle}</Text>
      </View>
      <View className="items-end">
        <Text className="font-bold text-base text-primary">{price}</Text>
        <TouchableOpacity onPress={onPress}>
          <Text className="text-primary text-sm">Chi tiết</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
