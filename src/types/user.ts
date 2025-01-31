export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  description: string | null;
  updated_at: string;
}

export interface UserSettings {
  user_id: string;
  currency: string;
  date_format: string;
  language: string;
  dark_mode: boolean;
  created_at?: string;
  updated_at?: string;
}
