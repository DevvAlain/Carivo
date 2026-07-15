import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { Smartphone, Lock, Eye, EyeOff, ArrowRight } from "lucide-react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ApiError } from "@/lib/api";
import { useApp } from "@/providers/AppProvider";

const CAR_WASH_1 =
  "https://storage.googleapis.com/banani-generated-images/generated-images/7a0e8afa-8db2-4d36-8b83-71f9a1fe5428.jpg";
const CAR_WASH_2 =
  "https://storage.googleapis.com/banani-generated-images/generated-images/6da74e0d-fae2-44e9-809d-c566767ae47d.jpg";

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ redirect?: string }>();
  const { authBusy, login } = useApp();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập số điện thoại và mật khẩu.");
      return;
    }

    try {
      await login(phone, password);
      if (params.redirect === "payment") {
        router.replace("/payment");
        return;
      }

      router.replace("/(tabs)");
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Đăng nhập thất bại.";
      Alert.alert("Không thể đăng nhập", message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title section */}
          <View className="pt-12 pb-6 px-6 items-center">
            <Text className="text-3xl font-bold text-foreground mb-2 text-center">
              Chào mừng trở lại
            </Text>
            <Text
              className="text-base text-muted-foreground text-center"
              style={{ lineHeight: 22 }}
            >
              Đăng nhập để trải nghiệm dịch vụ{"\n"}chăm sóc xe thông minh
            </Text>
          </View>

          {/* Login card */}
          <View className="mx-4 bg-card rounded-2xl p-6 gap-5">
            {/* Phone field */}
            <View className="gap-1">
              <Text className="text-sm font-medium text-foreground">
                Số điện thoại
              </Text>
              <View className="flex-row items-center gap-3 bg-input rounded-xl px-4 py-3 border border-border">
                <Smartphone size={18} color="#94a3b8" strokeWidth={2.7} />
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Nhập số điện thoại của bạn"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  className="flex-1 text-sm text-foreground"
                  style={{ fontSize: 14 }}
                />
              </View>
            </View>

            {/* Password field */}
            <View className="gap-1">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-medium text-foreground">
                  Mật khẩu
                </Text>
                <TouchableOpacity onPress={() => router.push("/forgot-password")}>
                  <Text className="text-sm text-primary font-medium">
                    Quên mật khẩu?
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="flex-row items-center gap-3 bg-input rounded-xl px-4 py-3 border border-border">
                <Lock size={18} color="#94a3b8" strokeWidth={2.7} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPassword}
                  className="flex-1 text-sm text-foreground"
                  style={{ fontSize: 14 }}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((p) => !p)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {showPassword ? (
                    <EyeOff size={18} color="#94a3b8" strokeWidth={2.7} />
                  ) : (
                    <Eye size={18} color="#94a3b8" strokeWidth={2.7} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Login button */}
            <TouchableOpacity
              disabled={authBusy}
              onPress={handleLogin}
              className={`rounded-xl py-4 flex-row items-center justify-center gap-2 ${
                authBusy ? "bg-primary/60" : "bg-primary"
              }`}
            >
              {authBusy ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Text className="text-white text-base font-semibold">
                    Đăng nhập
                  </Text>
                  <ArrowRight size={18} color="#ffffff" strokeWidth={2.7} />
                </>
              )}
            </TouchableOpacity>

            {/* Register link */}
            <View className="flex-row items-center justify-center gap-1">
              <Text className="text-sm text-foreground">
                Chưa có tài khoản?
              </Text>
              <TouchableOpacity onPress={() => router.push("/register")}>
                <Text className="text-sm text-primary font-semibold">
                  Đăng ký ngay
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom images */}
          <View className="mt-6 px-4 flex-row gap-3">
            <View className="flex-1 rounded-xl overflow-hidden" style={{ height: 120 }}>
              <Image
                source={{ uri: CAR_WASH_1 }}
                style={{ width: "100%", height: 120 }}
                resizeMode="cover"
              />
            </View>
            <View className="flex-1 rounded-xl overflow-hidden" style={{ height: 120 }}>
              <Image
                source={{ uri: CAR_WASH_2 }}
                style={{ width: "100%", height: 120 }}
                resizeMode="cover"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#e8eef6",
  },
});
