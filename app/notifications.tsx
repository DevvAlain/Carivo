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
import { useRouter } from "expo-router";
import { ArrowLeft, Bell, Trash2 } from "lucide-react-native";
import ScreenState from "@/components/common/ScreenState";
import { api, ApiError } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import type { NotificationItem } from "@/lib/types";
import { useApp } from "@/providers/AppProvider";

export default function NotificationsScreen() {
  const router = useRouter();
  const { accessToken, isAuthenticated } = useApp();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    if (!isAuthenticated || !accessToken) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.getNotifications(accessToken);
      setNotifications(response.data ?? []);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Không thể tải thông báo.";
      Alert.alert("Lỗi tải thông báo", message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [accessToken, isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <ScreenState
          title="Thông báo"
          description="Đăng nhập customer để xem thông báo booking, khuyến mãi và loyalty."
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
          title="Đang tải thông báo"
          description="Đang đồng bộ dữ liệu notification."
        />
      </SafeAreaView>
    );
  }

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)/profile");
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="px-4 pt-5 pb-3 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={handleBack}>
            <ArrowLeft size={22} color="#1a1a1a" strokeWidth={2.2} />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-primary">Thông báo</Text>
        </View>
        <TouchableOpacity
          onPress={async () => {
            try {
              await api.markAllNotificationsRead(accessToken!);
              await loadData();
            } catch (error) {
              const message =
                error instanceof ApiError ? error.message : "Không thể cập nhật thông báo.";
              Alert.alert("Lỗi", message);
            }
          }}
        >
          <Text className="text-sm font-medium text-primary">Đọc tất cả</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
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
        <View className="px-4 gap-3">
          {notifications.length === 0 ? (
            <View className="rounded-2xl bg-card p-5 items-center">
              <Bell size={22} color="#1a5fd4" strokeWidth={2.2} />
              <Text className="text-base font-semibold text-foreground mt-3">
                Chưa có thông báo
              </Text>
            </View>
          ) : (
            notifications.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.9}
                onPress={async () => {
                  if (item.in_app_status !== "READ") {
                    try {
                      await api.markNotificationRead(accessToken!, item.id);
                      await loadData();
                    } catch (error) {
                      const message =
                        error instanceof ApiError ? error.message : "Không thể đánh dấu đã đọc.";
                      Alert.alert("Lỗi", message);
                    }
                  }
                }}
                className={`rounded-2xl p-4 ${
                  item.in_app_status === "READ" ? "bg-card" : "bg-secondary"
                }`}
              >
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1">
                    <Text className="font-semibold text-foreground">{item.title}</Text>
                    <Text className="text-sm text-muted-foreground mt-1 leading-5">
                      {item.message}
                    </Text>
                    <Text className="text-xs text-muted-foreground mt-3">
                      {formatDateTime(item.created_at)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={async () => {
                      try {
                        await api.deleteNotification(accessToken!, item.id);
                        await loadData();
                      } catch (error) {
                        const message =
                          error instanceof ApiError ? error.message : "Không thể xóa thông báo.";
                        Alert.alert("Lỗi", message);
                      }
                    }}
                  >
                    <Trash2 size={18} color="#ef4444" strokeWidth={2.2} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
