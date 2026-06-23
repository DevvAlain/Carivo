import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

interface ScreenStateProps {
  actionLabel?: string;
  description: string;
  loading?: boolean;
  onAction?: () => void;
  title: string;
}

export default function ScreenState({
  actionLabel,
  description,
  loading = false,
  onAction,
  title,
}: ScreenStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-6">
      {loading ? (
        <ActivityIndicator size="large" color="#1a5fd4" />
      ) : (
        <>
          <Text className="text-2xl font-bold text-foreground text-center">
            {title}
          </Text>
          <Text className="text-sm text-muted-foreground text-center mt-3 leading-6">
            {description}
          </Text>
          {actionLabel && onAction ? (
            <TouchableOpacity
              onPress={onAction}
              className="mt-6 rounded-xl bg-primary px-5 py-3"
            >
              <Text className="text-white font-semibold">{actionLabel}</Text>
            </TouchableOpacity>
          ) : null}
        </>
      )}
    </View>
  );
}
