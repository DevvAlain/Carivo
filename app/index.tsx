import { Redirect } from "expo-router";
import { useApp } from "@/providers/AppProvider";

export default function RootIndex() {
  const { isAuthenticated } = useApp();
  return <Redirect href={isAuthenticated ? "/(tabs)" : "/login"} />;
}
