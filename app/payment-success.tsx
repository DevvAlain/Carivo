import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Check, Calendar, MapPin, CarFront, House, Shield } from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { formatCurrency, formatDateTimeLong } from "@/lib/format";

function DecorativeDot({
  top,
  left,
  right,
  size,
  opacity,
  rotate,
}: {
  top: number;
  left?: number;
  right?: number;
  size: number;
  opacity: number;
  rotate: number;
}) {
  return (
    <View
      style={[
        styles.dot,
        {
          top,
          left,
          right,
          width: size,
          height: size,
          opacity,
          transform: [{ rotate: `${rotate}deg` }],
        },
      ]}
    />
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size: number; color: string; strokeWidth: number }>;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-start gap-3">
      <View className="w-10 h-10 rounded-lg bg-muted items-center justify-center flex-shrink-0">
        <Icon size={20} color="#7a8599" strokeWidth={2.4} />
      </View>
      <View className="flex-1">
        <Text className="text-xs text-muted-foreground mb-0.5">{label}</Text>
        <Text className="text-sm font-medium text-foreground">{value}</Text>
      </View>
    </View>
  );
}

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    bookingId?: string;
    garageName?: string;
    serviceName?: string;
    startTime?: string;
    total?: string;
  }>();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={["#d6e4f7", "#e8f0fa", "#f0f4fa"]}
          locations={[0, 0.6, 1]}
          className="relative items-center pt-14 pb-8 px-6"
        >
          <DecorativeDot top={32} left={40} size={12} opacity={0.4} rotate={12} />
          <DecorativeDot top={64} right={48} size={8} opacity={0.3} rotate={-12} />
          <DecorativeDot top={112} right={32} size={12} opacity={0.3} rotate={45} />
          <DecorativeDot top={128} left={32} size={8} opacity={0.25} rotate={0} />

          <View className="w-24 h-24 rounded-full bg-secondary items-center justify-center mb-5">
            <View className="w-16 h-16 rounded-full border-4 border-primary items-center justify-center">
              <Check size={32} color="#1a5fd4" strokeWidth={1.5} />
            </View>
          </View>

          <Text className="text-2xl font-bold text-primary text-center mb-2">
            Đặt lịch thành công
          </Text>
          <Text className="text-muted-foreground text-sm text-center leading-relaxed">
            Booking đã được tạo cho customer. Thanh toán online đang được bỏ qua
            tạm thời ở mobile app.
          </Text>
        </LinearGradient>

        <View className="mx-4 -mt-2 bg-card rounded-xl px-5 py-4" style={styles.card}>
          <View className="flex-row items-center justify-between pb-3 border-b border-border">
            <Text className="text-sm text-foreground">Mã booking</Text>
            <Text className="text-sm font-semibold text-primary">
              {params.bookingId ?? "N/A"}
            </Text>
          </View>

          <View className="flex-col gap-4 py-4">
            <DetailRow
              icon={Calendar}
              label="Ngày & giờ"
              value={
                params.startTime
                  ? formatDateTimeLong(params.startTime)
                  : "Chưa có thời gian"
              }
            />
            <DetailRow
              icon={MapPin}
              label="Địa điểm"
              value={params.garageName ?? "Garage đã chọn"}
            />
            <DetailRow
              icon={CarFront}
              label="Gói dịch vụ"
              value={params.serviceName ?? "Dịch vụ đã chọn"}
            />
          </View>

          <View style={styles.dashedBorder} className="pt-3 flex-row items-center justify-between">
            <Text className="text-sm font-medium text-foreground">Tổng cộng</Text>
            <Text className="text-base font-bold text-primary">
              {formatCurrency(Number(params.total ?? 0))}
            </Text>
          </View>
        </View>

        <View className="px-4 mt-5 gap-3">
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/profile")}
            className="bg-primary rounded-xl py-4 flex-row items-center justify-center gap-2"
          >
            <Calendar size={20} color="#ffffff" strokeWidth={2.4} />
            <Text className="text-white font-semibold text-base">Xem hồ sơ booking</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(tabs)")}
            className="bg-card border border-border rounded-xl py-4 flex-row items-center justify-center gap-2"
          >
            <House size={20} color="#1a5fd4" strokeWidth={2.4} />
            <Text className="text-primary font-semibold text-base">
              Quay lại Trang chủ
            </Text>
          </TouchableOpacity>
        </View>

        <View className="items-center mt-6 pb-6 gap-3">
          <View className="flex-row items-center gap-2">
            <Shield size={14} color="#7a8599" strokeWidth={3.4} />
            <Text className="text-xs text-muted-foreground">
              Booking đã ghi nhận, phần thanh toán customer sẽ nối sau.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  dot: {
    position: "absolute",
    backgroundColor: "#1a5fd4",
    borderRadius: 2,
  },
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  dashedBorder: {
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    borderStyle: "dashed",
  },
});
