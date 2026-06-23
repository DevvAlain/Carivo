import { View, Text } from "react-native";
import { Clock, Star } from "lucide-react-native";

interface StatsRowProps {
  waitMinutes?: number;
  loyaltyPoints?: string;
  waitLabel?: string;
  pointsLabel?: string;
}

export default function StatsRow({
  waitMinutes = 12,
  loyaltyPoints = "1,250",
  waitLabel = "Phút chờ ước tính",
  pointsLabel = "Điểm tích lũy",
}: StatsRowProps) {
  return (
    <View className="px-4 mt-4 flex-row gap-3">
      {/* Wait time card */}
      <View className="flex-1 bg-secondary rounded-xl p-4">
        <Clock size={24} color="#1a5fd4" strokeWidth={2} />
        <Text className="text-primary font-bold text-3xl mt-2">
          {waitMinutes}
        </Text>
        <Text className="text-muted-foreground text-sm mt-1">
          {waitLabel}
        </Text>
      </View>

      {/* Loyalty points card */}
      <View className="flex-1 bg-dark rounded-xl p-4">
        <View className="w-8 h-8 rounded-full border-2 border-white items-center justify-center">
          <Star size={16} color="#ffffff" strokeWidth={3} />
        </View>
        <Text className="text-white font-bold text-3xl mt-2">
          {loyaltyPoints}
        </Text>
        <Text className="text-muted-foreground text-sm mt-1">
          {pointsLabel}
        </Text>
      </View>
    </View>
  );
}
