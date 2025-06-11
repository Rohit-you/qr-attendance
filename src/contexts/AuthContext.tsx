
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
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        
        if (session?.user) {
          try {
            // Fetch user profile from our users table
            const userProfile = await supabaseAttendanceService.getCurrentUser();
            console.log('User profile fetched:', userProfile);
            setUser(userProfile);
          } catch (error) {
            console.error('Error fetching user profile:', error);
            // If user doesn't exist in our users table, create a basic profile
            if (session.user.email) {
              console.log('Creating user profile for:', session.user.email);
              try {
                const newUser = await supabaseAttendanceService.createUser({
                  id: session.user.id,
                  email: session.user.email,
                  name: session.user.email.split('@')[0], // Use email prefix as default name
                  role: 'faculty' // Default to faculty role
                });
                console.log('Created new user profile:', newUser);
                setUser(newUser);
              } catch (createError) {
                console.error('Error creating user profile:', createError);
                setUser(null);
              }
            } else {
              setUser(null);
            }
          }
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.id);
      setSession(session);
      if (session?.user) {
        supabaseAttendanceService.getCurrentUser().then((userProfile) => {
          console.log('Initial user profile:', userProfile);
          setUser(userProfile);
          setIsLoading(false);
        }).catch(async (error) => {
          console.error('Error fetching initial user profile:', error);
          // If user doesn't exist, create one
          if (session.user.email) {
            try {
              const newUser = await supabaseAttendanceService.createUser({
                id: session.user.id,
                email: session.user.email,
                name: session.user.email.split('@')[0],
                role: 'faculty'
              });
              setUser(newUser);
            } catch (createError) {
              console.error('Error creating initial user profile:', createError);
              setUser(null);
            }
          }
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
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

    // Create user profile in our users table
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
