import React from 'react';
import {
  LayoutDashboard,
  Package,
  Globe,
  RefreshCw,
  FileText,
  ShoppingBag,
  MessageSquare,
  Users,
  FileBarChart,
  UserCircle,
  LogOut,
  X
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen = false, onClose }) => {
  const { user, logout, t } = useProject();

  // Define all possible menu items
  const allMenuItems = [
    { id: 'dashboard', label: t('sidebar.dashboard'), icon: LayoutDashboard, allowed: ['ALL'] },
    { id: 'inventory', label: t('sidebar.inventory'), icon: Package, allowed: ['ALL'] },
    { id: 'global-stock', label: t('sidebar.globalStock'), icon: Globe, allowed: ['ALL'] },
    { id: 'circular', label: t('sidebar.circular'), icon: RefreshCw, allowed: ['ALL'] },
    { id: 'expenses', label: t('sidebar.expenses'), icon: FileText, allowed: ['ALL'] },
    { id: 'buyback', label: t('sidebar.buyback'), icon: ShoppingBag, allowed: ['ALL'] },
    { id: 'social', label: t('sidebar.social'), icon: MessageSquare, allowed: ['ALL'] },
    { id: 'team', label: t('sidebar.team'), icon: Users, allowed: ['ALL'] },
    { id: 'report', label: t('sidebar.report'), icon: FileBarChart, allowed: ['PRODUCTION', 'Régie'] },
  ];

  // Filter based on user role
  const menuItems = allMenuItems.filter(item => {
    if (item.allowed.includes('ALL')) return true;
    if (user?.department === 'PRODUCTION' && item.allowed.includes('PRODUCTION')) return true;
    if (user?.department === 'Régie' && item.allowed.includes('Régie')) return true;
    return false;
  });

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-cinema-800 border-r border-cinema-700 flex flex-col transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between border-b border-cinema-700">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Logo" className="h-14 w-auto object-contain" />
            <h1 className="text-xl font-bold text-white tracking-tight">CinéStock</h1>
          </div>
          <button
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                  ? 'bg-gradient-to-r from-eco-600 to-eco-500 text-white shadow-lg shadow-eco-900/20'
                  : 'text-slate-400 hover:bg-cinema-700 hover:text-white'
                  }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-cinema-700">
          <div className="bg-cinema-800 rounded-lg p-4 text-xs text-slate-400 mb-4">
            <p className="font-semibold text-slate-200 mb-1">Statut Production</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-eco-500 animate-pulse"></span>
              Tournage en cours
            </div>
          </div>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 mb-2 ${activeTab === 'profile'
                ? 'bg-eco-600 text-white shadow-lg shadow-eco-900/20'
                : 'text-slate-400 hover:bg-cinema-700 hover:text-white'
              }`}
          >
            <UserCircle className="h-5 w-5" />
            <span className="font-medium">{t('sidebar.profile')}</span>
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">{t('sidebar.logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
};