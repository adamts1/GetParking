/* Email sign-in: address, then a 6-digit code. An unknown address gets an
   account, so there is no separate sign-up to get lost in. */

import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TextInput } from 'react-native';
import { authErrorKey, EMAIL_RE, sendEmailCode, verifyEmailCode } from '../../lib/auth';
import { useCountdown } from '../../lib/hooks';

export const CODE_LENGTH = 6;
const RESEND_SECONDS = 30;

export function useEmailAuthScreen() {
  const { t } = useTranslation();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useCountdown();
  const codeInput = useRef<TextInput>(null);

  const send = async () => {
    if (!EMAIL_RE.test(email.trim())) {
      setEmailError(t('auth.errors.email'));
      return;
    }
    setEmailError(null);
    setBusy(true);
    setError(null);
    try {
      await sendEmailCode(email);
      setStep(2);
      setCode('');
      setResendIn(RESEND_SECONDS);
      setTimeout(() => codeInput.current?.focus(), 300);
    } catch (e) {
      setError(t(authErrorKey(e)));
    } finally {
      setBusy(false);
    }
  };

  const verify = async (value = code) => {
    if (value.length !== CODE_LENGTH || busy) return;
    setBusy(true);
    setError(null);
    try {
      await verifyEmailCode(email, value);
      // The gate swaps this screen out; leave the spinner on until it does.
    } catch (e) {
      setError(t(authErrorKey(e)));
      setCode('');
      setBusy(false);
    }
  };

  return {
    step,
    back: () => {
      setStep(1);
      setError(null);
    },
    email,
    setEmail,
    emailError,
    code,
    codeInput,
    onCodeChange: (value: string) => {
      const digits = value.replace(/\D/g, '').slice(0, CODE_LENGTH);
      setCode(digits);
      // Six digits in means the driver is done typing — no extra tap.
      if (digits.length === CODE_LENGTH) void verify(digits);
    },
    busy,
    error,
    resendIn,
    send: () => void send(),
    verify: () => void verify(),
  };
}
