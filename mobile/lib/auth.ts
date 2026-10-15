/* Sign-in. Three ways in, one account model:
     - email: a 6-digit code;
     - Apple and Google: native sheets that return an ID token, exchanged with
       signInWithIdToken. Both are hidden when not available in this build.
   Every new auth user gets a profile and starting credits from the
   handle_new_user trigger; the nickname is asked for in onboarding.
   Who is signed in right now is providers/AuthProvider.tsx. */

import type { Session as AuthSession } from '@supabase/supabase-js';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { supabase } from './supabase';

/** The first name a provider gave us, as a starting nickname. */
export function suggestedNickname(session: AuthSession | null): string {
  const meta = session?.user.user_metadata ?? {};
  const full = String(meta.given_name ?? meta.full_name ?? meta.name ?? '').trim();
  return full.split(/\s+/)[0]?.slice(0, 30) ?? '';
}

// ─── Email code ──────────────────────────────────────────────────────────

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* Supabase's built-in mail sender is rate-limited to a handful of messages an
   hour — fine for development. Before release, set up SMTP in the dashboard
   or turn this off, or drivers will wait for codes that never arrive. */
export const emailAuthAvailable = true;

export async function sendEmailCode(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: { shouldCreateUser: true },
  });
  if (error) throw error;
}

export async function verifyEmailCode(email: string, token: string) {
  const { error } = await supabase.auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token,
    type: 'email',
  });
  if (error) throw error;
}

// ─── Apple ───────────────────────────────────────────────────────────────

export const appleAvailable = () =>
  Platform.OS === 'ios' ? AppleAuthentication.isAvailableAsync() : Promise.resolve(false);

export async function signInWithApple() {
  // Apple signs a hash of the nonce; Supabase checks it against the raw one.
  const rawNonce = Crypto.randomUUID();
  const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
    nonce: hashedNonce,
  });
  if (!credential.identityToken) throw new Error('apple: no identity token');

  const { error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
    nonce: rawNonce,
  });
  if (error) throw error;

  // Apple sends the name only on the very first sign-in, and not in the token.
  // Kept in auth metadata so onboarding can offer it as the nickname.
  const given = credential.fullName?.givenName?.trim();
  if (given) await supabase.auth.updateUser({ data: { given_name: given } }).catch(() => {});
}

export { googleAvailable, signInWithGoogle } from './google';

export async function signOut() {
  await supabase.auth.signOut();
}

/* Backing out of a native sheet. Apple raises ERR_REQUEST_CANCELED; Google's
   codes are platform-specific numbers ('-5' on iOS, '12501' on Android). */
const CANCELLED = new Set(['ERR_REQUEST_CANCELED', 'SIGN_IN_CANCELLED', '-5', '12501']);

/* Android's "developer error": the app's package name and signing
   certificate do not match any OAuth client. It only ever means the setup is
   wrong, never that the driver did something. */
const MISCONFIGURED = new Set(['DEVELOPER_ERROR', '10', 'PLAY_SERVICES_NOT_AVAILABLE', '12500']);

/** Supabase and the native sheets report failures in English. Map the ones a driver can act on. */
export function authErrorKey(error: unknown): string {
  const message = error instanceof Error ? error.message : String((error as { message?: unknown })?.message ?? error);
  const code = String((error as { code?: unknown })?.code ?? '');
  if (CANCELLED.has(code) || /cancel/i.test(message)) return 'auth.errors.cancelled';
  if (MISCONFIGURED.has(code) || /developer_error|audience|invalid.*client/i.test(message)) {
    return 'auth.errors.provider';
  }
  if (/expired|invalid.*(otp|token)|otp.*invalid/i.test(message)) return 'auth.errors.code';
  if (/rate limit|too many|after \d+ seconds/i.test(message)) return 'auth.errors.rate';
  if (/network|fetch/i.test(message)) return 'auth.errors.network';
  return 'auth.errors.generic';
}
