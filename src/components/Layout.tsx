import { NavLink, Outlet } from 'react-router-dom';
import {
  Users,
  ClipboardList,
  BarChart2,
  Settings,
  Star,
  Target,
  Wallet,
  CalendarDays,
  CalendarRange,
  Boxes,
  LayoutDashboard,
} from 'lucide-react';

const hrNav = [
  { to: '/', label: 'ダッシュボード', icon: BarChart2, end: true },
  { to: '/employees', label: '従業員管理', icon: Users },
  { to: '/evaluations', label: '評価管理', icon: ClipboardList },
  { to: '/criteria', label: '評価項目', icon: Star },
  { to: '/settings', label: '設定', icon: Settings },
];

const kpiNav = [
  { to: '/kpi', label: '経営ダッシュボード', icon: LayoutDashboard, end: true },
  { to: '/kpi/targets', label: 'KPI目標・実績', icon: Target },
  { to: '/kpi/daily', label: '日次活動記録', icon: CalendarDays },
  { to: '/kpi/weekly', label: '週次進捗レビュー', icon: CalendarRange },
  { to: '/kpi/cashflow', label: '資金繰り表', icon: Wallet },
  { to: '/kpi/systemize', label: '仕組化チェック', icon: Boxes },
];

export function Layout() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <ClipboardList size={24} />
            <span>経営管理システム</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-section-label">人事評価</div>
          {hrNav.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
          <div className="nav-section-label">KPI経営管理</div>
          {kpiNav.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="current-user">
            <div className="avatar avatar-sm">管</div>
            <div className="user-info">
              <div className="user-name">管理者</div>
              <div className="user-role">システム管理者</div>
            </div>
          </div>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
