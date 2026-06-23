import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { CarFront, Car, Pencil, Trash2 } from "lucide-react-native";

interface VehicleCardProps {
  name: string;
  type: string;
  brand: string;
  plateTop: string;
  plateBottom: string;
  selected?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function VehicleCard({
  name,
  type,
  brand,
  plateTop,
  plateBottom,
  selected = false,
  onEdit,
  onDelete,
}: VehicleCardProps) {
  return (
    <View
      className="bg-card rounded-xl overflow-hidden"
      style={[
        styles.card,
        selected
          ? { borderWidth: 2, borderColor: "#1a5fd4" }
          : { borderWidth: 2, borderColor: "#e2e8f0" },
      ]}
    >
      {/* Card body */}
      <View className="flex-row items-start gap-3 p-4">
        {/* Car icon thumbnail */}
        <View className="w-20 h-16 rounded-lg bg-muted items-center justify-center flex-shrink-0 overflow-hidden">
          <CarFront size={32} color="#7a8599" strokeWidth={1.5} />
        </View>

        {/* Info */}
        <View className="flex-1">
          <Text className="font-bold text-lg text-foreground leading-tight">
            {name}
          </Text>
          <Text className="text-primary text-sm font-semibold mb-1">{type}</Text>
          <View className="flex-row items-center gap-1">
            <Car size={12} color="#7a8599" strokeWidth={4} />
            <Text className="text-muted-foreground text-xs">
              Hãng: {brand}
            </Text>
          </View>
        </View>

        {/* Plate badge */}
        <View
          className={`rounded-lg px-2 py-2 items-center ${
            selected ? "bg-secondary" : "bg-muted"
          }`}
        >
          <Text
            className={`text-xs font-bold leading-tight ${
              selected ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {plateTop}
          </Text>
          <Text
            className={`text-xs font-bold leading-tight ${
              selected ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {plateBottom}
          </Text>
        </View>
      </View>

      {/* Action footer */}
      <View className="border-t border-border flex-row">
        <TouchableOpacity
          onPress={onEdit}
          className="flex-1 flex-row items-center justify-center gap-2 py-3 bg-muted"
        >
          <Pencil size={14} color="#0d0d0d" strokeWidth={3.4} />
          <Text className="text-sm font-medium text-foreground">Sửa</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity
          onPress={onDelete}
          className="flex-1 flex-row items-center justify-center gap-2 py-3"
        >
          <Trash2 size={14} color="#e53935" strokeWidth={3.4} />
          <Text className="text-sm font-medium" style={{ color: "#e53935" }}>
            Xóa
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
  },
  divider: {
    width: 1,
    backgroundColor: "#e2e8f0",
  },
});
