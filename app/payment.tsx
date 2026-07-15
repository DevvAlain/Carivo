import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, ArrowRight, CircleAlert } from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import BookingInfoCard from "@/components/payment/BookingInfoCard";
import PaymentMethodList from "@/components/payment/PaymentMethodList";
import PriceSummary from "@/components/payment/PriceSummary";
import ScreenState from "@/components/common/ScreenState";
import { api, ApiError } from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { Promotion } from "@/lib/types";
import { useApp } from "@/providers/AppProvider";

const AVATAR =
  "https://storage.googleapis.com/banani-avatars/avatar/male/25-35/East Asian/0";

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    garageId?: string;
    garageName?: string;
    servicePackageId?: string;
    serviceName?: string;
    vehicleId?: string;
    vehicleName?: string;
    vehiclePlate?: string;
    startTime?: string;
    price?: string;
    addOnServiceIds?: string;
    addonTotal?: string;
  }>();
  const { accessToken, isAuthenticated } = useApp();
  const [selectedPayment, setSelectedPayment] = useState("card");
  const [promoCode, setPromoCode] = useState("");
  const [usedPoints, setUsedPoints] = useState("0");
  const [submitting, setSubmitting] = useState(false);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [pointsDiscount, setPointsDiscount] = useState(0);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  const addonIds = params.addOnServiceIds
    ? params.addOnServiceIds.split(",").filter(Boolean)
    : [];
  const basePrice = Number(params.price ?? 0) + Number(params.addonTotal ?? 0);
  const total = Math.max(0, basePrice - promoDiscount - pointsDiscount);

  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated || !accessToken) {
        setLoading(false);
        return;
      }

      try {
        const [promotionsResponse, loyaltyResponse] = await Promise.all([
          api.getPromotions({ limit: 10 }),
          api.getLoyaltySummary(accessToken),
        ]);
        setPromotions(promotionsResponse.data ?? []);
        setCurrentPoints(loyaltyResponse.data.loyalty?.available_points ?? 0);
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : "Không thể tải ưu đãi.";
        Alert.alert("Lỗi dữ liệu", message);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, [accessToken, isAuthenticated]);

  const priceRows = useMemo(
    () => [
      { label: "Tạm tính", value: formatCurrency(basePrice) },
      {
        label: "Khuyến mãi",
        value: promoDiscount ? `- ${formatCurrency(promoDiscount)}` : formatCurrency(0),
        danger: promoDiscount > 0,
      },
      {
        label: "Điểm thưởng",
        value: pointsDiscount ? `- ${formatCurrency(pointsDiscount)}` : formatCurrency(0),
        danger: pointsDiscount > 0,
      },
    ],
    [basePrice, pointsDiscount, promoDiscount]
  );

  const handleApplyPromo = async () => {
    if (!accessToken || !params.servicePackageId || !promoCode) {
      Alert.alert("Thiếu mã", "Vui lòng nhập mã khuyến mãi hợp lệ.");
      return;
    }

    try {
      const response = await api.validatePromotion(
        accessToken,
        promoCode,
        params.servicePackageId
      );
      setPromoDiscount(response.data.discount_amount ?? 0);
      Alert.alert("Áp mã thành công", `Bạn được giảm ${formatCurrency(response.data.discount_amount ?? 0)}.`);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Không thể áp mã.";
      Alert.alert("Mã không hợp lệ", message);
      setPromoDiscount(0);
    }
  };

  const handleApplyPoints = async () => {
    if (!accessToken || !params.servicePackageId) {
      return;
    }

    const points = Number(usedPoints || 0);
    if (!Number.isFinite(points) || points < 0) {
      Alert.alert("Điểm không hợp lệ", "Vui lòng nhập số điểm hợp lệ.");
      return;
    }

    try {
      const response = await api.redeemPreview(accessToken, {
        service_package_id: params.servicePackageId,
        promotion_code: promoCode || undefined,
        used_points: points,
      });
      const finalPrice = response.data.final_price ?? basePrice;
      setPointsDiscount(Math.max(0, basePrice - promoDiscount - finalPrice));
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Không thể áp điểm.";
      Alert.alert("Không thể áp điểm", message);
      setPointsDiscount(0);
    }
  };

  const handleConfirmBooking = async () => {
    if (!isAuthenticated || !accessToken) {
      router.push("/login");
      return;
    }

    if (
      !params.garageId ||
      !params.servicePackageId ||
      !params.vehicleId ||
      !params.startTime
    ) {
      Alert.alert("Thiếu dữ liệu", "Thiếu thông tin booking để xác nhận.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.createBooking(accessToken, {
        garage_id: params.garageId,
        vehicle_id: params.vehicleId,
        service_package_id: params.servicePackageId,
        add_on_service_ids: addonIds.length > 0 ? addonIds : undefined,
        start_time: params.startTime,
        promotion_code: promoCode || undefined,
        used_points: Number(usedPoints || 0) || undefined,
        note:
          selectedPayment === "card"
            ? "Customer xác nhận booking từ mobile app."
            : `Phương thức UI đã chọn: ${selectedPayment}. Thanh toán online chưa nối cho app customer.`,
      });

      router.replace({
        pathname: "/payment-success",
        params: {
          bookingId: response.data.id,
          garageName: params.garageName,
          serviceName: params.serviceName,
          startTime: params.startTime,
          total: String(response.data.final_price ?? total),
        },
      });
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Không thể tạo booking.";
      Alert.alert("Tạo booking thất bại", message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)/booking");
  };

  if (!params.servicePackageId || !params.garageId || !params.startTime) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenState
          title="Thiếu dữ liệu đặt lịch"
          description="Quay lại màn booking để chọn garage, dịch vụ và khung giờ."
          actionLabel="Quay lại booking"
          onAction={() => router.replace("/(tabs)/booking")}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 pt-5 pb-3 bg-background">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={handleBack}>
            <ArrowLeft size={22} color="#1a1a1a" strokeWidth={2.2} />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-primary">Xác nhận booking</Text>
        </View>
        <Image
          source={{ uri: AVATAR }}
          style={{ width: 36, height: 36, borderRadius: 18 }}
        />
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        <View className="mx-4 mb-4 rounded-xl bg-secondary px-4 py-3 flex-row gap-3">
          <CircleAlert size={20} color="#1a5fd4" strokeWidth={2.4} />
          <View className="flex-1">
            <Text className="font-semibold text-primary">
              Thanh toán online đang tạm bỏ qua
            </Text>
            <Text className="text-sm text-primary/80 mt-1 leading-5">
              Backend hiện chưa có endpoint customer riêng để khởi tạo PayOS.
              App sẽ tạo booking trước, còn thanh toán thực tế xử lý sau.
            </Text>
          </View>
        </View>

        <BookingInfoCard
          info={{
            serviceName: params.serviceName ?? "Dịch vụ đã chọn",
            price: formatCurrency(basePrice),
            plate: params.vehiclePlate ?? "Chưa rõ biển số",
            time: formatDateTime(params.startTime),
            location: params.garageName ?? "Garage đã chọn",
          }}
        />

        <View className="mx-4 mb-4 rounded-xl border border-border bg-card p-4 gap-3">
          <Text className="text-xs font-bold text-muted-foreground tracking-wide">
            KHUYẾN MÃI
          </Text>
          <View className="flex-row gap-2">
            <TextInput
              value={promoCode}
              onChangeText={setPromoCode}
              placeholder="Nhập mã khuyến mãi"
              placeholderTextColor="#94a3b8"
              className="flex-1 rounded-xl border border-border bg-input px-3 py-3 text-foreground"
            />
            <TouchableOpacity
              onPress={handleApplyPromo}
              className="rounded-xl bg-primary px-4 justify-center"
            >
              <Text className="text-white font-semibold">Áp dụng</Text>
            </TouchableOpacity>
          </View>
          {promotions.length > 0 ? (
            <View className="flex-row flex-wrap gap-2">
              {promotions.slice(0, 3).map((promotion) => (
                <TouchableOpacity
                  key={promotion.id}
                  onPress={() => setPromoCode(promotion.code)}
                  className="rounded-full bg-secondary px-3 py-2"
                >
                  <Text className="text-xs font-medium text-primary">
                    {promotion.code}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </View>

        {isAuthenticated ? (
          <View className="mx-4 mb-4 rounded-xl border border-border bg-card p-4 gap-3">
            <Text className="text-xs font-bold text-muted-foreground tracking-wide">
              ĐIỂM TÍCH LŨY
            </Text>
            <Text className="text-sm text-foreground">
              Bạn hiện có {currentPoints} điểm.
            </Text>
            <View className="flex-row gap-2">
              <TextInput
                value={usedPoints}
                onChangeText={setUsedPoints}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="#94a3b8"
                className="flex-1 rounded-xl border border-border bg-input px-3 py-3 text-foreground"
              />
              <TouchableOpacity
                onPress={handleApplyPoints}
                className="rounded-xl bg-dark px-4 justify-center"
              >
                <Text className="text-white font-semibold">Áp điểm</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        <PaymentMethodList
          selectedId={selectedPayment}
          onSelect={setSelectedPayment}
        />

        <PriceSummary rows={priceRows} total={formatCurrency(total)} />

        <View className="px-4 pb-4">
          <TouchableOpacity
            disabled={submitting || loading}
            onPress={handleConfirmBooking}
            className="w-full bg-primary py-4 rounded-xl flex-row items-center justify-center gap-2"
          >
            {submitting || loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Text className="text-white text-base font-semibold">
                  Xác nhận đặt lịch
                </Text>
                <ArrowRight size={18} color="#ffffff" strokeWidth={2.7} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
