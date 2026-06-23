import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Bell, Info, Plus, User } from "lucide-react-native";
import { useRouter } from "expo-router";
import VehicleCard from "@/components/vehicles/VehicleCard";
import ScreenState from "@/components/common/ScreenState";
import { api, ApiError } from "@/lib/api";
import { formatLicensePlate } from "@/lib/format";
import type { Vehicle } from "@/lib/types";
import { useApp } from "@/providers/AppProvider";

type VehicleForm = {
  raw_license_plate: string;
  vehicle_type: "MOTORBIKE" | "CAR";
  engine_type: "GASOLINE" | "ELECTRIC";
  brand: string;
  model: string;
  color: string;
  seat_count: string;
  car_body_type: "SEDAN" | "SUV" | "HATCHBACK" | "MPV" | "PICKUP" | "VAN";
  motorbike_cc_group: "UNDER_175CC" | "OVER_175CC";
  is_default: boolean;
};

const EMPTY_FORM: VehicleForm = {
  raw_license_plate: "",
  vehicle_type: "CAR",
  engine_type: "GASOLINE",
  brand: "",
  model: "",
  color: "",
  seat_count: "5",
  car_body_type: "SEDAN",
  motorbike_cc_group: "UNDER_175CC",
  is_default: true,
};

export default function MyVehiclesScreen() {
  const router = useRouter();
  const { accessToken, isAuthenticated } = useApp();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [form, setForm] = useState<VehicleForm>(EMPTY_FORM);

  const loadVehicles = async () => {
    if (!isAuthenticated || !accessToken) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.getVehicles(accessToken, { limit: 50, is_active: true });
      const items = response.data ?? [];
      setVehicles(items);
      setSelectedId(items.find((vehicle) => vehicle.is_default)?.id ?? items[0]?.id ?? "");
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Không thể tải danh sách xe.";
      Alert.alert("Lỗi tải xe", message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadVehicles();
  }, [accessToken, isAuthenticated]);

  const formTitle = useMemo(
    () => (editingId ? "Cập nhật phương tiện" : "Thêm phương tiện mới"),
    [editingId]
  );

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormVisible(true);
  };

  const openEdit = (vehicle: Vehicle) => {
    setEditingId(vehicle.id);
    setForm({
      raw_license_plate: vehicle.raw_license_plate,
      vehicle_type: vehicle.vehicle_type,
      engine_type: vehicle.engine_type,
      brand: vehicle.brand ?? "",
      model: vehicle.model ?? "",
      color: vehicle.color ?? "",
      seat_count: String(vehicle.seat_count ?? 5),
      car_body_type: (vehicle.car_body_type as VehicleForm["car_body_type"]) ?? "SEDAN",
      motorbike_cc_group:
        (vehicle.motorbike_cc_group as VehicleForm["motorbike_cc_group"]) ?? "UNDER_175CC",
      is_default: Boolean(vehicle.is_default),
    });
    setFormVisible(true);
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenState
          title="Xe của tôi"
          description="Đăng nhập customer để lưu và quản lý phương tiện."
          actionLabel="Đăng nhập"
          onAction={() => router.push("/login")}
        />
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenState
          loading
          title="Đang tải xe"
          description="Đang đồng bộ phương tiện với backend."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-row items-center justify-between px-4 pt-5 pb-3">
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
                return;
              }

              router.replace("/(tabs)/profile");
            }}
            className="w-9 h-9 rounded-full bg-card border border-border items-center justify-center"
          >
            <ArrowLeft size={18} color="#0d0d0d" strokeWidth={2.4} />
          </TouchableOpacity>
          <View className="w-9 h-9 rounded-full bg-secondary items-center justify-center">
            <User size={18} color="#1a5fd4" strokeWidth={2.7} />
          </View>
          <Text className="text-primary font-semibold text-base">Xe của tôi</Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/notifications")}>
          <Bell size={20} color="#0d0d0d" strokeWidth={2.4} />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View className="px-4 pt-3 pb-5">
          <Text className="text-3xl font-black text-foreground mb-2">
            Quản lý phương tiện
          </Text>
          <Text className="text-sm text-muted-foreground leading-relaxed">
            Các phương tiện này sẽ được dùng cho booking customer.
          </Text>
        </View>

        {formVisible ? (
          <View className="mx-4 mb-4 rounded-2xl bg-card p-5 gap-3">
            <Text className="text-lg font-bold text-foreground">{formTitle}</Text>
            <TextInput
              value={form.raw_license_plate}
              onChangeText={(value) =>
                setForm((current) => ({ ...current, raw_license_plate: value }))
              }
              placeholder="Biển số xe"
              placeholderTextColor="#94a3b8"
              className="rounded-xl border border-border bg-input px-4 py-3 text-foreground"
            />
            <View className="flex-row gap-2">
              {(["CAR", "MOTORBIKE"] as const).map((vehicleType) => (
                <TouchableOpacity
                  key={vehicleType}
                  onPress={() =>
                    setForm((current) => ({ ...current, vehicle_type: vehicleType }))
                  }
                  className={`flex-1 rounded-xl px-4 py-3 ${
                    form.vehicle_type === vehicleType ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <Text
                    className={`text-center font-medium ${
                      form.vehicle_type === vehicleType
                        ? "text-white"
                        : "text-foreground"
                    }`}
                  >
                    {vehicleType === "CAR" ? "Ô tô" : "Xe máy"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              value={form.brand}
              onChangeText={(value) => setForm((current) => ({ ...current, brand: value }))}
              placeholder="Hãng xe"
              placeholderTextColor="#94a3b8"
              className="rounded-xl border border-border bg-input px-4 py-3 text-foreground"
            />
            <TextInput
              value={form.model}
              onChangeText={(value) => setForm((current) => ({ ...current, model: value }))}
              placeholder="Model"
              placeholderTextColor="#94a3b8"
              className="rounded-xl border border-border bg-input px-4 py-3 text-foreground"
            />
            <TextInput
              value={form.color}
              onChangeText={(value) => setForm((current) => ({ ...current, color: value }))}
              placeholder="Màu xe"
              placeholderTextColor="#94a3b8"
              className="rounded-xl border border-border bg-input px-4 py-3 text-foreground"
            />
            {form.vehicle_type === "CAR" ? (
              <TextInput
                value={form.seat_count}
                onChangeText={(value) =>
                  setForm((current) => ({ ...current, seat_count: value }))
                }
                keyboardType="number-pad"
                placeholder="Số chỗ"
                placeholderTextColor="#94a3b8"
                className="rounded-xl border border-border bg-input px-4 py-3 text-foreground"
              />
            ) : null}
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setFormVisible(false)}
                className="flex-1 rounded-xl bg-muted py-3 items-center"
              >
                <Text className="font-medium text-foreground">Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={saving}
                onPress={async () => {
                  if (!accessToken) {
                    return;
                  }

                  setSaving(true);
                  try {
                    const payload = {
                      raw_license_plate: form.raw_license_plate,
                      vehicle_type: form.vehicle_type,
                      engine_type: form.engine_type,
                      brand: form.brand || undefined,
                      model: form.model || undefined,
                      color: form.color || undefined,
                      is_default: form.is_default,
                      ...(form.vehicle_type === "CAR"
                        ? {
                            seat_count: Number(form.seat_count || 5),
                            car_body_type: form.car_body_type,
                          }
                        : {
                            motorbike_cc_group: form.motorbike_cc_group,
                          }),
                    };

                    if (editingId) {
                      await api.updateVehicle(accessToken, editingId, payload);
                    } else {
                      await api.createVehicle(accessToken, payload);
                    }

                    setFormVisible(false);
                    await loadVehicles();
                  } catch (error) {
                    const message =
                      error instanceof ApiError
                        ? error.message
                        : "Không thể lưu phương tiện.";
                    Alert.alert("Lỗi lưu xe", message);
                  } finally {
                    setSaving(false);
                  }
                }}
                className="flex-1 rounded-xl bg-primary py-3 items-center"
              >
                {saving ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="font-medium text-white">Lưu xe</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        <View className="px-4 gap-4">
          {vehicles.map((vehicle) => {
            const plate = formatLicensePlate(vehicle.raw_license_plate);
            return (
              <TouchableOpacity
                key={vehicle.id}
                activeOpacity={0.95}
                onPress={() => setSelectedId(vehicle.id)}
              >
                <VehicleCard
                  name={`${vehicle.brand ?? ""} ${vehicle.model ?? ""}`.trim() || vehicle.vehicle_type}
                  type={vehicle.vehicle_type}
                  brand={vehicle.brand ?? "Chưa rõ"}
                  plateTop={plate.top}
                  plateBottom={plate.bottom}
                  selected={vehicle.id === selectedId}
                  onEdit={() => openEdit(vehicle)}
                  onDelete={() => {
                    Alert.alert("Xóa xe", `Bạn có chắc muốn xóa "${vehicle.raw_license_plate}"?`, [
                      { text: "Hủy", style: "cancel" },
                      {
                        text: "Xóa",
                        style: "destructive",
                        onPress: async () => {
                          try {
                            await api.deleteVehicle(accessToken!, vehicle.id);
                            await loadVehicles();
                          } catch (error) {
                            const message =
                              error instanceof ApiError
                                ? error.message
                                : "Không thể xóa phương tiện.";
                            Alert.alert("Lỗi xóa xe", message);
                          }
                        },
                      },
                    ]);
                  }}
                />
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            onPress={openCreate}
            className="rounded-xl border-2 border-border flex-col items-center py-8 gap-2"
            style={{ borderStyle: "dashed" }}
            activeOpacity={0.7}
          >
            <View className="w-14 h-14 rounded-full bg-primary items-center justify-center mb-1">
              <Plus size={28} color="#ffffff" strokeWidth={1.72} />
            </View>
            <Text className="text-primary font-semibold text-base">Thêm xe mới</Text>
            <Text className="text-muted-foreground text-sm text-center px-8">
              Lưu xe để customer đặt lịch nhanh hơn
            </Text>
          </TouchableOpacity>

          <View className="bg-dark rounded-xl p-4 flex-row gap-3 items-start mb-4">
            <Info size={18} color="#ffffff" strokeWidth={2.7} />
            <View className="flex-1">
              <Text className="text-white font-semibold text-sm mb-1">Mẹo nhỏ</Text>
              <Text className="text-muted-foreground text-xs leading-relaxed">
                Chọn đúng loại xe để backend gợi ý dịch vụ và khung giờ phù hợp.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
