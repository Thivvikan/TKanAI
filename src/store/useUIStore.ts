import { create } from 'zustand';

interface UIState {
  theme: 'dark' | 'light';
  isSidebarCollapsed: boolean;
  isAIAssistantOpen: boolean;
  isSearchModalOpen: boolean;
  isResearchMode: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleSidebar: () => void;
  toggleAIAssistant: () => void;
  setAIAssistantOpen: (open: boolean) => void;
  setSearchModalOpen: (open: boolean) => void;
  toggleResearchMode: () => void;
}

const getInitialTheme = (): 'dark' | 'light' => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('ai_ecosystem_theme');
    if (saved === 'light' || saved === 'dark') return saved;
  }
  return 'dark'; // Default to sleek dark mode
};

export const useUIStore = create<UIState>((set, get) => ({
  theme: getInitialTheme(),
  isSidebarCollapsed: false,
  isAIAssistantOpen: false,
  isSearchModalOpen: false,
  isResearchMode: true, // Default to true so research telemetry and AI confidence indicators are prominently visible
  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('ai_ecosystem_theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme: next });
  },
  setTheme: (theme) => {
    localStorage.setItem('ai_ecosystem_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    set({ theme });
  },
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  toggleAIAssistant: () => set((state) => ({ isAIAssistantOpen: !state.isAIAssistantOpen })),
  setAIAssistantOpen: (open) => set({ isAIAssistantOpen: open }),
  setSearchModalOpen: (open) => set({ isSearchModalOpen: open }),
  toggleResearchMode: () => set((state) => ({ isResearchMode: !state.isResearchMode })),
}));
