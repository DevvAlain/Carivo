import { useEffect, useState } from "react";
import { RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Award, ChevronRight, Star } from "lucide-react-native";
import ScreenState from "@/components/common/ScreenState";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import type { LoyaltySummary, LoyaltyTierRule, LoyaltyTransaction } from "@/lib/types";
import { useApp } from "@/providers/AppProvider";

export default function RewardsScreen() {
  const router = useRouter();
  const { accessToken, isAuthenticated } = useApp();
  const [summary, setSummary] = useState<LoyaltySummary | null>(null);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [tierRules, setTierRules] = useState<LoyaltyTierRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    if (!isAuthenticated || !accessToken) {
      setLoading(false);
      return;
    }

    try {
      const [summaryResponse, transactionsResponse, rulesResponse] = await Promise.all([
        api.getLoyaltySummary(accessToken),
        api.getLoyaltyTransactions(accessToken),
        api.getLoyaltyTierRules(accessToken),
      ]);
      setSummary(summaryResponse.data);
      setTransactions(transactionsResponse.data ?? []);
      setTierRules(rulesResponse.data ?? []);
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
          title="Điểm thưởng customer"
          description="Đăng nhập để xem điểm tích lũy, hạng thành viên và lịch sử cộng/trừ điểm."
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
          title="Đang tải điểm thưởng"
          description="Đang lấy dữ liệu loyalty của customer."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
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
        <View className="px-4 pt-5 pb-3">
          <Text className="text-3xl font-bold text-foreground">Điểm thưởng</Text>
          <Text className="text-sm text-muted-foreground mt-2">
            Theo dõi loyalty và quyền lợi dành cho customer.
          </Text>
        </View>

        <View className="mx-4 rounded-2xl bg-dark p-5">
          <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center">
            <Star size={20} color="#ffffff" strokeWidth={2.4} />
          </View>
          <Text className="text-white text-4xl font-bold mt-4">
            {summary?.loyalty?.available_points ?? 0}
          </Text>
          <Text className="text-white/80 text-sm mt-1">Điểm khả dụng</Text>
          <Text className="text-white/80 text-sm mt-5">
            Hạng hiện tại: {summary?.loyalty?.current_tier ?? "N/A"}
          </Text>
          <Text className="text-white/80 text-sm mt-1">
            Hạng tiếp theo: {summary?.next_tier_rule?.tier_name ?? "Không có"}
          </Text>
        </View>

        <View className="mx-4 mt-4 rounded-2xl bg-card p-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-bold text-foreground">Quy tắc hạng</Text>
            <Award size={18} color="#1a5fd4" strokeWidth={2.2} />
          </View>
          <View className="mt-4 gap-3">
            {tierRules.map((rule) => (
              <View key={rule.id} className="rounded-xl border border-border p-4">
                <View className="flex-row items-center justify-between">
                  <Text className="font-semibold text-foreground">{rule.tier_name}</Text>
                  <ChevronRight size={16} color="#7a8599" strokeWidth={2.8} />
                </View>
                <Text className="text-sm text-muted-foreground mt-1">
                  Từ {rule.min_total_points} điểm
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mx-4 mt-4 rounded-2xl bg-card p-5">
          <Text className="text-lg font-bold text-foreground">Lịch sử điểm</Text>
          <View className="mt-4 gap-3">
            {transactions.length === 0 ? (
              <Text className="text-sm text-muted-foreground">
                Chưa có giao dịch điểm nào.
              </Text>
            ) : (
              transactions.map((transaction) => (
                <View key={transaction.id} className="rounded-xl border border-border p-4">
                  <View className="flex-row items-center justify-between">
                    <Text className="font-semibold text-foreground">
                      {transaction.description ?? transaction.type ?? "Giao dịch điểm"}
                    </Text>
                    <Text
                      className={`font-semibold ${
                        transaction.points >= 0 ? "text-primary" : "text-red-500"
                      }`}
                    >
                      {transaction.points >= 0 ? "+" : ""}
                      {transaction.points}
                    </Text>
                  </View>
                  <Text className="text-sm text-muted-foreground mt-1">
                    {formatDateTime(transaction.created_at)}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
