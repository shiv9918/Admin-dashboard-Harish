import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Menu, Wifi, WifiOff } from 'lucide-react';

export const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleStatusChange = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);

    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div
        className={`transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'
          }`}
      >
        <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-md border-b border-border/40">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setCollapsed(!collapsed)}
              data-testid="toggle-sidebar-button"
              className="p-2 hover:bg-secondary rounded-md transition-colors"
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${isOnline ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              {isOnline ? (
                <>
                  <Wifi size={14} className="text-green-600" />
                  <span className="text-green-700">Online</span>
                </>
              ) : (
                <>
                  <WifiOff size={14} className="text-red-600" />
                  <span className="text-red-700">Offline (Synced locally)</span>
                </>
              )}
            </div>
          </div>
        </header>
        <main className="p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
};
