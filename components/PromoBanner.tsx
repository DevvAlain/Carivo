import { View, Text, TouchableOpacity, ImageBackground, StyleSheet } from "react-native";

const BANNER_IMAGE =
  "https://firebasestorage.googleapis.com/v0/b/banani-prod.appspot.com/o/reference-images%2Fe0b24ab0-59c1-4473-8dc4-849ab62eab82?alt=media&token=e7745cd9-7b6a-41c2-b0fa-b84355d444a7";

interface PromoBannerProps {
  badge?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  onPress?: () => void;
}

export default function PromoBanner({
  badge = "ƯU ĐÃI ĐỘC QUYỀN",
  title = "Giảm 50% cho lần rửa đầu tiên",
  subtitle,
  ctaText = "Nhận ngay",
  onPress,
}: PromoBannerProps) {
  return (
    <View className="mx-4 rounded-xl overflow-hidden" style={{ height: 180 }}>
      <ImageBackground
        source={{ uri: BANNER_IMAGE }}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <View style={styles.overlay} />
      <View className="flex-1 p-4 justify-between">
        <View>
          <View className="bg-primary rounded-sm px-2 py-1 self-start mb-2">
            <Text className="text-white text-xs font-semibold">{badge}</Text>
          </View>
          <Text className="text-white font-bold text-2xl leading-tight">
            {title}
          </Text>
          {subtitle ? (
            <Text className="text-white/80 text-sm mt-2 leading-5">
              {subtitle}
            </Text>
          ) : null}
        </View>
        <TouchableOpacity
          onPress={onPress}
          className="bg-card rounded-lg px-5 py-2 self-start mt-2"
        >
          <Text className="text-primary font-semibold text-sm">{ctaText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(20,70,180,0.80)",
  },
});
