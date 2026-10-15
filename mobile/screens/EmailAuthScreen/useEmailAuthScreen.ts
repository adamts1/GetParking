/* Email sign-in: address, then a 6-digit code. An unknown address gets an
   account, so there is no separate sign-up to get lost in. */

import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TextInput } from 'react-native';
import { authErrorKey, EMAIL_RE, sendEmailCode, verifyEmailCode } from '../../lib/auth';
import { useCountdown } from '../../lib/hooks';

export const CODE_LENGTH = 6;

/** Numbered as shown to the driver: "step 1 of 2". */
export enum EmailStep {
  Address = 1,
  Code = 2,
}
const RESEND_SECONDS = 30;

export function useEmailAuthScreen() {
  const { t: translate } = useTranslation();
  const [step, setStep] = useState(EmailStep.Address);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useCountdown();
  const codeInput = useRef<TextInput>(null);

  const send = async () => {
    if (!EMAIL_RE.test(email.trim())) {
      setEmailError(translate('auth.errors.email'));
      return;
    }
    setEmailError(null);
    setBusy(true);
    setError(null);
    try {
      await sendEmailCode(email);
      setStep(EmailStep.Code);
      setCode('');
      setResendIn(RESEND_SECONDS);
      setTimeout(() => codeInput.current?.focus(), 300);
    } catch (requestError) {
      setError(translate(authErrorKey(requestError)));
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
    } catch (requestError) {
      setError(translate(authErrorKey(requestError)));
      setCode('');
      setBusy(false);
    }
  };

  return {
    step,
    back: () => {
      setStep(EmailStep.Address);
      setError(null);
    },
    email,
    setEmail,
    emailError,
    code,
    codeInput,
    focusCode: () => codeInput.current?.focus(),
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
