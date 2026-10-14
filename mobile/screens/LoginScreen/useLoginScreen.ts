import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  appleAvailable,
  authErrorKey,
  emailAuthAvailable,
  googleAvailable,
  signInWithApple,
  signInWithGoogle,
} from '../../lib/auth';

export enum SignInProvider {
  Google = 'google',
  Apple = 'apple',
  Email = 'email',
}

/** The providers with a native sheet; email has its own screen. */
export type NativeProvider = SignInProvider.Google | SignInProvider.Apple;

export function useLoginScreen() {
  const { t: translate } = useTranslation();
  const [emailOpen, setEmailOpen] = useState(false);
  const [appleReady, setAppleReady] = useState(false);
  const [busy, setBusy] = useState<NativeProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sign in with Apple exists on iOS 13+ only; the button is hidden elsewhere.
  useEffect(() => {
    void appleAvailable().then(setAppleReady).catch(() => setAppleReady(false));
  }, []);

  const signIn = async (provider: NativeProvider) => {
    setBusy(provider);
    setError(null);
    try {
      await (provider === SignInProvider.Google ? signInWithGoogle() : signInWithApple());
      // No setBusy(null) on success: the gate swaps this screen out, and
      // clearing the spinner first would flash the buttons back for a frame.
    } catch (requestError) {
      const key = authErrorKey(requestError);
      // Backing out of the native sheet is not an error worth showing.
      if (key !== 'auth.errors.cancelled') setError(translate(key));
      setBusy(null);
    }
  };

  return {
    emailOpen,
    openEmail: () => setEmailOpen(true),
    closeEmail: () => setEmailOpen(false),
    providers: { apple: appleReady, google: googleAvailable, email: emailAuthAvailable },
    busy,
    error,
    signIn,
  };
}
