
import { supabase } from '@/integrations/supabase/client';
import { supabaseAttendanceService } from '@/services/SupabaseAttendanceService';
import { SignUpData } from '@/types/auth';

export class AuthService {
  async signUp(email: string, password: string, userData: SignUpData) {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    if (error) {
      console.error('Sign up error:', error);
      return { error };
    }

    if (data.user) {
      try {
        await supabaseAttendanceService.createUser({
          id: data.user.id,
          email,
          ...userData
        });
        console.log('User profile created during signup');
      } catch (createError) {
        console.error('Error creating user profile during signup:', createError);
      }
    }

    return { error: null };
  }

  async signIn(email: string, password: string) {
    console.log('Attempting sign in for:', email);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Sign in error:', error);
    } else {
      console.log('Sign in successful');
    }
    
    return { error };
  }

  async signOut() {
    console.log('Signing out');
    await supabase.auth.signOut();
  }

  async getCurrentSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

export const authService = new AuthService();
