export type Role = "CUSTOMER" | "ADMIN" | "STAFF" | string;

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    total_pages?: number;
  };
}

export interface UserPublic {
  id: string;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
  role?: Role;
  is_active?: boolean;
}

export interface AuthTokenPayload {
  access_token: string;
  user: UserPublic;
}

export interface PhoneVerificationChallenge {
  challenge_id: string;
  phone: string;
  purpose: "REGISTER" | "CHANGE_PHONE";
  expires_at: string;
  retry_after_seconds?: number;
  debug_otp?: string | null;
}

export interface PhoneVerificationToken {
  verification_token: string;
  phone: string;
  purpose: "REGISTER" | "CHANGE_PHONE";
  expires_at: string;
}

export interface Garage {
  id: string;
  name: string;
  garage_code?: string;
  phone?: string | null;
  email?: string | null;
  address?: string;
  ward?: string | null;
  district?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  opening_time?: string | null;
  closing_time?: string | null;
  slot_interval_minutes?: number;
  late_grace_minutes?: number;
  description?: string | null;
  image_url?: string | null;
  cover_image_url?: string | null;
  rating_average?: number | null;
  rating_count?: number | null;
  is_active?: boolean;
}

export interface BookingInspection {
  id: string;
  booking_id: string;
  inspector_id?: string | null;
  vehicle_condition?: string | null;
  notes?: string | null;
  inspection_images?: string[];
  created_at: string;
  updated_at?: string;
}

export type VehicleType = "MOTORBIKE" | "CAR";
export type EngineType = "GASOLINE" | "ELECTRIC";

export interface Vehicle {
  id: string;
  raw_license_plate: string;
  normalized_license_plate?: string;
  vehicle_type: VehicleType;
  engine_type: EngineType;
  motorbike_cc_group?: "UNDER_175CC" | "OVER_175CC" | null;
  car_body_type?:
    | "HATCHBACK"
    | "SEDAN"
    | "SUV"
    | "MPV"
    | "PICKUP"
    | "VAN"
    | null;
  seat_count?: number | null;
  brand?: string | null;
  model?: string | null;
  color?: string | null;
  is_default?: boolean;
  is_active?: boolean;
}

export interface ServicePackage {
  id: string;
  name: string;
  description?: string | null;
  vehicle_type: VehicleType;
  service_type?: "WASH" | "ADDON" | "COMBO" | string;
  base_price: number;
  duration_minutes: number;
  requires_wash_bay?: boolean;
  requires_care_staff?: boolean;
  is_active?: boolean;
}

export interface Promotion {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  discount_type: "PERCENTAGE" | "FIXED_AMOUNT";
  discount_value: number;
  max_discount_amount?: number | null;
  min_order_amount?: number;
  applicable_vehicle_types?: VehicleType[];
  applicable_service_package_ids?: string[];
  end_at?: string;
}

export interface LoyaltyAccount {
  id: string;
  customer_id?: string;
  current_tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM" | string;
  total_points: number;
  available_points: number;
  redeemed_points: number;
  expired_points: number;
  total_spent: number;
  total_visits: number;
  last_visit_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface LoyaltySummary {
  loyalty: LoyaltyAccount;
  current_tier_rule?: LoyaltyTierRule | null;
  next_tier_rule?: LoyaltyTierRule | null;
}

export interface LoyaltyTransaction {
  id: string;
  type?: string;
  direction?: "EARN" | "SPEND" | string;
  points: number;
  description?: string;
  created_at: string;
}

export interface LoyaltyTierRule {
  id: string;
  tier_name: string;
  booking_window_days?: number;
  max_upcoming_bookings?: number;
  point_multiplier?: number;
  priority_level?: number;
  min_total_spent?: number;
  min_total_visits?: number;
  min_total_points?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AvailableSlot {
  start_time: string;
  end_time: string;
  is_available: boolean;
  unavailable_reasons?: string[];
}

export interface AvailableSlotDay {
  date: string;
  opening_time?: string;
  closing_time?: string;
  has_available_slots: boolean;
  reason?: string | null;
  available_slots?: AvailableSlot[];
  slots?: AvailableSlot[];
}

export interface AvailableSlotsPayload {
  garage_id: string;
  vehicle_id?: string | null;
  service_package_id: string;
  add_on_service_ids?: string[];
  date?: string;
  start_date?: string;
  requested_days?: number;
  has_available_slots?: boolean;
  days?: AvailableSlotDay[];
  available_slots?: AvailableSlot[];
  slots?: AvailableSlot[];
}

export interface Booking {
  id: string;
  garage_id: string;
  vehicle_id?: string | null;
  service_package_id: string;
  booking_date?: string;
  start_time: string;
  end_time?: string;
  original_price?: number;
  discount_amount?: number;
  final_price?: number;
  payment_status?: "UNPAID" | "PENDING" | "PAID" | string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "CHECKED_IN"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELED"
    | "NO_SHOW"
    | string;
  promotion?: Promotion | null;
  garage?: Garage | null;
  vehicle?: Vehicle | null;
  service_package?: ServicePackage | null;
  note?: string | null;
  used_points?: number;
  earned_points?: number;
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  related_type?: string;
  related_id?: string;
  in_app_status?: "UNREAD" | "READ" | string;
  read_at?: string | null;
  created_at: string;
}

export interface WashHistory {
  id: string;
  booking_id: string;
  amount_paid: number;
  discount_amount: number;
  points_earned: number;
  points_used: number;
  payment_method?: string;
  paid_at?: string;
  service_completed_at?: string;
  booking?: Pick<Booking, "id" | "start_time" | "status" | "payment_status"> | null;
  garage?: Garage | null;
  vehicle?: Vehicle | null;
  service_package?: ServicePackage | null;
}

export interface Waitlist {
  id: string;
  customer_id?: string;
  vehicle_id?: string;
  garage_id?: string;
  service_package_id?: string;
  add_on_service_ids?: string[];
  vehicle_type?: VehicleType;
  desired_start_time: string;
  status: "WAITING" | "OFFERED" | "ACCEPTED" | "CANCELED" | "EXPIRED" | string;
  offered_at?: string | null;
  offer_expires_at?: string | null;
  accepted_at?: string | null;
  canceled_at?: string | null;
  cancel_reason?: string | null;
  expired_at?: string | null;
  created_booking_id?: string | null;
  note?: string | null;
  garage?: Garage | null;
  vehicle?: Vehicle | null;
  service_package?: ServicePackage | null;
}

export interface SurveyQuestion {
  id: string;
  text: string;
  type: "RATING" | "NPS" | "SINGLE_CHOICE" | "MULTI_CHOICE" | "TEXT";
  is_required: boolean;
  options?: string[];
  order: number;
}

export interface Survey {
  id: string;
  title: string;
  description?: string | null;
  status: "DRAFT" | "PUBLISHED" | "CLOSED";
  questions: SurveyQuestion[];
  response_expires_at?: string | null;
}
