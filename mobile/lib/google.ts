/* Sign in with Google.

   The native sheet hands us an ID token, which Supabase exchanges for a
   session (signInWithIdToken). No browser, no redirect, and the same call on
   both platforms — only the client ids differ:

     - iOS needs its own client id, plus the reversed id as a URL scheme so
       Google can come back to the app (see app.config.js).
     - Android matches the app by package name and signing certificate, so it
       needs no id in the code at all — but the *web* client id is what both
       platforms send as the token's audience, and it is what Supabase checks.

   Everything is gated on those ids: with none set the button never appears,
   because a build without the config plugin has no native module to call. */

import { Platform } from 'react-native';
import { supabase } from './supabase';

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '';

/** Whether this build can offer Google at all. */
export const googleAvailable = Boolean(
  WEB_CLIENT_ID && (Platform.OS !== 'ios' || IOS_CLIENT_ID),
);

/** The native module is absent from Expo Go and from any build without the
    config plugin, so it is imported only when it is about to be used. */
const loadModule = () => import('@react-native-google-signin/google-signin');

let configured = false;

export async function signInWithGoogle() {
  const { GoogleSignin, isSuccessResponse, statusCodes } = await loadModule();

  if (!configured) {
    GoogleSignin.configure({
      webClientId: WEB_CLIENT_ID,
      iosClientId: IOS_CLIENT_ID || undefined,
      // The default scopes already cover the name and picture we show.
      offlineAccess: false,
    });
    configured = true;
  }

  // Android only; a device without Play Services shows Google's own prompt.
  if (Platform.OS === 'android') await GoogleSignin.hasPlayServices();

  /* A previous session can leave the SDK holding an account, and then the
     sheet returns the same token Supabase has already seen. Signing out of
     Google first makes every attempt a fresh choice of account — which is
     also what a driver expects after tapping "sign out" in the app. */
  await GoogleSignin.signOut().catch(() => {});

  const response = await GoogleSignin.signIn();
  if (!isSuccessResponse(response)) {
    // Backing out of the sheet is not a failure; the caller ignores this code.
    throw Object.assign(new Error('cancelled'), { code: statusCodes.SIGN_IN_CANCELLED });
  }

  const token = response.data.idToken;
  if (!token) throw new Error('google: no id token');

  const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token });
  if (error) throw error;
}
