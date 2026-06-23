import { View, Text, TouchableOpacity, ScrollView } from "react-native";

interface DateItem {
  dayLabel: string;
  date: number;
  dateKey: string;
}

interface DateStripProps {
  dates: DateItem[];
  selectedKey: string;
  onSelect: (key: string) => void;
  goldBadge?: string;
}

export default function DateStrip({
  dates,
  selectedKey,
  onSelect,
  goldBadge,
}: DateStripProps) {
  return (
    <View className="px-4 mb-4">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-lg font-bold text-foreground">Chọn ngày</Text>
        {goldBadge && (
          <View className="bg-secondary rounded-full px-2 py-1">
            <Text className="text-xs text-primary font-medium">{goldBadge}</Text>
          </View>
        )}
      </View>
      <View className="flex-row gap-2">
        {dates.map((item) => {
          const selected = item.dateKey === selectedKey;
          return (
            <TouchableOpacity
              key={item.dateKey}
              onPress={() => onSelect(item.dateKey)}
              className={`flex-1 rounded-xl py-2 flex-col items-center ${
                selected
                  ? "bg-primary"
                  : "bg-card border border-border"
              }`}
            >
              <Text
                className={`text-xs ${selected ? "text-white" : "text-foreground"}`}
              >
                {item.dayLabel}
              </Text>
              <Text
                className={`text-lg font-bold ${
                  selected ? "text-white" : "text-foreground"
                }`}
              >
                {item.date}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
