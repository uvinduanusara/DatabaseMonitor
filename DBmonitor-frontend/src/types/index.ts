export interface User {
  name: string;
  email: string;
  picture: string;
}

export interface Metric {
  db_id: number;
  name: string;
  cpu: number;
  memory: number;
  time: string;
}

export interface AuthState {
  user: User | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}