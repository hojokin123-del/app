import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Building2, Receipt, Calculator, FileText, Settings } from 'lucide-react';

const navItems = [
  { to: '/', label: 'ダッシュボード', icon: LayoutDashboard, end: true },
  { to: '/agencies', label: '代理店マスター', icon: Building2 },
  { to: '/sales', label: '売上データ', icon: Receipt },
  { to: '/fees', label: 'フィー計算', icon: Calculator },
  { to: '/statements', label: '支払明細書', icon: FileText },
  { to: '/settings', label: '設定', icon: Settings },
];

export function Layout() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <Calculator size={24} />
            <span>代理店フィー管理</span>
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
              <div className="user-role">経理担当</div>
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
