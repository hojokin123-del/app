import { NavLink, Outlet } from 'react-router-dom';
import { Users, ClipboardList, BarChart2, Settings, Star, BookOpen } from 'lucide-react';

const navItems = [
  { to: '/', label: 'ダッシュボード', icon: BarChart2, end: true },
  { to: '/employees', label: '従業員管理', icon: Users },
  { to: '/evaluations', label: '評価管理', icon: ClipboardList },
  { to: '/criteria', label: '評価項目', icon: Star },
  { to: '/curriculum', label: 'AI研修', icon: BookOpen },
  { to: '/settings', label: '設定', icon: Settings },
];

export function Layout() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <ClipboardList size={24} />
            <span>人事評価システム</span>
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
