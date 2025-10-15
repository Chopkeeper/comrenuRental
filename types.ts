export interface User {
  id: string;
  name:string;
  password?: string;
  role: 'admin' | 'user';
}

export interface Computer {
  id: string;
  assetNumber: string;
  name: string;
  imageUrl: string;
  purchaseYear: number;
  description: string;
}

export interface Booking {
  id: string;
  computerId: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'confirmed';
  reason: string;
}