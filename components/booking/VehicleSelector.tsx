import { View, Text, TouchableOpacity } from "react-native";
import { Car, Bike } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";

interface Vehicle {
  id: string;
  icon: LucideIcon;
  name: string;
  plate: string;
}

interface VehicleSelectorProps {
  vehicles: Vehicle[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function VehicleSelector({
  vehicles,
  selectedId,
  onSelect,
}: VehicleSelectorProps) {
  return (
    <View className="px-4 mb-4">
      <Text className="text-lg font-bold text-foreground mb-2">
        Chọn phương tiện
      </Text>
      <View className="flex-row gap-3">
        {vehicles.map((v) => {
          const Icon = v.icon;
          const selected = v.id === selectedId;
          return (
            <TouchableOpacity
              key={v.id}
              onPress={() => onSelect(v.id)}
              className={`flex-1 rounded-xl p-4 flex-col items-center gap-1 bg-card ${
                selected ? "border-2 border-primary" : "border border-border"
              }`}
            >
              <Icon
                size={28}
                color={selected ? "#1a56db" : "#8a96a8"}
                strokeWidth={1.72}
              />
              <Text
                className={`text-sm font-semibold ${
                  selected ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {v.name}
              </Text>
              <Text className="text-xs text-muted-foreground">{v.plate}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
