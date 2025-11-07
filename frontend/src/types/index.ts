export interface Shoe {
  id: number;
  brand: string;
  model: string;
  type: string;
  reviews?: Review[];
}

export interface Review {
  id: number;
  comment: string;
  rating: number;
  pace?: number; // legacy
  fit: 'SMALL' | 'TRUE_TO_SIZE' | 'BIG';
  cushion: 'SOFT' | 'BALANCED' | 'FIRM';
  stability: 'NEUTRAL' | 'MODERATE_SUPPORT' | 'HIGH_SUPPORT';
  mileage?: number;
  paceMinutes?: number;
  paceSeconds?: number;
  shoe?: Shoe;
  user?: User;
}

export interface User {
  id: number;
  name: string;
  weight: number;
  pace: string;
}
