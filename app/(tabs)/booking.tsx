import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, ArrowRight, Bike, Car, CheckSquare, HelpCircle, Square } from "lucide-react-native";
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
  const [selectedServiceId, setSelectedServiceId] = useState(params.servicePackageId ?? "");
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
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

  const selectedGarage = garages.find((g) => g.id === selectedGarageId);
  const selectedService = services.find((s) => s.id === selectedServiceId);
  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);

  // Split services: primary (WASH/COMBO) và add-ons (ADDON)
  const mainServices = services.filter(
    (s) => s.service_type === "WASH" || s.service_type === "COMBO"
  );
  const addonServices = services.filter(
    (s) =>
      s.service_type === "ADDON" &&
      (!selectedVehicle || s.vehicle_type === selectedVehicle.vehicle_type)
  );

  const selectedAddons = addonServices.filter((s) => selectedAddonIds.includes(s.id));
  const addonTotal = selectedAddons.reduce((sum, s) => sum + s.base_price, 0);
  const totalPrice = (selectedService?.base_price ?? 0) + addonTotal;

  const toggleAddon = (id: string) => {
    setSelectedAddonIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  // Khi đổi vehicle, xóa addon không phù hợp vehicle_type
  useEffect(() => {
    if (selectedVehicle) {
      setSelectedAddonIds((prev) =>
        prev.filter((id) => {
          const addon = services.find((s) => s.id === id);
          return addon?.vehicle_type === selectedVehicle.vehicle_type;
        })
      );
    }
  }, [selectedVehicleId]);

  const loadBootData = async () => {
    try {
      setError(null);
      const [garagesResponse, servicesResponse] = await Promise.all([
        api.getGarages({ limit: 10 }),
        api.getServicePackages({ limit: 50 }),
      ]);

      const garageData = garagesResponse.data ?? [];
      const serviceData = servicesResponse.data ?? [];
      setGarages(garageData);
      setServices(serviceData);
      setSelectedGarageId((current) => current || garageData[0]?.id || "");
      setSelectedServiceId(
        (current) =>
          current ||
          params.servicePackageId ||
          serviceData.find((s) => s.service_type === "WASH")?.id ||
          serviceData[0]?.id ||
          ""
      );

      if (isAuthenticated && accessToken) {
        const vehiclesResponse = await api.getVehicles(accessToken, {
          limit: 20,
          is_active: true,
        });
        const vehicleData = vehiclesResponse.data ?? [];
        setVehicles(vehicleData);
        setSelectedVehicleId(
          vehicleData.find((v) => v.is_default)?.id ?? vehicleData[0]?.id ?? ""
        );
      } else {
        setVehicles([]);
      }
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Không thể tải dữ liệu đặt lịch.";
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
      if (!selectedGarageId || !selectedServiceId) return;

      setSlotsLoading(true);
      setSelectedSlot(null);
      try {
        const response = await api.getAvailableSlots(
          {
            garage_id: selectedGarageId,
            service_package_id: selectedServiceId,
            vehicle_id: selectedVehicleId || undefined,
            add_on_service_ids: selectedAddonIds.length > 0 ? selectedAddonIds : undefined,
            date: selectedDate,
          },
          accessToken
        );

        const nextSlots =
          response.data.days?.[0]?.available_slots ??
          response.data.available_slots ??
          [];
        setSlots(nextSlots);
      } catch (err) {
        setSlots([]);
        const message =
          err instanceof ApiError ? err.message : "Không thể tải khung giờ.";
        setError(message);
      } finally {
        setSlotsLoading(false);
      }
    };

    void fetchSlots();
  }, [accessToken, selectedDate, selectedGarageId, selectedServiceId, selectedVehicleId, selectedAddonIds]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenState loading title="Đang tải lịch" description="Đang lấy garage, dịch vụ và phương tiện." />
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
          onAction={() => { setLoading(true); void loadBootData(); }}
        />
      </SafeAreaView>
    );
  }

  const slotItems = slots.map((slot, index) => ({
    id: slot.start_time,
    label: `${new Date(slot.start_time).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} - ${new Date(slot.end_time).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`,
    state:
      selectedSlot?.start_time === slot.start_time
        ? ("selected" as const)
        : slot.is_available
          ? ("available" as const)
          : ("booked" as const),
    raw: slot,
    order: index,
  }));

  const canContinue = Boolean(selectedGarage && selectedService && selectedSlot && isAuthenticated && selectedVehicle);

  const handleBack = () => {
    if (router.canGoBack()) { router.back(); return; }
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
          onPress={() => Alert.alert("Cách dùng", "Chọn garage → dịch vụ chính → dịch vụ thêm (tuỳ chọn) → xe → khung giờ → thanh toán.")}
          className="w-9 h-9 rounded-full border border-border items-center justify-center bg-card"
        >
          <HelpCircle size={20} color="#1a1a1a" strokeWidth={2.4} />
        </TouchableOpacity>
      </View>

      <StepIndicator steps={STEPS} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>

        {/* Garage */}
        <View className="px-4 mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-lg font-bold text-foreground">Chọn garage</Text>
            <Text className="text-sm text-muted-foreground">{garages.length} địa điểm</Text>
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

        {/* Dịch vụ chính — chọn 1 */}
        <View className="px-4 mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-lg font-bold text-foreground">Dịch vụ chính</Text>
            <Text className="text-xs text-muted-foreground">Chọn 1</Text>
          </View>
          <View className="gap-3">
            {mainServices.map((service) => {
              const selected = service.id === selectedServiceId;
              return (
                <TouchableOpacity
                  key={service.id}
                  onPress={() => setSelectedServiceId(service.id)}
                  className={`rounded-xl border bg-card p-4 ${selected ? "border-primary border-2" : "border-border"}`}
                >
                  <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                      <View className="flex-row items-center gap-2">
                        <View className={`w-4 h-4 rounded-full border-2 items-center justify-center ${selected ? "border-primary" : "border-muted-foreground"}`}>
                          {selected && <View className="w-2 h-2 rounded-full bg-primary" />}
                        </View>
                        <Text className="text-base font-semibold text-foreground flex-1">{service.name}</Text>
                      </View>
                      <Text className="text-sm text-muted-foreground mt-1 ml-6">
                        {service.description ?? `${service.duration_minutes} phút`}
                      </Text>
                      <Text className="text-xs text-muted-foreground mt-0.5 ml-6">
                        {service.service_type} • {service.vehicle_type}
                      </Text>
                    </View>
                    <Text className="text-base font-bold text-primary">{formatCurrency(service.base_price)}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Add-on services — chọn nhiều */}
        {addonServices.length > 0 && (
          <View className="px-4 mb-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-lg font-bold text-foreground">Dịch vụ thêm</Text>
              <Text className="text-xs text-muted-foreground">Chọn nhiều (tuỳ chọn)</Text>
            </View>
            <View className="gap-2">
              {addonServices.map((addon) => {
                const checked = selectedAddonIds.includes(addon.id);
                return (
                  <TouchableOpacity
                    key={addon.id}
                    onPress={() => toggleAddon(addon.id)}
                    className={`rounded-xl border bg-card p-4 flex-row items-center gap-3 ${checked ? "border-primary border-2" : "border-border"}`}
                  >
                    {checked
                      ? <CheckSquare size={20} color="#1a5fd4" strokeWidth={2.2} />
                      : <Square size={20} color="#94a3b8" strokeWidth={2.2} />
                    }
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-foreground">{addon.name}</Text>
                      <Text className="text-xs text-muted-foreground mt-0.5">{addon.duration_minutes} phút</Text>
                    </View>
                    <Text className="text-sm font-bold text-primary">+{formatCurrency(addon.base_price)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Vehicle */}
        {isAuthenticated ? (
          <VehicleSelector
            vehicles={vehicles.map((v) => ({
              id: v.id,
              icon: v.vehicle_type === "CAR" ? Car : Bike,
              name: toVehicleName(v),
              plate: v.raw_license_plate,
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
              <Text className="font-semibold text-foreground">Đăng nhập để gắn xe và tạo booking</Text>
              <Text className="text-sm text-muted-foreground mt-1">Tài khoản guest chỉ xem được khung giờ trống.</Text>
            </TouchableOpacity>
          </View>
        )}

        <DateStrip
          dates={dateOptions}
          selectedKey={selectedDate}
          onSelect={setSelectedDate}
          goldBadge={isAuthenticated ? "Customer đặt lịch trực tiếp" : "Guest chỉ xem"}
        />

        {slotsLoading ? (
          <View className="px-4 py-6 items-center">
            <ActivityIndicator color="#1a5fd4" />
            <Text className="text-sm text-muted-foreground mt-2">Đang tải khung giờ</Text>
          </View>
        ) : (
          <TimeSlotGrid
            slots={slotItems}
            onSelect={(id) => {
              const nextSlot = slotItems.find((item) => item.id === id);
              if (nextSlot?.raw?.is_available) setSelectedSlot(nextSlot.raw);
            }}
          />
        )}

        {!slotsLoading && slotItems.length === 0 && (
          <View className="px-4">
            <View className="rounded-xl border border-border bg-card px-4 py-4">
              <Text className="font-semibold text-foreground">Không có khung giờ trống</Text>
              <Text className="text-sm text-muted-foreground mt-1">
                Thử garage khác, ngày khác hoặc thêm xe phù hợp.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom bar */}
      <View className="bg-card border-t border-border flex-row items-center justify-between px-4 py-3">
        <View>
          <Text className="text-xs text-muted-foreground">
            Tổng tạm tính{selectedAddonIds.length > 0 ? ` (+${selectedAddonIds.length} dịch vụ)` : ""}
          </Text>
          <Text className="text-lg font-bold text-primary">{formatCurrency(totalPrice)}</Text>
        </View>
        <TouchableOpacity
          disabled={!canContinue}
          onPress={() => {
            if (!isAuthenticated) { router.push("/login"); return; }
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
                addOnServiceIds: selectedAddonIds.join(","),
                addonTotal: String(addonTotal),
              },
            });
          }}
          className={`px-8 py-3 rounded-xl flex-row items-center gap-2 ${canContinue ? "bg-primary" : "bg-muted"}`}
        >
          <Text className={`text-base font-semibold ${canContinue ? "text-white" : "text-muted-foreground"}`}>
            Tiếp tục
          </Text>
          <ArrowRight size={18} color={canContinue ? "#ffffff" : "#7a8599"} strokeWidth={2.7} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
