
import { createContext, useContext, ReactNode } from 'react';
import { AuthContextType } from '@/types/auth';
import { authService } from '@/services/authService';
import { useAuthInitialization } from '@/hooks/useAuthInitialization';

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
  const { user, session, isLoading, setUser, setSession } = useAuthInitialization();

  const signUp = async (
    email: string, 
    password: string, 
    userData: { name: string; role: 'student' | 'faculty' | 'hod'; prn?: string; department?: string }
  ) => {
    return await authService.signUp(email, password, userData);
  };

  const signIn = async (email: string, password: string) => {
    return await authService.signIn(email, password);
  };

  const signOut = async () => {
    await authService.signOut();
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
