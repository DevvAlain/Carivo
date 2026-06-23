import { View, Text } from "react-native";
import { Car, Clock, MapPin } from "lucide-react-native";

interface BookingInfo {
  serviceName: string;
  price: string;
  plate: string;
  time: string;
  location: string;
}

interface BookingInfoCardProps {
  info: BookingInfo;
}

function InfoItem({
  icon: Icon,
  label,
  value,
  fullWidth,
}: {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  label: string;
  value: string;
  fullWidth?: boolean;
}) {
  return (
    <View
      className={`flex-row items-center gap-2 ${fullWidth ? "col-span-2" : ""}`}
    >
      <Icon size={16} color="#8a96a8" strokeWidth={3} />
      <View>
        <Text className="text-xs text-muted-foreground">{label}</Text>
        <Text className="text-sm font-bold text-foreground">{value}</Text>
      </View>
    </View>
  );
}

export default function BookingInfoCard({ info }: BookingInfoCardProps) {
  return (
    <View className="mx-4 mb-4 bg-card rounded-xl p-4 border border-border">
      <View className="flex-row items-center justify-between mb-2">
        <View className="bg-secondary rounded-full px-2 py-0.5">
          <Text className="text-xs text-primary">Dịch vụ đã chọn</Text>
        </View>
        <Text className="text-base font-bold text-primary">{info.price}</Text>
      </View>

      <Text className="text-base font-semibold text-foreground mb-3">
        {info.serviceName}
      </Text>

      <View
        className="border-t border-border pt-3"
        style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}
      >
        <View className="flex-row items-center gap-2" style={{ flex: 1 }}>
          <Car size={16} color="#8a96a8" strokeWidth={3} />
          <View>
            <Text className="text-xs text-muted-foreground">Biển số xe</Text>
            <Text className="text-sm font-bold text-foreground">
              {info.plate}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center gap-2" style={{ flex: 1 }}>
          <Clock size={16} color="#8a96a8" strokeWidth={3} />
          <View>
            <Text className="text-xs text-muted-foreground">Thời gian</Text>
            <Text className="text-sm font-bold text-foreground">
              {info.time}
            </Text>
          </View>
        </View>
        <View
          className="flex-row items-center gap-2 mt-1"
          style={{ width: "100%" }}
        >
          <MapPin size={16} color="#8a96a8" strokeWidth={3} />
          <View>
            <Text className="text-xs text-muted-foreground">Địa điểm</Text>
            <Text className="text-sm font-bold text-foreground">
              {info.location}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
