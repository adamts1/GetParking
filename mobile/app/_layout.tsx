/* Providers, then the gate, then the routes. Every screen lives in screens/;
   the files under app/ only say which one a route shows. */

import '../lib/i18n';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AccountProvider } from '../lib/account';
import { AuthProvider } from '../lib/auth';
import { AuthGate } from '../screens';
import { C } from '../theme';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AuthProvider>
        <AccountProvider>
          <AuthGate>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg } }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="profile" options={{ presentation: 'modal' }} />
              <Stack.Screen name="vehicles/index" options={{ presentation: 'modal' }} />
              <Stack.Screen name="vehicles/new" options={{ presentation: 'modal' }} />
            </Stack>
          </AuthGate>
        </AccountProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
