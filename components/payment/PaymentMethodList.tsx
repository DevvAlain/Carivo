import { View, Text, TouchableOpacity } from "react-native";
import { CreditCard, Wallet, Smartphone, Landmark } from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";

interface PaymentMethod {
  id: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
}

const METHODS: PaymentMethod[] = [
  {
    id: "card",
    icon: CreditCard,
    title: "Thẻ tín dụng / Ghi nợ",
    subtitle: "Visa, Mastercard, JCB",
  },
  {
    id: "momo",
    icon: Wallet,
    title: "Ví MoMo",
    subtitle: "Thanh toán nhanh qua ví",
  },
  {
    id: "zalo",
    icon: Smartphone,
    title: "Ví ZaloPay",
    subtitle: "Thanh toán an toàn",
  },
  {
    id: "bank",
    icon: Landmark,
    title: "Chuyển khoản ngân hàng",
    subtitle: "VietQR / Chuyển khoản 24/7",
  },
];

interface PaymentMethodListProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function PaymentMethodList({
  selectedId,
  onSelect,
}: PaymentMethodListProps) {
  return (
    <View className="px-4 mt-4 mb-4">
      <Text className="text-xs font-bold text-muted-foreground tracking-wide mb-2">
        PHƯƠNG THỨC THANH TOÁN
      </Text>

      <View className="bg-card rounded-xl overflow-hidden border border-border">
        {METHODS.map((method, index) => {
          const Icon = method.icon;
          const selected = method.id === selectedId;

          return (
            <View key={method.id}>
              {index > 0 && (
                <View
                  className="border-t border-border"
                  style={{ marginHorizontal: 16 }}
                />
              )}
              <TouchableOpacity
                onPress={() => onSelect(method.id)}
                className={`flex-row items-center gap-3 px-4 py-3 ${
                  selected ? "bg-secondary" : ""
                }`}
              >
                <View
                  className={`w-10 h-10 rounded-xl items-center justify-center flex-shrink-0 ${
                    selected ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <Icon
                    size={20}
                    color={selected ? "#ffffff" : "#8a96a8"}
                    strokeWidth={2.4}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">
                    {method.title}
                  </Text>
                  <Text className="text-xs text-muted-foreground">
                    {method.subtitle}
                  </Text>
                </View>
                {/* Radio button */}
                <View
                  className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
                    selected ? "border-primary" : "border-muted-foreground"
                  }`}
                >
                  {selected && (
                    <View className="w-2.5 h-2.5 rounded-full bg-primary" />
                  )}
                </View>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>
    </View>
  );
}
