import { Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold, Outfit_800ExtraBold, useFonts } from '@expo-google-fonts/outfit';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider, useStore } from '../lib/store';
import { colors } from '../theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

function Shell() {
  const { ready, ageConfirmed } = useStore();
  const [fontsLoaded] = useFonts({ Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold, Outfit_800ExtraBold });

  useEffect(() => {
    if (ready && fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [ready, fontsLoaded]);
  // Never hold the splash for long: hide after a short cap even if fonts are slow.
  useEffect(() => {
    const id = setTimeout(() => SplashScreen.hideAsync().catch(() => {}), 1500);
    return () => clearTimeout(id);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.charcoal }}>
      <StatusBar style="light" />
      {ready && (
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.charcoal }, animation: 'fade' }}>
          <Stack.Protected guard={!ageConfirmed}>
            <Stack.Screen name="age-gate" />
          </Stack.Protected>
          <Stack.Protected guard={ageConfirmed}>
            <Stack.Screen name="index" />
            <Stack.Screen name="table" options={{ gestureEnabled: false }} />
            <Stack.Screen name="rules" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="tutorial" options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name="settings" options={{ animation: 'slide_from_right' }} />
          </Stack.Protected>
        </Stack>
      )}
    </View>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <Shell />
      </StoreProvider>
    </SafeAreaProvider>
  );
}
