import { useSyncExternalStore } from 'react';
import { FISCAL_MONTHS } from '../data/calendar';
import { buildSampleInitiatives, buildSampleRecords, sampleReps } from '../data/salesMockData';
import { KPI_KEYS, type Initiative, type KpiKey, type MonthlyRecord, type SalesRep } from '../types/sales';

/**
 * 営業データのストア。変更のたびにブラウザの localStorage へ自動保存する。
 * 保存先はこのブラウザ内のみ（他の端末・ブラウザとは共有されない）。
 */
const DATA_KEY = 'sales-app/data/v1';
const PREF_KEY = 'sales-app/prefs/v1';
export const ALL = 'all';

export type SalesData = {
  version: 1;
  reps: SalesRep[];
  records: MonthlyRecord[];
  initiatives: Initiative[];
};

export type SaveStatus = 'saved' | 'error';

type State = {
  data: SalesData;
  saveStatus: SaveStatus;
  lastSavedAt: string | null;
  selectedRepId: string;
};

const newId = (prefix: string) => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

function emptyRecord(repId: string, month: string): MonthlyRecord {
  return {
    repId, month, budget: 0, actual: null, forecast: null,
    kpi: Object.fromEntries(KPI_KEYS.map(k => [k, { target: 0, actual: null }])) as MonthlyRecord['kpi'],
  };
}

/** 全担当者×今年度の各月のレコードが揃うよう不足分を補う（年度が替わった場合など） */
function ensureRecords(data: SalesData): SalesData {
  const have = new Set(data.records.map(r => `${r.repId}|${r.month}`));
  const missing = data.reps.flatMap(rep =>
    FISCAL_MONTHS.filter(m => !have.has(`${rep.id}|${m}`)).map(m => emptyRecord(rep.id, m)),
  );
  return missing.length ? { ...data, records: [...data.records, ...missing] } : data;
}

function sampleData(): SalesData {
  return { version: 1, reps: sampleReps, records: buildSampleRecords(), initiatives: buildSampleInitiatives() };
}

export function isSalesData(v: unknown): v is SalesData {
  if (!v || typeof v !== 'object') return false;
  const d = v as Record<string, unknown>;
  return d.version === 1 && Array.isArray(d.reps) && Array.isArray(d.records) && Array.isArray(d.initiatives);
}

function readJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persist(data: SalesData): Pick<State, 'saveStatus' | 'lastSavedAt'> {
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
    return { saveStatus: 'saved', lastSavedAt: new Date().toISOString() };
  } catch {
    return { saveStatus: 'error', lastSavedAt: state?.lastSavedAt ?? null };
  }
}

function init(): State {
  const stored = readJson(DATA_KEY);
  const prefs = readJson(PREF_KEY) as { selectedRepId?: string } | null;
  const data = ensureRecords(isSalesData(stored) ? stored : sampleData());
  const selectedRepId = prefs?.selectedRepId && data.reps.some(r => r.id === prefs.selectedRepId) ? prefs.selectedRepId : ALL;
  return { data, selectedRepId, saveStatus: 'saved', lastSavedAt: null };
}

let state: State;
state = init();
state = { ...state, ...persist(state.data) };

const listeners = new Set<() => void>();
const emit = () => listeners.forEach(l => l());

function setData(updater: (d: SalesData) => SalesData) {
  const data = ensureRecords(updater(state.data));
  state = { ...state, data, ...persist(data) };
  emit();
}

const actions = {
  setSelectedRepId(id: string) {
    state = { ...state, selectedRepId: id };
    try { localStorage.setItem(PREF_KEY, JSON.stringify({ selectedRepId: id })); } catch { /* 表示設定のみなので無視 */ }
    emit();
  },

  updateRecord(repId: string, month: string, field: 'budget' | 'actual' | 'forecast', value: number | null) {
    setData(d => ({ ...d, records: d.records.map(r => (r.repId === repId && r.month === month ? { ...r, [field]: value } : r)) }));
  },

  updateKpi(repId: string, month: string, key: KpiKey, field: 'target' | 'actual', value: number | null) {
    setData(d => ({
      ...d,
      records: d.records.map(r => {
        if (r.repId !== repId || r.month !== month) return r;
        return { ...r, kpi: { ...r.kpi, [key]: { ...r.kpi[key], [field]: field === 'target' ? (value ?? 0) : value } } };
      }),
    }));
  },

  addInitiative(i: Omit<Initiative, 'id'>) {
    setData(d => ({ ...d, initiatives: [...d.initiatives, { ...i, id: newId('i') }] }));
  },
  updateInitiative(id: string, updates: Partial<Initiative>) {
    setData(d => ({ ...d, initiatives: d.initiatives.map(i => (i.id === id ? { ...i, ...updates, id } : i)) }));
  },
  deleteInitiative(id: string) {
    setData(d => ({ ...d, initiatives: d.initiatives.filter(i => i.id !== id) }));
  },

  addRep(rep: Omit<SalesRep, 'id'>) {
    const id = newId('r');
    setData(d => ({ ...d, reps: [...d.reps, { ...rep, id }] }));
    return id;
  },
  updateRep(id: string, updates: Partial<SalesRep>) {
    setData(d => ({ ...d, reps: d.reps.map(r => (r.id === id ? { ...r, ...updates, id } : r)) }));
  },
  /** 担当者と予実・KPIを削除。担当施策は「未割当」にする。 */
  deleteRep(id: string) {
    setData(d => ({
      ...d,
      reps: d.reps.filter(r => r.id !== id),
      records: d.records.filter(r => r.repId !== id),
      initiatives: d.initiatives.map(i => (i.ownerId === id ? { ...i, ownerId: '' } : i)),
    }));
    if (state.selectedRepId === id) actions.setSelectedRepId(ALL);
  },

  replaceAll(data: SalesData) {
    setData(() => data);
    if (!data.reps.some(r => r.id === state.selectedRepId)) actions.setSelectedRepId(ALL);
  },
  resetToSample() {
    actions.replaceAll(sampleData());
  },
  clearAll() {
    actions.replaceAll({ version: 1, reps: [], records: [], initiatives: [] });
  },
  exportJson() {
    return JSON.stringify(state.data, null, 2);
  },
};

// 別タブでの変更を反映
window.addEventListener('storage', e => {
  if (e.key !== DATA_KEY) return;
  const v = readJson(DATA_KEY);
  if (isSalesData(v)) { state = { ...state, data: ensureRecords(v) }; emit(); }
});

function subscribe(l: () => void) {
  listeners.add(l);
  return () => { listeners.delete(l); };
}

export function useSales() {
  const s = useSyncExternalStore(subscribe, () => state);
  return {
    reps: s.data.reps,
    records: s.data.records,
    initiatives: s.data.initiatives,
    selectedRepId: s.selectedRepId,
    saveStatus: s.saveStatus,
    lastSavedAt: s.lastSavedAt,
    ...actions,
  };
}
