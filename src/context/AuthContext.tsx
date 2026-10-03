import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types/models';
import {
  createOrUpdateUser,
  getActiveUserId,
  getAllUsers,
  getUserById,
  initializeDatabase,
  setActiveUserId,
  subscribeToDatabase,
} from '../services/db';

interface AuthContextType {
  currentUser: User | null;
  allUsers: User[];
  loginWithEmail: (email: string, name?: string) => Promise<User>;
  registerWithEmail: (name: string, email: string) => Promise<User>;
  loginWithGoogle: () => Promise<User>;
  switchUser: (userId: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUsers = () => {
    const users = getAllUsers();
    setAllUsers(users);
    const activeId = getActiveUserId();
    const user = getUserById(activeId) || users[0] || null;
    setCurrentUser(user);
  };

  useEffect(() => {
    initializeDatabase();
    refreshUsers();
    setIsLoading(false);

    const unsubscribe = subscribeToDatabase(() => {
      refreshUsers();
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, name?: string): Promise<User> => {
    const trimmedEmail = email.trim().toLowerCase();
    const users = getAllUsers();
    let existing = users.find((u) => u.email.toLowerCase() === trimmedEmail);

    if (!existing) {
      // Auto-create or register
      const generatedName = name?.trim() || email.split('@')[0] || 'Gourmet Cook';
      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: generatedName,
        email: trimmedEmail,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(trimmedEmail)}`,
        createdAt: new Date().toISOString(),
      };
      existing = createOrUpdateUser(newUser);
    }

    setActiveUserId(existing.id);
    setCurrentUser(existing);
    return existing;
  };

  const registerWithEmail = async (name: string, email: string): Promise<User> => {
    const trimmedEmail = email.trim().toLowerCase();
    const users = getAllUsers();
    const existing = users.find((u) => u.email.toLowerCase() === trimmedEmail);

    if (existing) {
      setActiveUserId(existing.id);
      setCurrentUser(existing);
      return existing;
    }

    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: name.trim() || 'New Chef',
      email: trimmedEmail,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || email)}`,
      createdAt: new Date().toISOString(),
    };
    createOrUpdateUser(newUser);
    setActiveUserId(newUser.id);
    setCurrentUser(newUser);
    return newUser;
  };

  const loginWithGoogle = async (): Promise<User> => {
    // Simulated Google OAuth authorization flow with realistic profile
    const googleEmail = 'google.foodie@gmail.com';
    const users = getAllUsers();
    let user = users.find((u) => u.email === googleEmail);

    if (!user) {
      const newUser: User = {
        id: `user_google_${Date.now()}`,
        name: 'Alex Rivera (Google)',
        email: googleEmail,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80',
        createdAt: new Date().toISOString(),
      };
      user = createOrUpdateUser(newUser);
    }

    setActiveUserId(user.id);
    setCurrentUser(user);
    return user;
  };

  const switchUser = (userId: string) => {
    const user = getUserById(userId);
    if (user) {
      setActiveUserId(user.id);
      setCurrentUser(user);
    }
  };

  const logout = () => {
    // Return to default user or clear
    const users = getAllUsers();
    if (users.length > 0) {
      setActiveUserId(users[0].id);
      setCurrentUser(users[0]);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        allUsers,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        switchUser,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
