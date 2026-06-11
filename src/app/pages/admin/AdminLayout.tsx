import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Megaphone, TrendingUp, LogOut,
  HardHat, Menu, X, Shield, ChevronRight, Coffee
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/ads', label: 'Advertisements', icon: Megaphone },
  { path: '/admin/boosts', label: 'Boost Requests', icon: TrendingUp },
  { path: '/admin/donations', label: 'Donations', icon: Coffee },
];

export function AdminLayout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="w-12 h-12 text-maroon mx-auto mb-3" />
          <h2 className="text-xl mb-2" style={{ fontWeight: 700 }}>Access Denied</h2>
          <p className="text-gray-500 mb-4">You must be logged in as an admin.</p>
          <Link to="/login" className="bg-maroon text-white px-5 py-2 rounded-lg text-sm" style={{ fontWeight: 600 }}>
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-maroon flex flex-col z-30 transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
            <HardHat className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-white" style={{ fontWeight: 700, fontSize: '1.1rem' }}>Labour</span>
              <span className="text-gold" style={{ fontWeight: 700, fontSize: '1.1rem' }}>X</span>
            </div>
            <span className="text-white/50 text-xs">Admin Panel</span>
          </div>
          <button
            className="ml-auto lg:hidden text-white/70 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                isActive(item.path, item.exact)
                  ? 'bg-white/15 text-white'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              }`}
              style={{ fontWeight: 500 }}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
              {isActive(item.path, item.exact) && <ChevronRight className="w-3 h-3 ml-auto" />}
            </Link>
          ))}
        </nav>

        {/* Bottom: user info + logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 mb-2">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs truncate" style={{ fontWeight: 600 }}>{currentUser.name}</p>
              <p className="text-white/50 text-xs truncate">{currentUser.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 text-sm transition-colors"
            style={{ fontWeight: 500 }}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-gray-800 text-sm" style={{ fontWeight: 600 }}>
              {navItems.find(n => isActive(n.path, n.exact))?.label || 'Admin Panel'}
            </h1>
          </div>
          <Link
            to="/"
            className="text-xs text-maroon hover:underline"
            style={{ fontWeight: 500 }}
          >
            View Site →
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
