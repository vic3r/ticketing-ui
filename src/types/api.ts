export interface Event {
  id: string;
  organizerId: string;
  venueId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  startDate: string;
  endDate: string;
  status: string;
  isPublished: boolean | null;
  createdAt: string;
  updatedAt: string;
}

export interface EventSeat {
  id: string;
  section: string;
  row: string | null;
  seatNumber: number | null;
  status: 'available' | 'reserved' | 'sold';
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CheckoutResponse {
  orderId: string;
  clientSecret: string | null;
}
