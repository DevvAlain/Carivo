import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, ArrowRight, Bike, Car, HelpCircle } from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import StepIndicator from "@/components/booking/StepIndicator";
import GarageCard from "@/components/booking/GarageCard";
import VehicleSelector from "@/components/booking/VehicleSelector";
import DateStrip from "@/components/booking/DateStrip";
import TimeSlotGrid from "@/components/booking/TimeSlotGrid";
import ScreenState from "@/components/common/ScreenState";
import { api, ApiError } from "@/lib/api";
import { addDays, formatCurrency, toDateInputValue } from "@/lib/format";
import type { AvailableSlot, Garage, ServicePackage, Vehicle } from "@/lib/types";
import { useApp } from "@/providers/AppProvider";

const STEPS = [
  { number: 1, label: "Địa điểm", state: "done" as const },
  { number: 2, label: "Dịch vụ", state: "active" as const },
  { number: 3, label: "Xác nhận", state: "inactive" as const },
];

function toVehicleName(vehicle: Vehicle) {
  return `${vehicle.brand ?? ""} ${vehicle.model ?? ""}`.trim() || vehicle.vehicle_type;
}

export default function BookingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ servicePackageId?: string }>();
  const { accessToken, isAuthenticated } = useApp();
  const [garages, setGarages] = useState<Garage[]>([]);
  const [services, setServices] = useState<ServicePackage[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedGarageId, setSelectedGarageId] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState(
    params.servicePackageId ?? ""
  );
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedDate, setSelectedDate] = useState(toDateInputValue(new Date()));
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dateOptions = useMemo(
    () =>
      Array.from({ length: 5 }, (_, index) => {
        const date = addDays(new Date(), index);
        return {
          dayLabel: new Intl.DateTimeFormat("vi-VN", { weekday: "short" }).format(date),
          date: Number(new Intl.DateTimeFormat("vi-VN", { day: "2-digit" }).format(date)),
          dateKey: toDateInputValue(date),
        };
      }),
    []
  );

  const selectedGarage = garages.find((garage) => garage.id === selectedGarageId);
  const selectedService = services.find((service) => service.id === selectedServiceId);
  const selectedVehicle = vehicles.find((vehicle) => vehicle.id === selectedVehicleId);

  const loadBootData = async () => {
    try {
      setError(null);
      const [garagesResponse, servicesResponse] = await Promise.all([
        api.getGarages({ limit: 10 }),
        api.getServicePackages({ limit: 12 }),
      ]);

      const garageData = garagesResponse.data ?? [];
      const serviceData = servicesResponse.data ?? [];
      setGarages(garageData);
      setServices(serviceData);
      setSelectedGarageId((current) => current || garageData[0]?.id || "");
      setSelectedServiceId(
        (current) =>
          current || params.servicePackageId || serviceData.find((item) => item.service_type === "WASH")?.id || serviceData[0]?.id || ""
      );

      if (isAuthenticated && accessToken) {
        const vehiclesResponse = await api.getVehicles(accessToken, {
          limit: 20,
          is_active: true,
        });
        const vehicleData = vehiclesResponse.data ?? [];
        setVehicles(vehicleData);
        setSelectedVehicleId(
          vehicleData.find((vehicle) => vehicle.is_default)?.id ?? vehicleData[0]?.id ?? ""
        );
      } else {
        setVehicles([]);
      }
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Không thể tải dữ liệu đặt lịch.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBootData();
  }, [accessToken, isAuthenticated, params.servicePackageId]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedGarageId || !selectedServiceId) {
        return;
      }

      setSlotsLoading(true);
      setSelectedSlot(null);
      try {
        const response = await api.getAvailableSlots(
          {
            garage_id: selectedGarageId,
            service_package_id: selectedServiceId,
            vehicle_id: selectedVehicleId || undefined,
            date: selectedDate,
          },
          accessToken
        );

        const nextSlots =
          response.data.days?.[0]?.available_slots ??
          response.data.available_slots ??
          [];
        setSlots(nextSlots);
      } catch (error) {
        setSlots([]);
        const message =
          error instanceof ApiError ? error.message : "Không thể tải khung giờ.";
        setError(message);
      } finally {
        setSlotsLoading(false);
      }
    };

    void fetchSlots();
  }, [accessToken, selectedDate, selectedGarageId, selectedServiceId, selectedVehicleId]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenState
          loading
          title="Đang tải lịch"
          description="Đang lấy garage, dịch vụ và phương tiện."
        />
      </SafeAreaView>
    );
  }

  if (error && garages.length === 0 && services.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenState
          title="Không thể tải lịch"
          description={error}
          actionLabel="Thử lại"
          onAction={() => {
            setLoading(true);
            void loadBootData();
          }}
        />
      </SafeAreaView>
    );
  }

  const slotItems = slots.map((slot, index) => ({
    id: slot.start_time,
    label: `${new Date(slot.start_time).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })} - ${new Date(slot.end_time).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })}`,
    state:
      selectedSlot?.start_time === slot.start_time
        ? ("selected" as const)
        : slot.is_available
          ? ("available" as const)
          : ("booked" as const),
    raw: slot,
    order: index,
  }));

  const totalPrice = selectedService?.base_price ?? 0;
  const canContinue = Boolean(selectedGarage && selectedService && selectedSlot);
  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 pt-5 pb-3 bg-background">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={handleBack}>
            <ArrowLeft size={22} color="#1a1a1a" strokeWidth={2.2} />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-primary">Đặt lịch rửa xe</Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              "Cách dùng",
              "Khách có thể xem garage, dịch vụ và khung giờ. Đăng nhập customer để xác nhận booking."
            )
          }
          className="w-9 h-9 rounded-full border border-border items-center justify-center bg-card"
        >
          <HelpCircle size={20} color="#1a1a1a" strokeWidth={2.4} />
        </TouchableOpacity>
      </View>

      <StepIndicator steps={STEPS} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        <View className="px-4 mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-lg font-bold text-foreground">
              Chọn garage
            </Text>
            <Text className="text-sm text-muted-foreground">
              {garages.length} địa điểm
            </Text>
          </View>

          <View className="gap-3">
            {garages.map((garage) => (
              <GarageCard
                key={garage.id}
                name={garage.name}
                distance={garage.address ?? "Xem chi tiết tại hồ sơ garage"}
                rating={
                  garage.rating_average
                    ? `${garage.rating_average.toFixed(1)} (${garage.rating_count ?? 0} đánh giá)`
                    : "Garage công khai"
                }
                imageUrl={
                  garage.cover_image_url ??
                  garage.image_url ??
                  "https://storage.googleapis.com/banani-generated-images/generated-images/f22f33ae-2e14-4995-a422-0101ae3bdda3.jpg"
                }
                badge={garage.id === selectedGarageId ? "Đã chọn" : undefined}
                selected={garage.id === selectedGarageId}
                onPress={() => setSelectedGarageId(garage.id)}
              />
            ))}
          </View>
        </View>

        <View className="px-4 mb-4">
          <Text className="text-lg font-bold text-foreground mb-2">
            Chọn dịch vụ
          </Text>
          <View className="gap-3">
            {services.map((service) => {
              const selected = service.id === selectedServiceId;
              return (
                <TouchableOpacity
                  key={service.id}
                  onPress={() => setSelectedServiceId(service.id)}
                  className={`rounded-xl border bg-card p-4 ${
                    selected ? "border-primary border-2" : "border-border"
                  }`}
                >
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <Text className="text-base font-semibold text-foreground">
                        {service.name}
                      </Text>
                      <Text className="text-sm text-muted-foreground mt-1">
                        {service.description ?? `${service.duration_minutes} phút`}
                      </Text>
                    </View>
                    <Text className="text-base font-bold text-primary">
                      {formatCurrency(service.base_price)}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {isAuthenticated ? (
          <VehicleSelector
            vehicles={vehicles.map((vehicle) => ({
              id: vehicle.id,
              icon: vehicle.vehicle_type === "CAR" ? Car : Bike,
              name: toVehicleName(vehicle),
              plate: vehicle.raw_license_plate,
            }))}
            selectedId={selectedVehicleId}
            onSelect={setSelectedVehicleId}
          />
        ) : (
          <View className="px-4 mb-4">
            <TouchableOpacity
              onPress={() => router.push("/login")}
              className="rounded-xl border border-border bg-card px-4 py-4"
            >
              <Text className="font-semibold text-foreground">
                Đăng nhập để gắn xe và tạo booking
              </Text>
              <Text className="text-sm text-muted-foreground mt-1">
                Tài khoản guest chỉ xem được khung giờ trống.
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <DateStrip
          dates={dateOptions}
          selectedKey={selectedDate}
          onSelect={setSelectedDate}
          goldBadge={
            isAuthenticated ? "Customer đặt lịch trực tiếp" : "Guest chỉ xem"
          }
        />

        {slotsLoading ? (
          <View className="px-4 py-6 items-center">
            <ActivityIndicator color="#1a5fd4" />
            <Text className="text-sm text-muted-foreground mt-2">
              Đang tải khung giờ
            </Text>
          </View>
        ) : (
          <TimeSlotGrid
            slots={slotItems}
            onSelect={(id) => {
              const nextSlot = slotItems.find((item) => item.id === id);
              if (nextSlot?.raw?.is_available) {
                setSelectedSlot(nextSlot.raw);
              }
            }}
          />
        )}

        {slotItems.length === 0 ? (
          <View className="px-4">
            <View className="rounded-xl border border-border bg-card px-4 py-4">
              <Text className="font-semibold text-foreground">
                Không có khung giờ trống
              </Text>
              <Text className="text-sm text-muted-foreground mt-1">
                Thử garage khác, ngày khác hoặc đăng nhập để thêm xe phù hợp với hệ
                thống gợi ý.
              </Text>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View className="bg-card border-t border-border flex-row items-center justify-between px-4 py-3">
        <View>
          <Text className="text-xs text-muted-foreground">Tổng tạm tính</Text>
          <Text className="text-lg font-bold text-primary">
            {formatCurrency(totalPrice)}
          </Text>
        </View>
        <TouchableOpacity
          disabled={!canContinue}
          onPress={() => {
            if (!isAuthenticated) {
              router.push("/login");
              return;
            }

            if (!selectedVehicle || !selectedService || !selectedGarage || !selectedSlot) {
              Alert.alert("Thiếu thông tin", "Vui lòng chọn đủ garage, dịch vụ và khung giờ.");
              return;
            }

            router.push({
              pathname: "/payment",
              params: {
                garageId: selectedGarage.id,
                garageName: selectedGarage.name,
                servicePackageId: selectedService.id,
                serviceName: selectedService.name,
                vehicleId: selectedVehicle.id,
                vehicleName: toVehicleName(selectedVehicle),
                vehiclePlate: selectedVehicle.raw_license_plate,
                startTime: selectedSlot.start_time,
                price: String(selectedService.base_price),
              },
            });
          }}
          className={`px-8 py-3 rounded-xl flex-row items-center gap-2 ${
            canContinue ? "bg-primary" : "bg-muted"
          }`}
        >
          <Text className={`text-base font-semibold ${canContinue ? "text-white" : "text-muted-foreground"}`}>
            Tiếp tục
          </Text>
          <ArrowRight
            size={18}
            color={canContinue ? "#ffffff" : "#7a8599"}
            strokeWidth={2.7}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
