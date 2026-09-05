import { useState, useCallback } from 'react';
import { agencies as initialAgencies, sales as initialSales, settings as initialSettings } from '../data/mockData';
import type { Agency, Sale, PaymentStatement, AppSettings } from '../types';
import { computeMonthlyFees, buildStatement } from '../lib/feeCalc';

let agencyIdCounter = 1000;
let saleIdCounter = 1000;
let statementIdCounter = 1000;

export function useStore() {
  const [agencies, setAgencies] = useState<Agency[]>(initialAgencies);
  const [sales, setSales] = useState<Sale[]>(initialSales);
  const [statements, setStatements] = useState<PaymentStatement[]>([]);
  const [settings, setSettings] = useState<AppSettings>(initialSettings);

  // ===== 代理店マスター =====
  const addAgency = useCallback((data: Omit<Agency, 'id'>) => {
    const id = `ag_${++agencyIdCounter}`;
    setAgencies(prev => [...prev, { ...data, id }]);
    return id;
  }, []);

  const updateAgency = useCallback((id: string, updates: Partial<Agency>) => {
    setAgencies(prev => prev.map(a => (a.id === id ? { ...a, ...updates } : a)));
  }, []);

  const deleteAgency = useCallback((id: string) => {
    setAgencies(prev => prev.filter(a => a.id !== id));
  }, []);

  // ===== 売上 =====
  const addSale = useCallback((data: Omit<Sale, 'id'>) => {
    const id = `s_${++saleIdCounter}`;
    setSales(prev => [...prev, { ...data, id }]);
    return id;
  }, []);

  const addSales = useCallback((items: Omit<Sale, 'id'>[]) => {
    setSales(prev => [
      ...prev,
      ...items.map(item => ({ ...item, id: `s_${++saleIdCounter}` })),
    ]);
  }, []);

  const updateSale = useCallback((id: string, updates: Partial<Sale>) => {
    setSales(prev => prev.map(s => (s.id === id ? { ...s, ...updates } : s)));
  }, []);

  const deleteSale = useCallback((id: string) => {
    setSales(prev => prev.filter(s => s.id !== id));
  }, []);

  // ===== 支払明細書 =====
  /** 指定月のフィーを計算し、代理店ごとの支払明細書を生成（既存の同月分は置換） */
  const generateStatements = useCallback((month: string) => {
    setStatements(prev => {
      const kept = prev.filter(st => st.month !== month);
      const fees = computeMonthlyFees(agencies, sales, month);
      const generated = fees
        .filter(f => f.subtotal > 0)
        .map(f => buildStatement(f, month, settings, ++statementIdCounter));
      return [...kept, ...generated];
    });
  }, [agencies, sales, settings]);

  const confirmStatement = useCallback((id: string) => {
    setStatements(prev =>
      prev.map(st =>
        st.id === id ? { ...st, status: 'confirmed', confirmedAt: new Date().toISOString() } : st,
      ),
    );
  }, []);

  const deleteStatement = useCallback((id: string) => {
    setStatements(prev => prev.filter(st => st.id !== id));
  }, []);

  // ===== 設定 =====
  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    agencies,
    sales,
    statements,
    settings,
    addAgency,
    updateAgency,
    deleteAgency,
    addSale,
    addSales,
    updateSale,
    deleteSale,
    generateStatements,
    confirmStatement,
    deleteStatement,
    updateSettings,
  };
}

export type StoreType = ReturnType<typeof useStore>;
