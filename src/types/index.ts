export interface Counter {
  id: string;
  title: string;
  date: string;
  type: 'since' | 'until';
  visibility: 'public' | 'private';
  pubkey: string;
  createdAt: number;
  slug: string;
}

export interface CounterEvent {
  kind: 30078;
  content: string;
  tags: string[][];
  created_at: number;
  pubkey: string;
  id: string;
  sig: string;
}

export interface UserProfile {
  pubkey: string;
  name?: string;
  display_name?: string;
  about?: string;
  picture?: string;
  nip05?: string;
  lud16?: string;
  lud06?: string;
}

export interface CounterFormData {
  title: string;
  date: string;
  type: 'since' | 'until';
  visibility: 'public' | 'private';
}

export interface ZapRequest {
  amount: number;
  comment?: string;
  pubkey: string;
  eventId?: string;
}

export interface RelayConfig {
  url: string;
  read: boolean;
  write: boolean;
} 