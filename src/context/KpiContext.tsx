import { createContext, useContext, type ReactNode } from 'react';
import { useKpiStore, type KpiStoreType } from '../store/useKpiStore';

const KpiContext = createContext<KpiStoreType | null>(null);

export function KpiProvider({ children }: { children: ReactNode }) {
  const store = useKpiStore();
  return <KpiContext.Provider value={store}>{children}</KpiContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useKpi() {
  const ctx = useContext(KpiContext);
  if (!ctx) throw new Error('useKpi must be used within KpiProvider');
  return ctx;
}
