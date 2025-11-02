import "@walletconnect/react-native-compat";

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppKitButton } from "@reown/appkit-react-native";
import { WalletConnectProvider } from "../config/appkit";
// Import to initialize AppKit

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <WalletConnectProvider>

      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
      {/* AppKit modal - wrapped in absolute positioning View for Expo Router Android compatibility */}
      <View style={{ position: "absolute", height: "100%", width: "100%" }}>
      <AppKitButton />
      </View>
      </WalletConnectProvider>
    </ThemeProvider>
  );
}
