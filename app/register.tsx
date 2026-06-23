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

export default function RegisterScreen() {
  const router = useRouter();
  const {
    authBusy,
    registerCustomer,
    requestPhoneVerification,
    verifyPhoneOtp,
  } = useApp();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const handleRequestOtp = async () => {
    if (!phone) {
      Alert.alert("Thiếu số điện thoại", "Vui lòng nhập số điện thoại.");
      return;
    }

    try {
      const challenge = await requestPhoneVerification(phone);
      setChallengeId(challenge.challenge_id);
      setDebugOtp(challenge.debug_otp ?? null);
      setStep(2);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Không thể gửi mã OTP.";
      Alert.alert("Lỗi OTP", message);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || !challengeId) {
      Alert.alert("Thiếu mã OTP", "Vui lòng nhập mã xác thực.");
      return;
    }

    try {
      const verification = await verifyPhoneOtp(challengeId, otp);
      setVerificationToken(verification.verification_token);
      setStep(3);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "OTP không hợp lệ.";
      Alert.alert("Không thể xác thực", message);
    }
  };

  const handleRegister = async () => {
    if (!verificationToken) {
      Alert.alert("Thiếu xác thực", "Vui lòng xác thực OTP trước.");
      return;
    }

    if (!password || password !== confirmPassword) {
      Alert.alert("Mật khẩu chưa đúng", "Vui lòng kiểm tra lại mật khẩu.");
      return;
    }

    try {
      await registerCustomer({
        phone,
        password,
        email: email || undefined,
        full_name: fullName || undefined,
        phone_verification_token: verificationToken,
      });
      router.replace("/(tabs)");
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Không thể đăng ký tài khoản.";
      Alert.alert("Đăng ký thất bại", message);
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
        <ScrollView
          contentContainerStyle={{ paddingBottom: 28 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-4 pt-5 pb-3 flex-row items-center gap-3">
            <TouchableOpacity onPress={handleBack}>
              <ArrowLeft size={22} color="#1a1a1a" strokeWidth={2.2} />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-primary">Đăng ký tài khoản</Text>
          </View>

          <View className="px-4 pt-4">
            <Text className="text-3xl font-bold text-foreground">
              Bắt đầu với Carivo
            </Text>
            <Text className="text-sm text-muted-foreground mt-2 leading-6">
              Xác thực số điện thoại trước, sau đó hoàn thiện hồ sơ customer để
              đặt lịch trên ứng dụng.
            </Text>
          </View>

          <View className="mx-4 mt-6 rounded-2xl bg-card p-5 gap-4">
            <View className="flex-row gap-2">
              {[1, 2, 3].map((item) => (
                <View
                  key={item}
                  className={`h-2 flex-1 rounded-full ${
                    item <= step ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </View>

            {step === 1 ? (
              <>
                <Text className="text-base font-semibold text-foreground">
                  1. Nhập số điện thoại
                </Text>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholder="0901234567"
                  placeholderTextColor="#94a3b8"
                  className="rounded-xl border border-border bg-input px-4 py-3 text-foreground"
                />
                <TouchableOpacity
                  disabled={authBusy}
                  onPress={handleRequestOtp}
                  className="bg-primary rounded-xl py-4 items-center"
                >
                  {authBusy ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text className="text-white font-semibold">Gửi mã OTP</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <Text className="text-base font-semibold text-foreground">
                  2. Xác thực OTP
                </Text>
                <Text className="text-sm text-muted-foreground">
                  Mã đã được gửi tới {phone}. {debugOtp ? `OTP test: ${debugOtp}` : ""}
                </Text>
                <TextInput
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  placeholder="123456"
                  placeholderTextColor="#94a3b8"
                  className="rounded-xl border border-border bg-input px-4 py-3 text-foreground"
                />
                <TouchableOpacity
                  disabled={authBusy}
                  onPress={handleVerifyOtp}
                  className="bg-primary rounded-xl py-4 items-center"
                >
                  {authBusy ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text className="text-white font-semibold">Xác thực OTP</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setStep(1)}>
                  <Text className="text-sm text-primary font-medium text-center">
                    Đổi số điện thoại
                  </Text>
                </TouchableOpacity>
              </>
            ) : null}

            {step === 3 ? (
              <>
                <Text className="text-base font-semibold text-foreground">
                  3. Hoàn thiện hồ sơ
                </Text>
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
                  placeholder="Email (không bắt buộc)"
                  placeholderTextColor="#94a3b8"
                  className="rounded-xl border border-border bg-input px-4 py-3 text-foreground"
                />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder="Mật khẩu"
                  placeholderTextColor="#94a3b8"
                  className="rounded-xl border border-border bg-input px-4 py-3 text-foreground"
                />
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholder="Nhập lại mật khẩu"
                  placeholderTextColor="#94a3b8"
                  className="rounded-xl border border-border bg-input px-4 py-3 text-foreground"
                />
                <TouchableOpacity
                  disabled={authBusy}
                  onPress={handleRegister}
                  className="bg-primary rounded-xl py-4 items-center"
                >
                  {authBusy ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text className="text-white font-semibold">Tạo tài khoản</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
