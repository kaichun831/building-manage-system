export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  unit: string;
  role: 'resident' | 'admin';
  createdAt: Date;
}

export interface Issue {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'in-progress' | 'resolved';
  createdAt: Date;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

export interface Chairman {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
}

export interface Meeting {
  id: string;
  title: string;
  date: Date;
  agenda: string;
  minutes: string;
  attendees: string[];
}

export interface FinanceRecord {
  id: string;
  date: Date;
  category: string;
  amount: number;
  description: string;
  receipt?: string;
  voided?: boolean;
  voidReason?: string;
  voidedAt?: Date;
}
