/* Providers, then the gate, then the routes. Every screen lives in screens/;
   the files under app/ only say which one a route shows. */

import '../lib/i18n';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AccountProvider } from '../lib/account';
import { AuthProvider } from '../lib/auth';
import { LocationProvider } from '../lib/location';
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
              <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="profile" options={{ presentation: 'modal' }} />
                <Stack.Screen name="vehicles/index" options={{ presentation: 'modal' }} />
                <Stack.Screen name="vehicles/new" options={{ presentation: 'modal' }} />
              </Stack>
            </LocationProvider>
          </AuthGate>
        </AccountProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
