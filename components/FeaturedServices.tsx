import { View, Text } from "react-native";
import { CarFront, Sparkles, Shield } from "lucide-react-native";
import ServiceItem from "./ServiceItem";
import { formatCurrency } from "@/lib/format";
import type { ServicePackage } from "@/lib/types";

const FALLBACK_SERVICES = [
  {
    icon: CarFront,
    iconVariant: "primary" as const,
    name: "Rửa xe thông minh",
    subtitle: "Công nghệ AI - 15 phút",
    price: "150.000đ",
  },
  {
    icon: Sparkles,
    iconVariant: "muted" as const,
    name: "Vệ sinh nội thất",
    subtitle: "Chăm sóc chuyên sâu",
    price: "350.000đ",
  },
  {
    icon: Shield,
    iconVariant: "muted" as const,
    name: "Phủ Ceramic",
    subtitle: "Bảo vệ bề mặt sơn",
    price: "1.200.000đ",
  },
];

interface FeaturedServicesProps {
  onSelect?: (service: ServicePackage) => void;
  services?: ServicePackage[];
}

export default function FeaturedServices({
  onSelect,
  services,
}: FeaturedServicesProps) {
  const mappedServices =
    services && services.length > 0
      ? services.map((service, index) => ({
          icon: index === 0 ? CarFront : index === 1 ? Sparkles : Shield,
          iconVariant: index === 0 ? ("primary" as const) : ("muted" as const),
          name: service.name,
          subtitle: `${service.duration_minutes} phút`,
          price: formatCurrency(service.base_price),
          service,
        }))
      : FALLBACK_SERVICES.map((service) => ({ ...service, service: undefined }));

  return (
    <View className="px-4 mt-5">
      <Text className="font-bold text-xl text-foreground mb-1">
        Dịch vụ nổi bật
      </Text>
      <View className="bg-card rounded-xl px-4">
        {mappedServices.map((service, index) => (
          <View
            key={service.name}
            style={
              index < mappedServices.length - 1
                ? { borderBottomWidth: 1, borderBottomColor: "#e2e8f0" }
                : undefined
            }
          >
            <ServiceItem
              icon={service.icon}
              iconVariant={service.iconVariant}
              name={service.name}
              subtitle={service.subtitle}
              price={service.price}
              onPress={service.service ? () => onSelect?.(service.service) : undefined}
            />
          </View>
        ))}
      </View>
    </View>
  );
}
