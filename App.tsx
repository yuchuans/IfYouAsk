import { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import {
  Lora_400Regular,
  Lora_500Medium,
  Lora_600SemiBold,
  Lora_700Bold,
} from '@expo-google-fonts/lora';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
} from '@expo-google-fonts/dm-sans';

import RootNavigator from './navigation/RootNavigator';
import { GameProvider } from './src/context/GameContext';
import { colors } from './src/theme';

SplashScreen.preventAutoHideAsync().catch(() => {
  /* preventAutoHideAsync may reject if the splash already hid; safe to ignore. */
});

export default function App() {
  const [fontsLoaded] = useFonts({
    Lora_400Regular,
    Lora_500Medium,
    Lora_600SemiBold,
    Lora_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Paint the OS-level root window cream on app boot. Android-only in
  // practice (the call is a no-op on iOS, so no Platform guard needed).
  //
  // Why this matters: app.json sets edgeToEdgeEnabled: true for Android,
  // so our app draws all the way to the screen edges with the system
  // navigation bar (gesture pill / 3-button bar) sitting as a translucent
  // overlay on top. Without this call, Android falls back to a default
  // white root window underneath the React Native view tree — and that
  // white shows through behind the translucent nav bar as a thin strip
  // at the bottom of the screen. Setting the root background to our
  // cream color makes that strip read as part of the app's surface
  // instead of a system gap. Affects every Android device and screen
  // size since it's a window-level color rather than a per-screen style.
  //
  // setBackgroundColorAsync resolves quickly and is safe to call after
  // first render; failures are purely cosmetic (SafeAreaView still
  // paints cream everywhere our React tree covers) so we swallow.
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background.cream).catch(() => {});
  }, []);

  if (!fontsLoaded) {
    return null;
  }

  return (
    // GestureHandlerRootView must be the outermost wrapper for
    // react-native-gesture-handler to detect touches on any descendants.
    // The flex:1 style is critical — without it the wrapper collapses to
    // zero height and nothing inside renders.
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <GameProvider>
          <NavigationContainer>
            <RootNavigator />
            <StatusBar style="auto" />
          </NavigationContainer>
        </GameProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
