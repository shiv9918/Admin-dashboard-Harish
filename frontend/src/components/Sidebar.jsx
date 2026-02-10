import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Image, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const Sidebar = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const { logout, user } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: FileText, label: 'Pages', path: '/admin/pages' },
    { icon: Image, label: 'Media', path: '/admin/media' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-surface/50 backdrop-blur-xl border-r border-border transition-all duration-300 z-40 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-border/40">
          <h1
            className={`font-bold text-xl text-primary transition-all ${
              collapsed ? 'text-center' : ''
            }`}
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            {collapsed ? 'CMS' : 'Content Hub'}
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                data-testid={`sidebar-${item.label.toLowerCase()}`}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 ${
                  isActive
                    ? 'bg-accent text-accent-foreground shadow-sm'
                    : 'text-muted hover:bg-secondary hover:text-secondary-foreground'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <Icon size={20} strokeWidth={1.5} />
                {!collapsed && (
                  <span className="font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/40">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-semibold">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary truncate">{user?.email}</p>
                <p className="text-xs text-muted capitalize">{user?.role || 'Editor'}</p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            data-testid="logout-button"
            className={`flex items-center gap-3 px-4 py-2 w-full rounded-md text-destructive hover:bg-destructive/10 transition-all ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut size={18} />
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};
