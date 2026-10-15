/* Whether someone is signed in, and their Supabase session. Everything that
   needs the user id reads it from here. Sign-in itself lives in lib/auth.ts. */

import type { Session as AuthSession } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';
import { isConfigured, supabase } from '../lib/supabase';

export enum AuthStatus {
  Loading = 'loading',
  SignedIn = 'signed-in',
  SignedOut = 'signed-out',
}

type AuthState = { status: AuthStatus; session: AuthSession | null };

const AuthContext = createContext<AuthState>({ status: AuthStatus.Loading, session: null });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(
    isConfigured
      ? { status: AuthStatus.Loading, session: null }
      : { status: AuthStatus.SignedOut, session: null },
  );

  useEffect(() => {
    if (!isConfigured) return;
    let live = true;
    void supabase.auth
      .getSession()
      .then(({ data }) => live && setState({ status: data.session ? AuthStatus.SignedIn : AuthStatus.SignedOut, session: data.session }))
      .catch(() => live && setState({ status: AuthStatus.SignedOut, session: null }));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (live) setState({ status: session ? AuthStatus.SignedIn : AuthStatus.SignedOut, session });
    });
    return () => {
      live = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
