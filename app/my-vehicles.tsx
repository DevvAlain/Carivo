import { useEffect, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Bell, Info, Plus, User } from "lucide-react-native";
import { useRouter } from "expo-router";
import ScreenState from "@/components/common/ScreenState";
import VehicleCard from "@/components/vehicles/VehicleCard";
import { api, ApiError } from "@/lib/api";
import type { Vehicle } from "@/lib/types";
import { useApp } from "@/providers/AppProvider";

export default function MyVehiclesScreen() {
  const router = useRouter();
  const { accessToken, isAuthenticated } = useApp();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadVehicles = async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.getVehicles(accessToken, { is_active: true });
      const data = response.data ?? [];
      setVehicles(data);
      if (!selectedId && data.length > 0) {
        setSelectedId(
          data.find((v) => v.is_default)?.id ?? data[0]?.id ?? ""
        );
      }
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Không thể tải danh sách xe.";
      Alert.alert("Lỗi tải xe", message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadVehicles();
  }, [accessToken]);

  const handleDelete = (id: string, name: string) => {
    Alert.alert("Xóa xe", `Bạn có chắc muốn xóa "${name}"?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await api.deleteVehicle(accessToken!, id);
            const remaining = vehicles.filter((v) => v.id !== id);
            setVehicles(remaining);
            if (selectedId === id) {
              setSelectedId(remaining[0]?.id ?? "");
            }
          } catch (error) {
            const message =
              error instanceof ApiError ? error.message : "Không thể xóa xe.";
            Alert.alert("Lỗi xóa xe", message);
          }
        },
      },
    ]);
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenState
          title="Xe của tôi"
          description="Đăng nhập để quản lý các phương tiện đã đăng ký."
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
          title="Đang tải"
          description="Đang lấy danh sách phương tiện của bạn."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-5 pb-3">
        <View className="flex-row items-center gap-2">
          <View className="w-9 h-9 rounded-full bg-secondary items-center justify-center">
            <User size={18} color="#1a5fd4" strokeWidth={2.7} />
          </View>
          <Text className="text-primary font-semibold text-base">
            Xe của tôi
          </Text>
        </View>
        <TouchableOpacity className="w-9 h-9 items-center justify-center">
          <Bell size={20} color="#0d0d0d" strokeWidth={2.4} />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void loadVehicles();
            }}
          />
        }
      >
        {/* Page title */}
        <View className="px-4 pt-3 pb-5">
          <Text className="text-3xl font-black text-foreground mb-2">
            Quản lý phương tiện
          </Text>
          <Text className="text-sm text-muted-foreground leading-relaxed">
            Danh sách các xe đã đăng ký để sử dụng dịch vụ tại Carivo.
          </Text>
        </View>

        <View className="px-4 gap-4">
          {vehicles.length === 0 ? (
            <View className="rounded-xl border border-border bg-card p-6 items-center">
              <Text className="text-base font-semibold text-foreground mb-1">
                Chưa có xe nào
              </Text>
              <Text className="text-sm text-muted-foreground text-center">
                Thêm xe để bắt đầu đặt lịch rửa xe thông minh.
              </Text>
            </View>
          ) : (
            vehicles.map((vehicle) => {
              const parts = vehicle.raw_license_plate.split("-");
              const plateTop = parts[0] ?? vehicle.raw_license_plate;
              const plateBottom = parts.slice(1).join("-") || "";

              return (
                <TouchableOpacity
                  key={vehicle.id}
                  activeOpacity={0.95}
                  onPress={() => setSelectedId(vehicle.id)}
                >
                  <VehicleCard
                    name={
                      vehicle.brand && vehicle.model
                        ? `${vehicle.brand} ${vehicle.model}`
                        : vehicle.raw_license_plate
                    }
                    type={
                      vehicle.car_body_type ??
                      vehicle.motorbike_cc_group ??
                      vehicle.vehicle_type
                    }
                    brand={vehicle.brand ?? vehicle.vehicle_type}
                    plateTop={plateTop}
                    plateBottom={plateBottom}
                    selected={vehicle.id === selectedId}
                    onEdit={() => {/* navigate to edit screen */}}
                    onDelete={() =>
                      handleDelete(
                        vehicle.id,
                        vehicle.brand && vehicle.model
                          ? `${vehicle.brand} ${vehicle.model}`
                          : vehicle.raw_license_plate
                      )
                    }
                  />
                </TouchableOpacity>
              );
            })
          )}

          {/* Add vehicle */}
          <TouchableOpacity
            className="rounded-xl border-2 border-border flex-col items-center py-8 gap-2"
            style={{ borderStyle: "dashed" }}
            activeOpacity={0.7}
          >
            <View className="w-14 h-14 rounded-full bg-primary items-center justify-center mb-1">
              <Plus size={28} color="#ffffff" strokeWidth={1.72} />
            </View>
            <Text className="text-primary font-semibold text-base">
              Thêm xe mới
            </Text>
            <Text className="text-muted-foreground text-sm text-center px-8">
              Thêm xe để nhận ưu đãi rửa xe thông minh
            </Text>
          </TouchableOpacity>

          {/* Tip banner */}
          <View className="bg-dark rounded-xl p-4 flex-row gap-3 items-start mb-4">
            <Info size={18} color="#ffffff" strokeWidth={2.7} />
            <View className="flex-1">
              <Text className="text-white font-semibold text-sm mb-1">
                Mẹo nhỏ
              </Text>
              <Text className="text-muted-foreground text-xs leading-relaxed">
                Đăng ký chính xác phân khúc xe (Sedan/SUV) giúp hệ thống tự
                động điều chỉnh vòi xịt phù hợp nhất.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
