export interface User {
  name: string;
  token: string;
  lat: number;
  lng: number;
}

export interface SlackUser {
  name: string;
  token: string;
  cookie: string;
}

export type ActionType = 'in' | 'out';
