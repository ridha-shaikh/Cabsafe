import { create } from 'zustand';
import { UserRole } from '../types/enums';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  } | null;
  login: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false, // Start false to force login screen
  user: null,
  login: () => set({ 
    isAuthenticated: true, 
    user: {
      id: 'USR-ADM-01',
      name: 'System Administrator',
      email: 'admin@cabsafe.com',
      role: UserRole.FLEET_MANAGER
    }
  }),
  logout: () => set({ isAuthenticated: false, user: null })
}));
