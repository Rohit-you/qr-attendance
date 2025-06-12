
import { Database } from '@/integrations/supabase/types';
import { Session } from '@supabase/supabase-js';

export type User = Database['public']['Tables']['users']['Row'];

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, userData: { name: string; role: 'student' | 'faculty' | 'hod'; prn?: string; department?: string }) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

export interface SignUpData {
  name: string;
  role: 'student' | 'faculty' | 'hod';
  prn?: string;
  department?: string;
}
