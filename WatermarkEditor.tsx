import { create } from 'zustand';

interface AppState {
  isMenuOpen: boolean;
  theme: 'dark' | 'light';
  searchQuery: string;
  setMenuOpen: (open: boolean) => void;
  toggleTheme: () => void;
  setSearchQuery: (query: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isMenuOpen: false,
  theme: 'dark',
  searchQuery: '',
  setMenuOpen: (open) => set({ isMenuOpen: open }),
  toggleTheme: () => set((state) => ({ 
    theme: state.theme === 'dark' ? 'light' : 'dark' 
  })),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
