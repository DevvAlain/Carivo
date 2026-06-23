import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { ApiError } from "@/lib/api";
import { useApp } from "@/providers/AppProvider";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { forgotPassword, resetPassword } = useApp();
  const [phone, setPhone] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);

  const handleRequestReset = async () => {
    if (!phone) {
      Alert.alert("Thiếu số điện thoại", "Vui lòng nhập số điện thoại.");
      return;
    }

    setSubmitting(true);
    try {
      await forgotPassword(phone);
      setStep(2);
      Alert.alert(
        "Đã gửi yêu cầu",
        "Backend đã nhận yêu cầu đặt lại mật khẩu. Nhập reset token khi bạn có token từ hệ thống."
      );
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Không thể gửi yêu cầu.";
      Alert.alert("Lỗi", message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!phone || !resetToken || !newPassword) {
      Alert.alert("Thiếu thông tin", "Vui lòng điền đủ các trường.");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(phone, resetToken, newPassword);
      Alert.alert("Thành công", "Bạn có thể đăng nhập bằng mật khẩu mới.");
      router.replace("/login");
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Không thể đặt lại mật khẩu.";
      Alert.alert("Lỗi", message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/login");
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
          <View className="px-4 pt-5 pb-3 flex-row items-center gap-3">
            <TouchableOpacity onPress={handleBack}>
              <ArrowLeft size={22} color="#1a1a1a" strokeWidth={2.2} />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-primary">Quên mật khẩu</Text>
          </View>

          <View className="px-4 pt-4">
            <Text className="text-3xl font-bold text-foreground">
              Khôi phục tài khoản
            </Text>
            <Text className="text-sm text-muted-foreground mt-2 leading-6">
              App customer dùng flow reset token của backend. Gửi yêu cầu trước,
              sau đó nhập reset token để đặt mật khẩu mới.
            </Text>
          </View>

          <View className="mx-4 mt-6 rounded-2xl bg-card p-5 gap-4">
            <TextInput
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="Số điện thoại"
              placeholderTextColor="#94a3b8"
              className="rounded-xl border border-border bg-input px-4 py-3 text-foreground"
            />

            {step === 2 ? (
              <>
                <TextInput
                  value={resetToken}
                  onChangeText={setResetToken}
                  placeholder="Reset token"
                  placeholderTextColor="#94a3b8"
                  className="rounded-xl border border-border bg-input px-4 py-3 text-foreground"
                />
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Mật khẩu mới"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry
                  className="rounded-xl border border-border bg-input px-4 py-3 text-foreground"
                />
              </>
            ) : null}

            <TouchableOpacity
              disabled={submitting}
              onPress={step === 1 ? handleRequestReset : handleResetPassword}
              className="bg-primary rounded-xl py-4 items-center"
            >
              {submitting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white font-semibold">
                  {step === 1 ? "Gửi yêu cầu reset" : "Đặt mật khẩu mới"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
