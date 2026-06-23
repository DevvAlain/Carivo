import { createContext, useContext, useMemo, useState } from "react";
import { api } from "@/lib/api";
import type {
  PhoneVerificationChallenge,
  PhoneVerificationToken,
  UserPublic,
} from "@/lib/types";

interface RegisterPayload {
  email?: string;
  full_name?: string;
  password: string;
  phone: string;
  phone_verification_token: string;
}

interface AppContextValue {
  accessToken: string | null;
  authUser: UserPublic | null;
  profile: UserPublic | null;
  authBusy: boolean;
  isAuthenticated: boolean;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  requestPhoneVerification: (phone: string) => Promise<PhoneVerificationChallenge>;
  verifyPhoneOtp: (
    challengeId: string,
    otp: string
  ) => Promise<PhoneVerificationToken>;
  registerCustomer: (payload: RegisterPayload) => Promise<void>;
  forgotPassword: (phone: string) => Promise<void>;
  resetPassword: (
    phone: string,
    resetToken: string,
    newPassword: string
  ) => Promise<void>;
  updateProfile: (payload: {
    full_name?: string;
    email?: string | null;
    avatar_url?: string | null;
    phone?: string;
    current_password?: string;
    phone_verification_token?: string;
  }) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<UserPublic | null>(null);
  const [profile, setProfile] = useState<UserPublic | null>(null);
  const [authBusy, setAuthBusy] = useState(false);

  const refreshProfile = async () => {
    if (!accessToken) {
      setProfile(null);
      return;
    }

    const response = await api.getProfile(accessToken);
    setProfile(response.data);
  };

  const login = async (phone: string, password: string) => {
    setAuthBusy(true);
    try {
      const response = await api.login(phone, password);
      setAccessToken(response.data.access_token);
      setAuthUser(response.data.user);
      const profileResponse = await api.getProfile(response.data.access_token);
      setProfile(profileResponse.data);
    } finally {
      setAuthBusy(false);
    }
  };

  const logout = async () => {
    setAuthBusy(true);
    try {
      if (accessToken) {
        try {
          await api.logout(accessToken);
        } catch {
          // Local logout should still proceed if the server cookie session is absent.
        }
      }
    } finally {
      setAccessToken(null);
      setAuthUser(null);
      setProfile(null);
      setAuthBusy(false);
    }
  };

  const requestPhoneVerification = async (phone: string) => {
    const response = await api.requestPhoneVerification(phone);
    return response.data;
  };

  const verifyPhoneOtp = async (challengeId: string, otp: string) => {
    const response = await api.verifyPhoneOtp(challengeId, otp);
    return response.data;
  };

  const registerCustomer = async (payload: RegisterPayload) => {
    setAuthBusy(true);
    try {
      await api.register(payload);
      await login(payload.phone, payload.password);
    } finally {
      setAuthBusy(false);
    }
  };

  const forgotPassword = async (phone: string) => {
    await api.forgotPassword(phone);
  };

  const resetPassword = async (
    phone: string,
    resetToken: string,
    newPassword: string
  ) => {
    await api.resetPassword(phone, resetToken, newPassword);
  };

  const updateProfile = async (payload: {
    full_name?: string;
    email?: string | null;
    avatar_url?: string | null;
    phone?: string;
    current_password?: string;
    phone_verification_token?: string;
  }) => {
    if (!accessToken) {
      throw new Error("Dang nhap de tiep tuc");
    }

    const response = await api.updateProfile(accessToken, payload);
    setProfile(response.data);
    setAuthUser((current) => ({ ...(current ?? {}), ...response.data }));
  };

  const value = useMemo<AppContextValue>(
    () => ({
      accessToken,
      authUser,
      profile,
      authBusy,
      isAuthenticated: Boolean(accessToken),
      login,
      logout,
      refreshProfile,
      requestPhoneVerification,
      verifyPhoneOtp,
      registerCustomer,
      forgotPassword,
      resetPassword,
      updateProfile,
    }),
    [accessToken, authBusy, authUser, profile]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }

  return context;
}
