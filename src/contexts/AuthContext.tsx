
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { supabaseAttendanceService } from '@/services/SupabaseAttendanceService';
import { Database } from '@/integrations/supabase/types';

type User = Database['public']['Tables']['users']['Row'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, userData: { name: string; role: 'student' | 'faculty' | 'hod'; prn?: string; department?: string }) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Get current session first
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log('Initial session:', initialSession?.user?.id || 'No session');
        
        if (mounted) {
          setSession(initialSession);
          
          if (initialSession?.user) {
            try {
              const userProfile = await supabaseAttendanceService.getCurrentUser();
              console.log('User profile loaded:', userProfile?.email || 'No profile');
              if (mounted) {
                setUser(userProfile);
              }
            } catch (error) {
              console.log('No user profile found, will create on login');
              if (mounted) {
                setUser(null);
              }
            }
          }
          
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session?.user?.id || 'No user');
        setSession(session);
        
        if (session?.user) {
          try {
            const userProfile = await supabaseAttendanceService.getCurrentUser();
            console.log('User profile fetched after auth change:', userProfile?.email);
            if (mounted) {
              setUser(userProfile);
            }
          } catch (error) {
            console.log('Creating user profile after auth change...');
            try {
              const isStudent = session.user.email?.includes('@student.college.edu');
              const newUser = await supabaseAttendanceService.createUser({
                id: session.user.id,
                email: session.user.email!,
                name: session.user.email?.split('@')[0] || 'User',
                role: isStudent ? 'student' : 'faculty',
                prn: isStudent ? session.user.email?.split('@')[0] : undefined
              });
              console.log('Created new user profile:', newUser?.email);
              if (mounted) {
                setUser(newUser);
              }
            } catch (createError) {
              console.error('Error creating user profile:', createError);
              if (mounted) {
                setUser(null);
              }
            }
          }
        } else {
          if (mounted) {
            setUser(null);
          }
        }
      }
    );

    // Initialize auth
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (
    email: string, 
    password: string, 
    userData: { name: string; role: 'student' | 'faculty' | 'hod'; prn?: string; department?: string }
  ) => {
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
  };

  const signIn = async (email: string, password: string) => {
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
  };

  const signOut = async () => {
    console.log('Signing out');
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const value = {
    user,
    session,
    isLoading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
