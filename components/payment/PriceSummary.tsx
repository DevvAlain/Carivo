import { View, Text } from "react-native";

interface PriceRow {
  label: string;
  value: string;
  danger?: boolean;
}

interface PriceSummaryProps {
  rows: PriceRow[];
  total: string;
}

export default function PriceSummary({ rows, total }: PriceSummaryProps) {
  return (
    <View className="bg-card mx-4 mb-4 rounded-xl border border-border p-4">
      {rows.map((row, index) => (
        <View key={index} className="flex-row justify-between py-1">
          <Text className="text-sm text-foreground">{row.label}</Text>
          <Text
            className={`text-sm font-medium ${
              row.danger ? "text-danger" : "text-foreground"
            }`}
          >
            {row.value}
          </Text>
        </View>
      ))}
      <View className="border-t border-border mt-2 pt-2 flex-row justify-between">
        <Text className="text-base font-bold text-foreground">Tổng cộng</Text>
        <Text className="text-base font-bold text-primary">{total}</Text>
      </View>
    </View>
  );
}
