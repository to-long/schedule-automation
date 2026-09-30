export interface User {
  name: 'Long' | 'Nam';
  /** Primary token used first; refreshed via /login (email+password) if it dies. */
  token: string;
  email: string;
  password: string;
  lat: number;
  lng: number;
  /** Optional DD/MM/YYYY. After this date the user is no longer checked in/out. */
  lastWorkingDay?: string;
}

export type ActionType = 'in' | 'out';
