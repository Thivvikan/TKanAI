import { create } from 'zustand';
import { User } from '../types/entities';
import { UserRole, ROLE_DEFINITIONS } from '../types/roles';
import { SEED_USERS } from '../db/seedData';

interface SessionState {
  currentUser: User;
  currentRole: UserRole;
  allUsers: User[];
  setUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  switchUserById: (userId: string) => void;
}

const DEFAULT_USER = SEED_USERS[1]; // Thivvikan (Project Manager)

export const useSessionStore = create<SessionState>((set) => ({
  currentUser: DEFAULT_USER,
  currentRole: DEFAULT_USER.role,
  allUsers: SEED_USERS,
  setUser: (user) => set({ currentUser: user, currentRole: user.role }),
  switchRole: (role) => {
    const matchingUser = SEED_USERS.find((u) => u.role === role) || DEFAULT_USER;
    set({ currentUser: matchingUser, currentRole: role });
  },
  switchUserById: (userId) => {
    const user = SEED_USERS.find((u) => u.id === userId);
    if (user) {
      set({ currentUser: user, currentRole: user.role });
    }
  },
}));
