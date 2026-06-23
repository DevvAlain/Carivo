import { View, Text } from "react-native";

interface Step {
  number: number;
  label: string;
  state: "done" | "active" | "inactive";
}

interface StepIndicatorProps {
  steps: Step[];
}

export default function StepIndicator({ steps }: StepIndicatorProps) {
  return (
    <View className="px-4 pb-4">
      <View className="flex-row items-center">
        {steps.map((step, index) => (
          <View key={step.number} className="flex-row items-center flex-1">
            <View className="flex-col items-center gap-1">
              <View
                className={`w-8 h-8 rounded-full items-center justify-center ${
                  step.state !== "inactive" ? "bg-primary" : "bg-muted"
                }`}
              >
                <Text
                  className={`text-sm font-bold ${
                    step.state !== "inactive"
                      ? "text-white"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.number}
                </Text>
              </View>
              <Text
                className={`text-xs font-medium ${
                  step.state !== "inactive"
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {step.label}
              </Text>
            </View>
            {index < steps.length - 1 && (
              <View
                className={`flex-1 mb-4 mx-1 ${
                  step.state === "done" ? "bg-primary" : "bg-muted"
                }`}
                style={{ height: 2 }}
              />
            )}
          </View>
        ))}
      </View>
    </View>
  );
}
