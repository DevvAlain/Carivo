import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { MapPin, Star } from "lucide-react-native";

interface GarageCardProps {
  name: string;
  distance: string;
  rating: string;
  imageUrl: string;
  badge?: string;
  selected?: boolean;
  onPress?: () => void;
}

export default function GarageCard({
  name,
  distance,
  rating,
  imageUrl,
  badge,
  selected = false,
  onPress,
}: GarageCardProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`rounded-xl overflow-hidden flex-1 relative ${
        selected ? "border-2 border-primary" : "border border-border"
      }`}
      style={{ backgroundColor: "#ffffff" }}
    >
      {badge && (
        <View className="absolute top-2 right-2 bg-primary rounded-sm px-2 z-10" style={{ paddingVertical: 2 }}>
          <Text className="text-white text-xs">{badge}</Text>
        </View>
      )}
      <View className="flex-row gap-3 p-3">
        <Image
          source={{ uri: imageUrl }}
          className="w-16 h-16 rounded-lg"
          style={{ width: 64, height: 64 }}
          resizeMode="cover"
        />
        <View className="flex-1">
          <Text className="text-base font-semibold text-foreground leading-tight">
            {name}
          </Text>
          <View className="flex-row items-center gap-1 mt-1">
            <MapPin size={12} color="#8a96a8" strokeWidth={4} />
            <Text className="text-xs text-muted-foreground">{distance}</Text>
          </View>
          <View className="flex-row items-center gap-1 mt-0.5">
            <Star size={12} color="#1a56db" strokeWidth={4} />
            <Text className="text-xs text-primary">{rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
