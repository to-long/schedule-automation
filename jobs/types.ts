export interface User {
  name: 'Long' | 'Nam';
  /** Primary token used first; refreshed via /login (email+password) if it dies. */
  token: string;
  email: string;
  password: string;
  lat: number;
  lng: number;
}

export type ActionType = 'in' | 'out';
