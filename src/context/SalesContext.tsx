import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { initiatives as initialInitiatives, monthlyRecords as initialRecords, salesReps } from '../data/salesMockData';
import type { Initiative, KpiKey, MonthlyRecord, SalesRep } from '../types/sales';

let initiativeIdCounter = 100;

function useSalesStore() {
  const [reps] = useState<SalesRep[]>(salesReps);
  const [records, setRecords] = useState<MonthlyRecord[]>(initialRecords);
  const [initiatives, setInitiatives] = useState<Initiative[]>(initialInitiatives);

  const updateRecord = useCallback(
    (repId: string, month: string, field: 'budget' | 'actual' | 'forecast', value: number | null) => {
      setRecords(prev => prev.map(r => (r.repId === repId && r.month === month ? { ...r, [field]: value } : r)));
    },
    [],
  );

  const updateKpi = useCallback(
    (repId: string, month: string, key: KpiKey, field: 'target' | 'actual', value: number | null) => {
      setRecords(prev => prev.map(r => {
        if (r.repId !== repId || r.month !== month) return r;
        return { ...r, kpi: { ...r.kpi, [key]: { ...r.kpi[key], [field]: field === 'target' ? (value ?? 0) : value } } };
      }));
    },
    [],
  );

  const addInitiative = useCallback((data: Omit<Initiative, 'id'>) => {
    setInitiatives(prev => [...prev, { ...data, id: `i${++initiativeIdCounter}` }]);
  }, []);

  const updateInitiative = useCallback((id: string, updates: Partial<Initiative>) => {
    setInitiatives(prev => prev.map(i => (i.id === id ? { ...i, ...updates } : i)));
  }, []);

  const deleteInitiative = useCallback((id: string) => {
    setInitiatives(prev => prev.filter(i => i.id !== id));
  }, []);

  return { reps, records, initiatives, updateRecord, updateKpi, addInitiative, updateInitiative, deleteInitiative };
}

type SalesStore = ReturnType<typeof useSalesStore>;
const SalesContext = createContext<SalesStore | null>(null);

export function SalesProvider({ children }: { children: ReactNode }) {
  const store = useSalesStore();
  return <SalesContext.Provider value={store}>{children}</SalesContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSales() {
  const ctx = useContext(SalesContext);
  if (!ctx) throw new Error('useSales must be used within SalesProvider');
  return ctx;
}
