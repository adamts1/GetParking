/* What the server says the driver is doing right now — the shape of
   get_active_state() — and the errors the session RPCs raise. The values
   mirror the database enums, so they cross the wire unchanged. */

import type { LatLng } from './geo';

export enum SessionKind {
  Search = 'search',
  Leave = 'leave',
}

export enum SessionStatus {
  Active = 'active',
  Matched = 'matched',
  Completed = 'completed',
  Cancelled = 'cancelled',
  Expired = 'expired',
}

export enum MatchStatus {
  Active = 'active',
  Completed = 'completed',
  Cancelled = 'cancelled',
  Expired = 'expired',
}

export enum MatchRole {
  Searcher = 'searcher',
  Leaver = 'leaver',
}

export type ServerSession = {
  id: string;
  kind: SessionKind;
  status: SessionStatus;
  expires_at: string;
  /** Leave sessions only: where the spot is. */
  handoff: LatLng | null;
};

export type ServerMatch = {
  id: string;
  status: MatchStatus;
  expires_at: string;
  role: MatchRole;
  handoff: LatLng;
};

export type ActiveState = {
  credits: number | null;
  /** The driver's latest session, open or not — null before their first. */
  session: ServerSession | null;
  match?: ServerMatch;
};

/** A session the driver is still in: waiting, or matched with someone. */
export const isOpen = (session: ServerSession | null): session is ServerSession =>
  session?.status === SessionStatus.Active || session?.status === SessionStatus.Matched;

/** Raised by the RPCs (see the migration), plus the ones the client adds. */
export enum SessionError {
  AlreadyOpen = 'session_already_open',
  NoActiveVehicle = 'no_active_vehicle',
  InsufficientCredits = 'insufficient_credits',
  NoLocation = 'no_location',
  Network = 'network',
  Unknown = 'unknown',
}

/** Codes that arrive inside an error message: the server's, and NoLocation,
    which the client raises itself before calling. */
const MESSAGE_CODES = [
  SessionError.AlreadyOpen,
  SessionError.NoActiveVehicle,
  SessionError.InsufficientCredits,
  SessionError.NoLocation,
];

export function sessionErrorOf(error: unknown): SessionError {
  const message = String((error as { message?: unknown })?.message ?? error);
  const known = MESSAGE_CODES.find((code) => message.includes(code));
  if (known) return known;
  if (/network|fetch/i.test(message)) return SessionError.Network;
  return SessionError.Unknown;
}
