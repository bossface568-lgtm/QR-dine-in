import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '@qrdine/shared';
import { Button, Avatar } from '@qrdine/ui';
import {
  LayoutDashboard,
  Store,
  MapPin,
  FolderTree,
  UtensilsCrossed,
  Grid3X3,
  QrCode,
  Flame,
  ShoppingBag,
  Users2,
  Tag,
  Percent,
  TrendingUp,
  BrainCircuit,
  Users,
  CreditCard,
  Settings,
  Printer,
  LogOut,
  Bell,
  Search,
  ChevronDown,
  Menu as MenuIcon,
  X
} from 'lucide-react';

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, label, active, onClick }) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
        active
          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
      )}
    >
      <div className={cn(
        'flex items-center justify-center p-1 rounded-lg',
        active ? 'text-white' : 'text-slate-400'
      )}>
        {icon}
      </div>
      <span>{label}</span>
    </Link>
  );
};

export const DashboardLayout: React.FC = () => {
  const { user, restaurant, branches, currentBranch, setCurrentBranchId, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [branchDropdownOpen, setBranchDropdownOpen] = useState(false);

  const links = [
    { to: '/', icon: <LayoutDashboard className="w-4 h-4" />, label: 'Dashboard' },
    { to: '/restaurant', icon: <Store className="w-4 h-4" />, label: 'Restaurant' },
    { to: '/branches', icon: <MapPin className="w-4 h-4" />, label: 'Branches' },
    { to: '/categories', icon: <FolderTree className="w-4 h-4" />, label: 'Categories' },
    { to: '/menu', icon: <UtensilsCrossed className="w-4 h-4" />, label: 'Menu Manager' },
    { to: '/tables', icon: <Grid3X3 className="w-4 h-4" />, label: 'Tables' },
    { to: '/qr-codes', icon: <QrCode className="w-4 h-4" />, label: 'QR Codes' },
    { to: '/kitchen', icon: <Flame className="w-4 h-4" />, label: 'Kitchen (KDS)' },
    { to: '/orders', icon: <ShoppingBag className="w-4 h-4" />, label: 'Orders' },
    { to: '/customers', icon: <Users2 className="w-4 h-4" />, label: 'Customers' },
    { to: '/offers', icon: <Tag className="w-4 h-4" />, label: 'Offers' },
    { to: '/coupons', icon: <Percent className="w-4 h-4" />, label: 'Coupons' },
    { to: '/analytics', icon: <TrendingUp className="w-4 h-4" />, label: 'Analytics' },
    { to: '/ai', icon: <BrainCircuit className="w-4 h-4" />, label: 'AI Insights' },
    { to: '/staff', icon: <Users className="w-4 h-4" />, label: 'Staff' },
    { to: '/subscription', icon: <CreditCard className="w-4 h-4" />, label: 'Subscription' },
    { to: '/printer', icon: <Printer className="w-4 h-4" />, label: 'Printer Setup' },
    { to: '/settings', icon: <Settings className="w-4 h-4" />, label: 'Settings' }
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Persistent Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 border-r border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex flex-col justify-between p-4 transition-transform duration-300 lg:translate-x-0 lg:static lg:h-full lg:flex-shrink-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col gap-5 overflow-y-auto max-h-[80vh] scrollbar-thin scrollbar-thumb-slate-800 pr-1">
          {/* Logo Brand Header */}
          <div className="flex items-center justify-between px-2 py-1 flex-shrink-0">
            <Link to="/" className="flex items-center gap-2.5 font-bold text-lg text-slate-100">
              <span className="p-2 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/25">
                <UtensilsCrossed className="w-5 h-5" />
              </span>
              <span className="tracking-tight">
                QR Dine <span className="text-orange-500 font-semibold">OS</span>
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <SidebarLink
                key={link.to}
                to={link.to}
                icon={link.icon}
                label={link.label}
                active={
                  link.to === '/' 
                    ? location.pathname === '/' 
                    : location.pathname.startsWith(link.to)
                }
                onClick={() => setSidebarOpen(false)}
              />
            ))}
          </nav>
        </div>

        {/* Footer Area with Profile and Logout */}
        <div className="flex flex-col gap-3.5 border-t border-slate-800/60 pt-4 flex-shrink-0">
          {user && (
            <div className="flex items-center gap-3 px-2">
              <Avatar name={user.name || user.email} size="sm" />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-slate-200 truncate">{user.name || 'Owner'}</span>
                <span className="text-xs text-slate-500 truncate">{user.email}</span>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            leftIcon={<LogOut className="w-4 h-4" />}
            className="w-full justify-start text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 border-0"
          >
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Panel Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/60"
            >
              <MenuIcon className="w-6 h-6" />
            </button>

            {/* Restaurant Profile Display */}
            <div className="flex items-center gap-3">
              {restaurant?.logo_url ? (
                <div className="w-8 h-8 rounded-lg overflow-hidden border border-slate-800 bg-slate-900 flex items-center justify-center flex-shrink-0">
                  <img src={restaurant.logo_url} alt="Logo" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg border border-slate-800 bg-slate-900/60 flex items-center justify-center flex-shrink-0">
                  <Store className="w-4 h-4 text-orange-500" />
                </div>
              )}
              <span className="font-bold text-slate-200 text-sm hidden sm:inline tracking-tight">
                {restaurant?.name || 'Restaurant Console'}
              </span>
            </div>

            {/* Branch Selector Dropdown */}
            {branches.length > 0 && (
              <div className="relative ml-2">
                <button
                  onClick={() => setBranchDropdownOpen(!branchDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800/80 text-xs font-semibold text-slate-300 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-orange-500" />
                  <span className="max-w-[120px] truncate">{currentBranch?.name || 'Select Branch'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {branchDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setBranchDropdownOpen(false)} />
                    <div className="absolute left-0 mt-2 w-56 rounded-xl border border-slate-800 bg-slate-900 shadow-2xl py-1.5 z-50">
                      <div className="flex items-center justify-between px-3 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <span>Operational Outlets</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">{branches.length}</span>
                      </div>
                      <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 my-1">
                        {branches.map((b) => (
                          <button
                            key={b.id}
                            onClick={() => {
                              setCurrentBranchId(b.id);
                              setBranchDropdownOpen(false);
                            }}
                            className={cn(
                              'w-full text-left px-3 py-2 text-xs font-medium transition-colors flex items-center justify-between',
                              b.id === currentBranch?.id
                                ? 'bg-orange-500/10 text-orange-400'
                                : 'text-slate-300 hover:bg-slate-800/60'
                            )}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${b.is_active ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                              <span className="truncate">{b.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {b.is_default && <span className="text-[10px] font-bold text-amber-400">HQ</span>}
                              {b.id === currentBranch?.id && (
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className="border-t border-slate-800/80 pt-1 mt-1 px-1">
                        <Link
                          to="/branches"
                          onClick={() => setBranchDropdownOpen(false)}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-orange-400 hover:bg-orange-500/10 transition-colors"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Manage All Branches</span>
                        </Link>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Search Placeholder */}
            <div className="relative hidden md:block w-48 lg:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                disabled
                placeholder="Search console... (Alt+/)"
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950/40 text-xs text-slate-400 cursor-not-allowed"
              />
            </div>

            {/* Notification Bell (placeholder) */}
            <button className="relative p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/40">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-500 animate-pulse-soft" />
            </button>

            {/* System Status online indicator */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800/80">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse-soft" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">
                Live
              </span>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950/20">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default DashboardLayout;
