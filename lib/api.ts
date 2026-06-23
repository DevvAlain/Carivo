import type {
  ApiEnvelope,
  AuthTokenPayload,
  AvailableSlotsPayload,
  Booking,
  Garage,
  LoyaltySummary,
  LoyaltyTierRule,
  LoyaltyTransaction,
  NotificationItem,
  PhoneVerificationChallenge,
  PhoneVerificationToken,
  Promotion,
  ServicePackage,
  Survey,
  UserPublic,
  Vehicle,
  WashHistory,
} from "@/lib/types";

const API_ROOT = "https://wdp301-project-backend.onrender.com/api/v1";

type QueryValue = string | number | boolean | null | undefined | string[];

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

interface RequestOptions {
  body?: BodyInit | Record<string, unknown>;
  headers?: HeadersInit;
  isFormData?: boolean;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  query?: Record<string, QueryValue>;
  token?: string | null;
}

function buildUrl(path: string, query?: Record<string, QueryValue>) {
  const url = new URL(`${API_ROOT}${path}`);

  if (!query) {
    return url.toString();
  }

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    if (Array.isArray(value)) {
      if (value.length > 0) {
        url.searchParams.set(key, value.join(","));
      }
      continue;
    }

    url.searchParams.set(key, String(value));
  }

  return url.toString();
}

async function request<T>(path: string, options: RequestOptions = {}) {
  const { body, headers, isFormData, method = "GET", query, token } = options;
  const response = await fetch(buildUrl(path, query), {
    method,
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(!body || isFormData ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
    body:
      body && typeof body === "object" && !(body instanceof FormData)
        ? JSON.stringify(body)
        : (body as BodyInit | undefined),
    credentials: "include",
  });

  const rawText = await response.text();
  const payload = rawText ? safeJsonParse(rawText) : null;

  if (!response.ok) {
    const message =
      getPayloadMessage(payload) ||
      response.statusText ||
      "Yeu cau that bai";
    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function getPayloadMessage(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const candidate = (payload as { message?: unknown }).message;
  return typeof candidate === "string" ? candidate : null;
}

export const api = {
  requestPhoneVerification(phone: string) {
    return request<ApiEnvelope<PhoneVerificationChallenge>>(
      "/auth/phone-verifications/request",
      {
        method: "POST",
        body: { phone, purpose: "REGISTER" },
      }
    );
  },

  verifyPhoneOtp(challengeId: string, otp: string) {
    return request<ApiEnvelope<PhoneVerificationToken>>(
      "/auth/phone-verifications/verify",
      {
        method: "POST",
        body: { challenge_id: challengeId, otp },
      }
    );
  },

  register(body: {
    phone: string;
    password: string;
    email?: string;
    full_name?: string;
    phone_verification_token: string;
  }) {
    return request<ApiEnvelope<{ user: UserPublic }>>("/auth/register", {
      method: "POST",
      body,
    });
  },

  login(phone: string, password: string) {
    return request<ApiEnvelope<AuthTokenPayload>>("/auth/login", {
      method: "POST",
      body: { phone, password },
    });
  },

  logout(token?: string | null) {
    return request<ApiEnvelope<{ message?: string }>>("/auth/logout", {
      method: "POST",
      token,
    });
  },

  getCurrentAuthUser(token: string) {
    return request<ApiEnvelope<{ user: UserPublic } | UserPublic>>("/auth/me", {
      token,
    });
  },

  forgotPassword(phone: string) {
    return request<ApiEnvelope<{ message?: string }>>("/auth/forgot-password", {
      method: "POST",
      body: { phone },
    });
  },

  resetPassword(phone: string, resetToken: string, newPassword: string) {
    return request<ApiEnvelope<{ message?: string }>>("/auth/reset-password", {
      method: "POST",
      body: {
        phone,
        reset_token: resetToken,
        new_password: newPassword,
      },
    });
  },

  getProfile(token: string) {
    return request<ApiEnvelope<UserPublic>>("/users/me", { token });
  },

  updateProfile(
    token: string,
    body: {
      full_name?: string;
      email?: string | null;
      avatar_url?: string | null;
      phone?: string;
      current_password?: string;
      phone_verification_token?: string;
    }
  ) {
    return request<ApiEnvelope<UserPublic>>("/users/me", {
      method: "PATCH",
      token,
      body,
    });
  },

  getGarages(query?: Record<string, QueryValue>) {
    return request<ApiEnvelope<Garage[]>>("/garages", { query });
  },

  getGarage(id: string) {
    return request<ApiEnvelope<Garage>>(`/garages/${id}`);
  },

  getServicePackages(query?: Record<string, QueryValue>) {
    return request<ApiEnvelope<ServicePackage[]>>("/service-packages", {
      query,
    });
  },

  getServicePackage(id: string) {
    return request<ApiEnvelope<ServicePackage>>(`/service-packages/${id}`);
  },

  getPromotions(query?: Record<string, QueryValue>) {
    return request<ApiEnvelope<Promotion[]>>("/promotions", { query });
  },

  validatePromotion(
    token: string,
    promotionCode: string,
    servicePackageId: string
  ) {
    return request<
      ApiEnvelope<{
        promotion: Promotion;
        discount_amount: number;
        final_price: number;
      }>
    >("/promotions/validate", {
      method: "POST",
      token,
      body: {
        promotion_code: promotionCode,
        service_package_id: servicePackageId,
      },
    });
  },

  getAvailableSlots(
    params: {
      garage_id: string;
      service_package_id: string;
      vehicle_id?: string;
      add_on_service_ids?: string[];
      date?: string;
      start_date?: string;
      days?: number;
    },
    token?: string | null
  ) {
    return request<ApiEnvelope<AvailableSlotsPayload>>("/bookings/available-slots", {
      query: params,
      token,
    });
  },

  getVehicles(token: string, query?: Record<string, QueryValue>) {
    return request<ApiEnvelope<Vehicle[]>>("/vehicles", { token, query });
  },

  createVehicle(
    token: string,
    body: {
      raw_license_plate: string;
      vehicle_type: "MOTORBIKE" | "CAR";
      engine_type: "GASOLINE" | "ELECTRIC";
      motorbike_cc_group?: "UNDER_175CC" | "OVER_175CC";
      car_body_type?:
        | "HATCHBACK"
        | "SEDAN"
        | "SUV"
        | "MPV"
        | "PICKUP"
        | "VAN";
      seat_count?: number;
      brand?: string;
      model?: string;
      color?: string;
      is_default?: boolean;
    }
  ) {
    return request<ApiEnvelope<Vehicle>>("/vehicles", {
      method: "POST",
      token,
      body,
    });
  },

  updateVehicle(
    token: string,
    id: string,
    body: Record<string, unknown>
  ) {
    return request<ApiEnvelope<Vehicle>>(`/vehicles/${id}`, {
      method: "PATCH",
      token,
      body,
    });
  },

  deleteVehicle(token: string, id: string) {
    return request<ApiEnvelope<Vehicle>>(`/vehicles/${id}`, {
      method: "DELETE",
      token,
    });
  },

  getBookings(token: string, query?: Record<string, QueryValue>) {
    return request<ApiEnvelope<Booking[]>>("/bookings", { token, query });
  },

  createBooking(
    token: string,
    body: {
      garage_id: string;
      vehicle_id: string;
      service_package_id: string;
      add_on_service_ids?: string[];
      start_time: string;
      promotion_code?: string;
      used_points?: number;
      note?: string;
    }
  ) {
    return request<ApiEnvelope<Booking>>("/bookings", {
      method: "POST",
      token,
      body,
    });
  },

  cancelBooking(token: string, id: string, reason?: string) {
    return request<ApiEnvelope<Booking>>(`/bookings/${id}/cancel`, {
      method: "PATCH",
      token,
      body: reason ? { reason } : {},
    });
  },

  getWaitlists(token: string) {
    return request<ApiEnvelope<unknown[]>>("/waitlists", { token });
  },

  createWaitlist(
    token: string,
    body: {
      garage_id: string;
      vehicle_id: string;
      service_package_id: string;
      add_on_service_ids?: string[];
      desired_start_time: string;
      note?: string;
    }
  ) {
    return request<ApiEnvelope<unknown>>("/waitlists", {
      method: "POST",
      token,
      body,
    });
  },

  getLoyaltySummary(token: string) {
    return request<ApiEnvelope<LoyaltySummary>>("/loyalty/me", { token });
  },

  getLoyaltyTransactions(token: string) {
    return request<ApiEnvelope<LoyaltyTransaction[]>>(
      "/loyalty/me/transactions",
      { token }
    );
  },

  getLoyaltyTierRules(token?: string | null) {
    return request<ApiEnvelope<LoyaltyTierRule[]>>("/loyalty/tier-rules", {
      token: token ?? undefined,
    });
  },

  redeemPreview(
    token: string,
    body: {
      service_package_id: string;
      promotion_id?: string;
      promotion_code?: string;
      used_points: number;
    }
  ) {
    return request<
      ApiEnvelope<{
        original_price?: number;
        discount_amount?: number;
        final_price?: number;
        points_value?: number;
      }>
    >("/loyalty/redeem-preview", {
      method: "POST",
      token,
      body,
    });
  },

  getNotifications(token: string) {
    return request<ApiEnvelope<NotificationItem[]>>("/notifications", { token });
  },

  getUnreadNotificationCount(token: string) {
    return request<ApiEnvelope<{ unread_count: number }>>(
      "/notifications/unread-count",
      { token }
    );
  },

  markAllNotificationsRead(token: string) {
    return request<ApiEnvelope<{ modified_count: number }>>(
      "/notifications/mark-all-read",
      {
        method: "PATCH",
        token,
      }
    );
  },

  markNotificationRead(token: string, id: string) {
    return request<ApiEnvelope<NotificationItem>>(`/notifications/${id}/read`, {
      method: "PATCH",
      token,
    });
  },

  deleteNotification(token: string, id: string) {
    return request<ApiEnvelope<NotificationItem>>(`/notifications/${id}`, {
      method: "DELETE",
      token,
    });
  },

  getWashHistories(token: string, query?: Record<string, QueryValue>) {
    return request<ApiEnvelope<WashHistory[]>>("/wash-histories", {
      token,
      query,
    });
  },

  getAvailableSurveys(token: string, bookingId: string) {
    return request<ApiEnvelope<Survey[]>>("/surveys/available", {
      token,
      query: { booking_id: bookingId },
    });
  },
};
