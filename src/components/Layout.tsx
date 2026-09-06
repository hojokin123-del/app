import { NavLink, Outlet } from 'react-router-dom';
import {
  Target,
  Wallet,
  CalendarDays,
  CalendarRange,
  Boxes,
  LayoutDashboard,
  LineChart,
} from 'lucide-react';

const navItems = [
  { to: '/', label: '経営ダッシュボード', icon: LayoutDashboard, end: true },
  { to: '/targets', label: 'KPI目標・実績', icon: Target },
  { to: '/daily', label: '日次活動記録', icon: CalendarDays },
  { to: '/weekly', label: '週次進捗レビュー', icon: CalendarRange },
  { to: '/cashflow', label: '資金繰り表', icon: Wallet },
  { to: '/systemize', label: '仕組化チェック', icon: Boxes },
];

export function Layout() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <LineChart size={24} />
            <span>KPI経営管理</span>
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
          <div className="current-user">
            <div className="avatar avatar-sm">管</div>
            <div className="user-info">
              <div className="user-name">管理者</div>
              <div className="user-role">経営管理</div>
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
