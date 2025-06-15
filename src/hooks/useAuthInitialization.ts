import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { User } from '@/types/auth';
import { authService } from '@/services/authService';
import { supabaseAttendanceService } from '@/services/SupabaseAttendanceService';

export const useAuthInitialization = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    try {
      const userProfile = await supabaseAttendanceService.getCurrentUser();
      console.log('User profile loaded:', userProfile?.email || 'No profile');
      return userProfile;
    } catch (error) {
      console.log('No user profile found, will create on login');
      return null;
    }
  };

  // Helper: for students, update role/prn if record is incorrect
  const maybeFixStudentProfile = async (userProfile: User | null, session: Session) => {
    if (!userProfile) return null;
    const email = session.user.email!;
    const isStudent =
      email.startsWith('student') && email.endsWith('@college.edu');
    if (!isStudent) return userProfile;

    const prn = email.replace('student', '').split('@')[0];
    // Only update if role/prn are wrong or missing
    if (
      userProfile.role !== 'student' ||
      userProfile.prn !== prn
    ) {
      try {
        console.log(
          `Fixing student profile for ${email}: role=${userProfile.role}=>student, prn=${userProfile.prn}=>${prn}`
        );
        // Small patch: update role/prn only, keep other fields as is.
        // (If department will be used, you can add it as well.)
        const { data, error } = await supabaseAttendanceService.updateUser(userProfile.id, {
          role: 'student',
          prn,
        });
        if (!error && data) {
          return data;
        } else {
          console.error("Failed to patch student profile", error);
        }
      } catch (err) {
        console.error("Error patching student profile", err);
      }
    }
    return userProfile;
  };

  const createUserProfile = async (session: Session) => {
    try {
      const isStudent =
        session.user.email?.startsWith('student') &&
        session.user.email?.endsWith('@college.edu');
      const newUser = await supabaseAttendanceService.createUser({
        id: session.user.id,
        email: session.user.email!,
        name: session.user.email?.split('@')[0] || 'User',
        role: isStudent ? 'student' : 'faculty',
        prn: isStudent ? session.user.email?.replace('student', '').split('@')[0] : undefined,
      });
      console.log('Created new user profile:', newUser?.email);
      return newUser;
    } catch (createError) {
      console.error('Error creating user profile:', createError);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        
        // Get initial session
        const initialSession = await authService.getCurrentSession();
        console.log('Initial session:', initialSession?.user?.id || 'No session');
        
        if (mounted) {
          setSession(initialSession);
          
          if (initialSession?.user) {
            let userProfile = await fetchUserProfile(initialSession.user.id);
            // ----- FIX: Patch wrong existing student records -----
            userProfile = await maybeFixStudentProfile(userProfile, initialSession);

            if (mounted) {
              setUser(userProfile);
            }
          }
          
          // Set loading to false after initial check
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session?.user?.id || 'No user');
        setSession(session);
        
        if (session?.user) {
          // Use setTimeout to prevent potential deadlocks
          setTimeout(async () => {
            if (!mounted) return;
            
            let userProfile = await fetchUserProfile(session.user.id);

            // ----- FIX: Patch wrong existing student records -----
            userProfile = await maybeFixStudentProfile(userProfile, session);

            if (!userProfile) {
              console.log('Creating user profile after auth change...');
              userProfile = await createUserProfile(session);
            } else {
              console.log('User profile fetched after auth change:', userProfile?.email);
            }
            
            if (mounted) {
              setUser(userProfile);
            }
          }, 0);
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

  return { user, session, isLoading, setUser, setSession };
};
