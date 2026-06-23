import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ticket, Star } from "lucide-react-native";

interface Voucher {
  id: string;
  title: string;
  expires: string;
}

interface VoucherSectionProps {
  vouchers?: Voucher[];
  selectedVoucherId?: string;
  onSelectVoucher?: (id: string) => void;
}

export default function VoucherSection({
  vouchers = [{ id: "v1", title: "Giảm 20k - Member", expires: "Hết hạn: 31/10/2023" }],
  selectedVoucherId,
  onSelectVoucher,
}: VoucherSectionProps) {
  const [code, setCode] = useState("");

  return (
    <View className="px-4 mb-1">
      <Text className="text-xs font-bold text-muted-foreground tracking-wide mb-2">
        ƯU ĐÃI & KHUYẾN MÃI
      </Text>

      {/* Coupon input */}
      <View className="flex-row gap-2 mb-3">
        <View className="flex-1 bg-card border border-border rounded-xl px-3 py-3 justify-center">
          <TextInput
            value={code}
            onChangeText={setCode}
            placeholder="Nhập mã giảm giá..."
            placeholderTextColor="#8a96a8"
            className="text-sm text-foreground"
            style={{ fontSize: 13 }}
          />
        </View>
        <TouchableOpacity className="bg-primary px-4 py-3 rounded-xl justify-center">
          <Text className="text-white text-sm font-semibold">Áp dụng</Text>
        </TouchableOpacity>
      </View>

      {/* Voucher chips */}
      <View className="flex-row gap-3">
        {vouchers.map((v) => {
          const selected = v.id === selectedVoucherId;
          return (
            <TouchableOpacity
              key={v.id}
              onPress={() => onSelectVoucher?.(v.id)}
              className={`flex-1 rounded-xl flex-row items-center gap-3 px-3 py-3 ${
                selected ? "border-2 border-primary" : "border border-border bg-card"
              }`}
            >
              <View className="w-8 h-8 bg-secondary rounded-lg items-center justify-center">
                <Ticket size={16} color="#1a56db" strokeWidth={3} />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground">
                  {v.title}
                </Text>
                <Text className="text-xs text-muted-foreground">{v.expires}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Extra voucher slot */}
        <View className="border border-border rounded-xl w-16 items-center justify-center">
          <Star size={20} color="#8a96a8" strokeWidth={2.4} />
        </View>
      </View>
    </View>
  );
}
