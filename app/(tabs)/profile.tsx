import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Bell, CarFront, History, LogOut, Pencil, User2 } from "lucide-react-native";
import ScreenState from "@/components/common/ScreenState";
import { api, ApiError } from "@/lib/api";
import { compactName, formatCurrency, formatDateTime } from "@/lib/format";
import type { Booking, NotificationItem, WashHistory } from "@/lib/types";
import { useApp } from "@/providers/AppProvider";

export default function ProfileScreen() {
  const router = useRouter();
  const {
    accessToken,
    authUser,
    isAuthenticated,
    logout,
    profile,
    refreshProfile,
    updateProfile,
  } = useApp();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [histories, setHistories] = useState<WashHistory[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");

  const loadData = async () => {
    if (!isAuthenticated || !accessToken) {
      setLoading(false);
      return;
    }

    try {
      await refreshProfile();
      const [bookingsResponse, historiesResponse, notificationsResponse] =
        await Promise.all([
          api.getBookings(accessToken, { limit: 5 }),
          api.getWashHistories(accessToken, { limit: 5 }),
          api.getNotifications(accessToken),
        ]);
      setBookings(bookingsResponse.data ?? []);
      setHistories(historiesResponse.data ?? []);
      setNotifications(notificationsResponse.data ?? []);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Không thể tải hồ sơ.";
      Alert.alert("Lỗi tải hồ sơ", message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [accessToken, isAuthenticated]);

  useEffect(() => {
    setFullName(profile?.full_name ?? authUser?.full_name ?? "");
    setEmail(profile?.email ?? authUser?.email ?? "");
  }, [authUser?.email, authUser?.full_name, profile?.email, profile?.full_name]);

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenState
          title="Hồ sơ của tôi"
          description="Đăng nhập để xem lịch hẹn, xe đã lưu, lịch sử rửa xe và thông báo."
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
          title="Đang tải hồ sơ"
          description="Đang lấy dữ liệu của bạn."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void loadData();
            }}
          />
        }
      >
        <View className="px-4 pt-5 pb-3 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className="w-11 h-11 rounded-xl bg-secondary items-center justify-center">
              <User2 size={22} color="#1a5fd4" strokeWidth={2.2} />
            </View>
            <View>
              <Text className="text-sm text-muted-foreground">Xin chào</Text>
              <Text className="text-xl font-bold text-foreground">
                {compactName(profile?.full_name ?? authUser?.full_name)}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push("/notifications")}>
            <Bell size={20} color="#1a1a1a" strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        <View className="mx-4 rounded-2xl bg-card p-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-bold text-foreground">Thông tin cá nhân</Text>
            <TouchableOpacity onPress={() => setEditing((current) => !current)}>
              <Pencil size={18} color="#1a5fd4" strokeWidth={2.2} />
            </TouchableOpacity>
          </View>

          {editing ? (
            <View className="mt-4 gap-3">
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Họ và tên"
                placeholderTextColor="#94a3b8"
                className="rounded-xl border border-border bg-input px-4 py-3 text-foreground"
              />
              <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Email"
                placeholderTextColor="#94a3b8"
                className="rounded-xl border border-border bg-input px-4 py-3 text-foreground"
              />
              <TouchableOpacity
                disabled={submitting}
                onPress={async () => {
                  setSubmitting(true);
                  try {
                    await updateProfile({
                      full_name: fullName || undefined,
                      email: email || null,
                    });
                    setEditing(false);
                    await loadData();
                  } catch (error) {
                    const message =
                      error instanceof ApiError
                        ? error.message
                        : "Không thể cập nhật hồ sơ.";
                    Alert.alert("Lỗi cập nhật", message);
                  } finally {
                    setSubmitting(false);
                  }
                }}
                className="rounded-xl bg-primary py-3 items-center"
              >
                {submitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-white font-semibold">Lưu thay đổi</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View className="mt-4 gap-3">
              <View>
                <Text className="text-xs text-muted-foreground">Số điện thoại</Text>
                <Text className="text-base font-medium text-foreground">
                  {profile?.phone ?? authUser?.phone ?? "Chưa cập nhật"}
                </Text>
              </View>
              <View>
                <Text className="text-xs text-muted-foreground">Email</Text>
                <Text className="text-base font-medium text-foreground">
                  {profile?.email ?? authUser?.email ?? "Chưa cập nhật"}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View className="px-4 mt-4 flex-row gap-3">
          <View className="flex-1 rounded-xl bg-card p-4">
            <Text className="text-xs text-muted-foreground">Booking gần đây</Text>
            <Text className="text-3xl font-bold text-primary mt-2">
              {bookings.length}
            </Text>
          </View>
          <View className="flex-1 rounded-xl bg-card p-4">
            <Text className="text-xs text-muted-foreground">Chưa đọc</Text>
            <Text className="text-3xl font-bold text-primary mt-2">
              {notifications.filter((item) => item.in_app_status !== "READ").length}
            </Text>
          </View>
        </View>

        <View className="mx-4 mt-4 rounded-2xl bg-card p-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-bold text-foreground">Lịch hẹn của tôi</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/booking")}>
              <Text className="text-sm font-medium text-primary">Đặt thêm</Text>
            </TouchableOpacity>
          </View>
          <View className="mt-4 gap-3">
            {bookings.length === 0 ? (
              <Text className="text-sm text-muted-foreground">
                Bạn chưa có booking nào.
              </Text>
            ) : (
              bookings.map((booking) => (
                <View key={booking.id} className="rounded-xl border border-border p-4">
                  <Text className="font-semibold text-foreground">
                    {booking.service_package?.name ?? booking.service_package_id}
                  </Text>
                  <Text className="text-sm text-muted-foreground mt-1">
                    {booking.garage?.name ?? booking.garage_id}
                  </Text>
                  <Text className="text-sm text-muted-foreground mt-1">
                    {formatDateTime(booking.start_time)}
                  </Text>
                  <View className="flex-row items-center justify-between mt-3">
                    <Text className="text-primary font-semibold">
                      {booking.status === "PENDING" ? "Chờ xác nhận"
                        : booking.status === "CONFIRMED" ? "Đã xác nhận"
                        : booking.status === "CHECKED_IN" ? "Đã check-in"
                        : booking.status === "IN_PROGRESS" ? "Đang rửa"
                        : booking.status === "COMPLETED" ? "Hoàn tất"
                        : booking.status === "CANCELED" ? "Đã hủy"
                        : booking.status === "NO_SHOW" ? "Vắng mặt"
                        : booking.status}
                    </Text>
                    {(booking.status === "PENDING" || booking.status === "CONFIRMED") && (
                      <TouchableOpacity
                        onPress={async () => {
                          try {
                            await api.cancelBooking(accessToken!, booking.id, "Hủy từ app customer");
                            await loadData();
                          } catch (error) {
                            const message =
                              error instanceof ApiError
                                ? error.message
                                : "Không thể hủy booking.";
                            Alert.alert("Lỗi hủy booking", message);
                          }
                        }}
                      >
                        <Text className="text-sm text-red-500 font-medium">Hủy lịch</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        <View className="mx-4 mt-4 rounded-2xl bg-card p-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-bold text-foreground">Lịch sử rửa xe</Text>
            <History size={18} color="#1a5fd4" strokeWidth={2.2} />
          </View>
          <View className="mt-4 gap-3">
            {histories.length === 0 ? (
              <Text className="text-sm text-muted-foreground">
                Chưa có wash history nào.
              </Text>
            ) : (
              histories.map((history) => (
                <View key={history.id} className="rounded-xl border border-border p-4">
                  <Text className="font-semibold text-foreground">
                    {history.service_package?.name ?? "Dịch vụ đã hoàn tất"}
                  </Text>
                  <Text className="text-sm text-muted-foreground mt-1">
                    {history.garage?.name ?? "Garage"}
                  </Text>
                  <Text className="text-sm text-primary mt-2 font-semibold">
                    {formatCurrency(history.amount_paid)}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>

        <View className="px-4 mt-4 gap-3">
          <TouchableOpacity
            onPress={() => router.push("/my-vehicles")}
            className="rounded-xl bg-card px-4 py-4 flex-row items-center gap-3"
          >
            <CarFront size={20} color="#1a5fd4" strokeWidth={2.2} />
            <Text className="font-medium text-foreground">Quản lý phương tiện</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              await logout();
              router.replace("/login");
            }}
            className="rounded-xl bg-card px-4 py-4 flex-row items-center gap-3"
          >
            <LogOut size={20} color="#ef4444" strokeWidth={2.2} />
            <Text className="font-medium text-red-500">Đăng xuất</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
