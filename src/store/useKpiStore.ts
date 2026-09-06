import { useCallback, useEffect, useState } from 'react';
import type {
  CashLineId,
  DailyEntry,
  KpiData,
  MetricId,
  SystemItem,
  WeeklyEntry,
} from '../types/kpi';
import { ALL_CASH_LINE_IDS, METRIC_DEFS, emptyKpiData, zeros12 } from '../kpi/kpiModel';
import { seedKpiData } from '../kpi/seedData';

const STORAGE_KEY = 'kpi-management-data-v1';
const DEFAULT_FY = 2026;

let dailyCounter = 1000;
let weeklyCounter = 1000;
let systemCounter = 1000;

/** 保存データが型的に欠けている場合の補完（スキーマ変更・破損対策） */
function normalize(data: Partial<KpiData>): KpiData {
  const base = emptyKpiData(data.fiscalYear ?? DEFAULT_FY);
  const merged: KpiData = { ...base, ...data } as KpiData;
  // 指標配列の長さ・欠落を補正
  merged.targets = { ...base.targets, ...(data.targets ?? {}) };
  merged.actuals = { ...base.actuals };
  for (const d of METRIC_DEFS) {
    const arr = data.actuals?.[d.id];
    merged.actuals[d.id] = Array.isArray(arr) ? [...arr, ...zeros12()].slice(0, 12) : zeros12();
  }
  merged.cash = { ...base.cash };
  for (const id of ALL_CASH_LINE_IDS) {
    const arr = data.cash?.[id];
    merged.cash[id] = Array.isArray(arr) ? [...arr, ...zeros12()].slice(0, 12) : zeros12();
  }
  merged.daily = data.daily ?? [];
  merged.weekly = data.weekly ?? [];
  merged.systems = data.systems ?? [];
  merged.directionMemo = data.directionMemo ?? '';
  merged.openingBalance = data.openingBalance ?? 0;
  return merged;
}

function loadInitial(): KpiData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return normalize(JSON.parse(raw));
  } catch {
    // 破損時はサンプルデータにフォールバック
  }
  return seedKpiData(DEFAULT_FY);
}

export function useKpiStore() {
  const [data, setData] = useState<KpiData>(loadInitial);

  // 変更のたびにlocalStorageへ保存
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // 保存不可（プライベートモード等）でもアプリは継続動作
    }
  }, [data]);

  const setFiscalYear = useCallback((year: number) => {
    setData((d) => ({ ...d, fiscalYear: year }));
  }, []);

  const setTarget = useCallback((id: MetricId, value: number) => {
    setData((d) => ({ ...d, targets: { ...d.targets, [id]: value } }));
  }, []);

  const setActual = useCallback((id: MetricId, month: number, value: number) => {
    setData((d) => {
      const arr = [...d.actuals[id]];
      arr[month] = value;
      return { ...d, actuals: { ...d.actuals, [id]: arr } };
    });
  }, []);

  const setCash = useCallback((id: CashLineId, month: number, value: number) => {
    setData((d) => {
      const arr = [...d.cash[id]];
      arr[month] = value;
      return { ...d, cash: { ...d.cash, [id]: arr } };
    });
  }, []);

  const setOpeningBalance = useCallback((value: number) => {
    setData((d) => ({ ...d, openingBalance: value }));
  }, []);

  const setDirectionMemo = useCallback((value: string) => {
    setData((d) => ({ ...d, directionMemo: value }));
  }, []);

  // 日次
  const addDaily = useCallback((entry: Omit<DailyEntry, 'id'>) => {
    setData((d) => ({ ...d, daily: [{ ...entry, id: `d${++dailyCounter}` }, ...d.daily] }));
  }, []);
  const updateDaily = useCallback((id: string, updates: Partial<DailyEntry>) => {
    setData((d) => ({ ...d, daily: d.daily.map((e) => (e.id === id ? { ...e, ...updates } : e)) }));
  }, []);
  const deleteDaily = useCallback((id: string) => {
    setData((d) => ({ ...d, daily: d.daily.filter((e) => e.id !== id) }));
  }, []);

  // 週次
  const addWeekly = useCallback((entry: Omit<WeeklyEntry, 'id'>) => {
    setData((d) => ({ ...d, weekly: [{ ...entry, id: `w${++weeklyCounter}` }, ...d.weekly] }));
  }, []);
  const updateWeekly = useCallback((id: string, updates: Partial<WeeklyEntry>) => {
    setData((d) => ({ ...d, weekly: d.weekly.map((e) => (e.id === id ? { ...e, ...updates } : e)) }));
  }, []);
  const deleteWeekly = useCallback((id: string) => {
    setData((d) => ({ ...d, weekly: d.weekly.filter((e) => e.id !== id) }));
  }, []);

  // 仕組化
  const addSystem = useCallback((item: Omit<SystemItem, 'id'>) => {
    setData((d) => ({ ...d, systems: [...d.systems, { ...item, id: `s${++systemCounter}` }] }));
  }, []);
  const updateSystem = useCallback((id: string, updates: Partial<SystemItem>) => {
    setData((d) => ({ ...d, systems: d.systems.map((e) => (e.id === id ? { ...e, ...updates } : e)) }));
  }, []);
  const deleteSystem = useCallback((id: string) => {
    setData((d) => ({ ...d, systems: d.systems.filter((e) => e.id !== id) }));
  }, []);

  const resetToSample = useCallback(() => {
    setData((d) => seedKpiData(d.fiscalYear));
  }, []);
  const clearAll = useCallback(() => {
    setData((d) => emptyKpiData(d.fiscalYear));
  }, []);

  return {
    data,
    setFiscalYear,
    setTarget,
    setActual,
    setCash,
    setOpeningBalance,
    setDirectionMemo,
    addDaily,
    updateDaily,
    deleteDaily,
    addWeekly,
    updateWeekly,
    deleteWeekly,
    addSystem,
    updateSystem,
    deleteSystem,
    resetToSample,
    clearAll,
  };
}

export type KpiStoreType = ReturnType<typeof useKpiStore>;
