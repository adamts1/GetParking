/* Providers, then the gate, then the routes. Every screen lives in screens/;
   the files under app/ only say which one a route shows. */

import '../lib/i18n';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AccountProvider, AuthProvider, LiveTrackingProvider, LocationProvider, SessionProvider } from '../providers';
import { AuthGate } from '../screens';
import { colors } from '../theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AuthProvider>
        <AccountProvider>
          {/* Location sits inside the gate so the permission prompt comes after
              sign-in, not on a cold first launch before the app has explained
              itself. */}
          <AuthGate>
            <LocationProvider>
              {/* Inside Location because an open session reports position; live tracking
                  sits inside Session because it follows the match. */}
              <SessionProvider>
                <LiveTrackingProvider>
                  <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="profile" options={{ presentation: 'modal' }} />
                    <Stack.Screen name="vehicles/index" options={{ presentation: 'modal' }} />
                    <Stack.Screen name="vehicles/new" options={{ presentation: 'modal' }} />
                    <Stack.Screen name="success" options={{ gestureEnabled: false, animation: 'fade' }} />
                  </Stack>
                </LiveTrackingProvider>
              </SessionProvider>
            </LocationProvider>
          </AuthGate>
        </AccountProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
