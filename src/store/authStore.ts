import { create } from 'zustand';
import { UserRole } from '../types/enums';
import { signOutCognito } from '../services/cognitoService';

const SESSION_STORAGE_KEY = 'cabsafe_auth_session';

const getInitialSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.email) {
        const savedName = localStorage.getItem(
          `cabsafe_username_${parsed.email.toLowerCase()}`
        );
        const resolvedName =
          savedName || parsed.name || parsed.email.split('@')[0].toUpperCase();

        return {
          isAuthenticated: true,
          user: {
            id: parsed.id || 'USR-COGNITO-01',
            name: resolvedName,
            email: parsed.email,
            role: parsed.role || UserRole.FLEET_MANAGER,
          },
          idToken: parsed.idToken || null,
          accessToken: parsed.accessToken || null,
        };
      }
    }
  } catch (e) {
    console.error('Failed to restore auth session from localStorage:', e);
  }
  return {
    isAuthenticated: false,
    user: null,
    idToken: null,
    accessToken: null,
  };
};

interface AuthState {
  isAuthenticated: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  } | null;
  idToken: string | null;
  accessToken: string | null;
  login: (
    email?: string,
    idToken?: string,
    accessToken?: string,
    customName?: string
  ) => void;
  updateUserName: (newName: string) => void;
  logout: () => void;
}

const initialSession = getInitialSession();

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: initialSession.isAuthenticated,
  user: initialSession.user,
  idToken: initialSession.idToken,
  accessToken: initialSession.accessToken,

  login: (
    email = 'user@cabsafe.com',
    idToken = '',
    accessToken = '',
    customName = ''
  ) => {
    const savedName = localStorage.getItem(
      `cabsafe_username_${email.toLowerCase()}`
    );
    const resolvedName =
      savedName || customName || email.split('@')[0].toUpperCase();

    const userData = {
      id: 'USR-COGNITO-01',
      name: resolvedName,
      email: email,
      role: UserRole.FLEET_MANAGER,
    };

    try {
      localStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify({
          email,
          name: resolvedName,
          idToken,
          accessToken,
          role: UserRole.FLEET_MANAGER,
        })
      );
    } catch (e) {
      console.warn('Failed to persist session:', e);
    }

    set({
      isAuthenticated: true,
      idToken: idToken || null,
      accessToken: accessToken || null,
      user: userData,
    });
  },

  updateUserName: (newName: string) => {
    set((state) => {
      if (!state.user) return state;
      const trimmed = newName.trim();
      localStorage.setItem(
        `cabsafe_username_${state.user.email.toLowerCase()}`,
        trimmed
      );

      try {
        const raw = localStorage.getItem(SESSION_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          parsed.name = trimmed;
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(parsed));
        }
      } catch (e) {
        console.warn('Failed to update session username:', e);
      }

      return {
        ...state,
        user: {
          ...state.user,
          name: trimmed,
        },
      };
    });
  },

  logout: () => {
    signOutCognito();
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {}
    set({
      isAuthenticated: false,
      user: null,
      idToken: null,
      accessToken: null,
    });
  },
}));
