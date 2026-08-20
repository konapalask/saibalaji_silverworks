import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { User } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  firebaseUser: FirebaseUser | null;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: () => Promise<User | null>;
  register: (data: any) => Promise<User>;
  updateProfile: (data: Partial<User>) => Promise<User>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Monitor Firebase Auth State Persistence & Sync with User State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // Construct or update user object with Firebase info including photoURL
        const email = fbUser.email || '';
        const name = fbUser.displayName || email.split('@')[0] || 'User';
        const photo = fbUser.photoURL || undefined;

        // Try syncing with backend auth or fallback to frontend user model
        if (localStorage.getItem('token')) {
          try {
            const res = await api.get('/auth/me');
            setUser({
              ...res.data,
              photo_url: photo || res.data.photo_url
            });
          } catch {
            // Fallback if backend API offline or unauthenticated
            setUser({
              id: Date.now(),
              email,
              full_name: name,
              photo_url: photo,
              role: 'CUSTOMER',
              is_active: true,
              created_at: new Date().toISOString()
            });
          }
        } else {
          // Firebase signed in directly (e.g. Google popup)
          try {
            const idToken = await fbUser.getIdToken();
            const res = await api.post('/auth/google', {
              idToken,
              firebase_uid: fbUser.uid,
              email,
              full_name: name,
              photo_url: photo
            });
            const { access_token, user: loggedUser } = res.data;
            localStorage.setItem('token', access_token);
            setToken(access_token);
            setUser({
              ...loggedUser,
              photo_url: photo || loggedUser.photo_url
            });
          } catch {
            // Fallback if backend is unavailable
            const fallbackUser: User = {
              id: Date.now(),
              email,
              full_name: name,
              photo_url: photo,
              role: 'CUSTOMER',
              is_active: true,
              created_at: new Date().toISOString()
            };
            setUser(fallbackUser);
          }
        }
      } else {
        // Firebase signed out
        if (token) {
          try {
            const res = await api.get('/auth/me');
            setUser(res.data);
          } catch {
            setUser(null);
            setToken(null);
            localStorage.removeItem('token');
          }
        } else {
          setUser(null);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { access_token, user: loggedUser } = res.data;
    localStorage.setItem('token', access_token);
    setToken(access_token);
    setUser(loggedUser);
    return loggedUser;
  };

  const loginWithGoogle = async (): Promise<User | null> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const idToken = await fbUser.getIdToken();
      const email = fbUser.email || '';
      const name = fbUser.displayName || (email ? email.split('@')[0] : 'User');
      const photo = fbUser.photoURL || undefined;

      let loggedUser: User;
      try {
        const res = await api.post('/auth/google', {
          idToken,
          firebase_uid: fbUser.uid,
          email,
          full_name: name,
          photo_url: photo
        });
        const { access_token, user: backendUser } = res.data;
        localStorage.setItem('token', access_token);
        setToken(access_token);
        loggedUser = { ...backendUser, photo_url: photo || backendUser.photo_url };
      } catch {
        loggedUser = {
          id: Date.now(),
          email,
          full_name: name,
          photo_url: photo,
          role: 'CUSTOMER',
          is_active: true,
          created_at: new Date().toISOString()
        };
      }

      setUser(loggedUser);
      return loggedUser;
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        console.log('Google Sign-In popup closed by user');
        return null;
      }
      console.error('Firebase Google Sign-In Error:', err);
      throw err;
    }
  };

  const register = async (data: any) => {
    const res = await api.post('/auth/register', data);
    const { access_token, user: regUser } = res.data;
    localStorage.setItem('token', access_token);
    setToken(access_token);
    setUser(regUser);
    return regUser;
  };

  const updateProfile = async (data: Partial<User>) => {
    const res = await api.put('/auth/me', data);
    const updated = { ...res.data, photo_url: user?.photo_url };
    setUser(updated);
    return updated;
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.error('Error signing out of Firebase:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('sbs_user_address');
      setToken(null);
      setUser(null);
      setFirebaseUser(null);
    }
  };

  const isAdmin = Boolean(user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'));

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      firebaseUser, 
      login, 
      loginWithGoogle, 
      register, 
      updateProfile, 
      logout, 
      isLoading, 
      isAdmin 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
