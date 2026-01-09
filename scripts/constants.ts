export interface User {
  name: string;
  token: string;
  lat: number;
  lng: number;
}

export const USERS: User[] = [
  {
    name: 'Long',
    token: '90262|VlYfVhFstPX1bcaKWwz1hUvIJQbvTDjgotqQIiCb',
    lat: 20.97148857955816,
    lng: 105.85263257121294,
  },  
];

export const API_URL = 'https://d14znnyip8zkld.cloudfront.net/api/check_in_out/reg';
export const TIMEZONE = 'Asia/Ho_Chi_Minh';

