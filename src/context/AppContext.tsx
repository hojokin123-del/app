import { createContext, useContext, type ReactNode } from 'react';
import { useStore, type StoreType } from '../store/useStore';

const AppContext = createContext<StoreType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const store = useStore();
  return <AppContext.Provider value={store}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
