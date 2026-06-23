export function formatCurrency(value?: number | null) {
  const amount = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateLabel(isoDate: string) {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

export function formatDateTime(isoDate: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

export function formatDateTimeLong(isoDate: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

export function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function minutesUntil(isoDate: string) {
  const delta = new Date(isoDate).getTime() - Date.now();
  return Math.max(0, Math.round(delta / 60000));
}

export function formatLicensePlate(plate: string) {
  const value = plate.trim();
  if (!value) {
    return { top: "--", bottom: "--" };
  }

  const cleaned = value.replace(/\s+/g, "");
  const parts = cleaned.split("-");

  if (parts.length === 2) {
    return { top: parts[0], bottom: parts[1] };
  }

  if (cleaned.length > 4) {
    return {
      top: cleaned.slice(0, Math.min(4, cleaned.length - 4)),
      bottom: cleaned.slice(-4),
    };
  }

  return { top: cleaned, bottom: "" };
}

export function compactName(fullName?: string | null, fallback = "Khách") {
  if (!fullName) {
    return fallback;
  }

  const parts = fullName.trim().split(/\s+/);
  return parts[parts.length - 1] || fallback;
}
