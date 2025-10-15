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
  pace: string;
  shoe?: Shoe;
  user?: User;
}

export interface User {
  id: number;
  name: string;
  weight: number;
  pace: string;
}
