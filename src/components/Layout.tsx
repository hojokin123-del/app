import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Wallet, Gauge, Users, ListChecks, Database, TrendingUp, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useSales } from '../store/salesStore';

const navItems = [
  { to: '/', label: 'ダッシュボード', icon: LayoutDashboard, end: true },
  { to: '/budget', label: '予実管理', icon: Wallet },
  { to: '/kpi', label: 'KPI管理', icon: Gauge },
  { to: '/initiatives', label: '施策管理', icon: ListChecks },
  { to: '/reps', label: '担当者', icon: Users },
  { to: '/data', label: 'データ管理', icon: Database },
];

export function Layout() {
  const { saveStatus, lastSavedAt } = useSales();
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <TrendingUp size={24} />
            <span>営業管理システム</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <NavLink to="/data" className={`save-indicator ${saveStatus}`}>
            {saveStatus === 'saved' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
            <span>
              {saveStatus === 'saved' ? '自動保存済み' : '保存に失敗しました'}
              {saveStatus === 'saved' && lastSavedAt && <small>{new Date(lastSavedAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</small>}
            </span>
          </NavLink>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
