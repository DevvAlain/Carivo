import { View, Text, TouchableOpacity } from "react-native";

type SlotState = "selected" | "available" | "booked";

interface TimeSlot {
  id: string;
  label: string;
  state: SlotState;
}

interface TimeSlotGridProps {
  slots: TimeSlot[];
  onSelect: (id: string) => void;
}

function slotStyle(state: SlotState) {
  switch (state) {
    case "selected":
      return {
        container: "bg-secondary border-2 border-primary",
        text: "text-primary",
      };
    case "booked":
      return {
        container: "bg-muted",
        text: "text-muted-foreground",
      };
    default:
      return {
        container: "bg-card border border-border",
        text: "text-foreground",
      };
  }
}

export default function TimeSlotGrid({ slots, onSelect }: TimeSlotGridProps) {
  const rows: TimeSlot[][] = [];
  for (let i = 0; i < slots.length; i += 3) {
    rows.push(slots.slice(i, i + 3));
  }

  return (
    <View className="px-4 mb-4">
      <Text className="text-lg font-bold text-foreground mb-2">
        Khung giờ trống
      </Text>
      {rows.map((row, ri) => (
        <View key={ri} className="flex-row gap-2 mb-2">
          {row.map((slot) => {
            const style = slotStyle(slot.state);
            return (
              <TouchableOpacity
                key={slot.id}
                disabled={slot.state === "booked"}
                onPress={() => onSelect(slot.id)}
                className={`flex-1 rounded-xl py-3 px-2 items-center justify-center ${style.container}`}
              >
                <Text
                  className={`text-sm font-medium text-center leading-tight ${style.text}`}
                >
                  {slot.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}
