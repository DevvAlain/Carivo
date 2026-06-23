import { View, Text, TouchableOpacity } from "react-native";
import { Car, ChevronRight, Plus } from "lucide-react-native";

interface Car {
  name: string;
  plate: string;
}

interface MyCarSectionProps {
  cars?: Car[];
  isGuest?: boolean;
  onViewAll?: () => void;
  onCarPress?: (car: Car) => void;
  onAddCar?: () => void;
}

export default function MyCarSection({
  cars = [],
  isGuest = false,
  onViewAll,
  onCarPress,
  onAddCar,
}: MyCarSectionProps) {
  const primaryCar = cars[0];

  return (
    <View className="px-4 mt-5">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="font-bold text-xl text-foreground">Xe của tôi</Text>
        <TouchableOpacity onPress={onViewAll}>
          <Text className="text-primary text-sm font-medium">Xem tất cả</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row gap-3">
        {primaryCar ? (
          <TouchableOpacity
            onPress={() => onCarPress?.(primaryCar)}
            className="flex-1 bg-card rounded-xl border-2 border-primary flex-row items-center px-3 py-3 gap-3"
          >
            <View className="w-12 h-12 rounded-lg bg-secondary items-center justify-center flex-shrink-0">
              <Car size={24} color="#1a5fd4" strokeWidth={2} />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-base text-foreground">
                {primaryCar.name}
              </Text>
              <Text className="text-sm text-muted-foreground">
                {primaryCar.plate}
              </Text>
            </View>
            <ChevronRight size={16} color="#7a8599" strokeWidth={3} />
          </TouchableOpacity>
        ) : (
          <View className="flex-1 bg-card rounded-xl border border-border px-4 py-4 justify-center">
            <Text className="font-semibold text-base text-foreground">
              {isGuest ? "Đăng nhập để lưu xe của bạn" : "Chưa có phương tiện"}
            </Text>
            <Text className="text-sm text-muted-foreground mt-1">
              {isGuest
                ? "Tài khoản khách chỉ xem được thông tin công khai."
                : "Thêm xe để đặt lịch nhanh hơn ở lần sau."}
            </Text>
          </View>
        )}

        <TouchableOpacity
          onPress={onAddCar}
          className="w-16 bg-card rounded-xl border border-border items-center justify-center"
        >
          <View className="w-10 h-10 rounded-lg bg-muted items-center justify-center">
            <Plus size={20} color="#7a8599" strokeWidth={2.4} />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
