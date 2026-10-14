/* Small timing hooks several screens need. Anything specific to one screen
   lives in that screen's own `use<Screen>.ts`. */

import { useEffect, useState } from 'react';

/** Counts down to zero once started — the "resend code in 30s" lock. */
export function useCountdown() {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    if (remaining <= 0) return;
    const timer = setTimeout(() => setRemaining((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining]);
  return [remaining, setRemaining] as const;
}

/** Clears a transient value (a toast, a "saved" flash) after a moment. */
export function useAutoClear(value: unknown, clear: () => void, delayMs = 5000) {
  useEffect(() => {
    if (!value) return;
    const timer = setTimeout(clear, delayMs);
    return () => clearTimeout(timer);
  }, [value, clear, delayMs]);
}
