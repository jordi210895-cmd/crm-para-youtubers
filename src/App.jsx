import React, { useState } from 'react';
import {
  Home,
  FileText,
  Users,
  Archive,
  Lightbulb,
  BarChart2,
  Bell,
  Search,
  Menu,
  DollarSign,
  LogOut,
  Info
} from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ScriptStudio from './components/ScriptStudio';
import SponsorPortal from './components/SponsorPortal';
import AssetVault from './components/AssetVault';
import BrainstormCanvas from './components/BrainstormCanvas';
import FinanceManager from './components/FinanceManager';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import ErrorBoundary from './components/ErrorBoundary';

const NAV_ITEMS = [
  { id: 'dashboard', icon: Home, label: 'Inicio' },
  { id: 'scripts', icon: FileText, label: 'Guiones' },
  { id: 'sponsors', icon: Users, label: 'Patrocinadores' },
  { id: 'finance', icon: DollarSign, label: 'Finanzas' },
  { id: 'assets', icon: Archive, label: 'Recursos' },
  { id: 'ideas', icon: Lightbulb, label: 'Lab de Ideas' },
  { id: 'analytics', icon: BarChart2, label: 'Analíticas' },
];

export default function App() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Global Toast State
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  const showToast = (message, type = 'info') => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast({ visible: false, message: '', type: 'info' });
    }, 3000);
  };

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard
          onVideoSelect={(video) => {
            setSelectedVideo(video);
            setActiveTab('scripts');
          }}
          showToast={showToast}
        />;
      case 'scripts':
        return <ScriptStudio
          video={selectedVideo}
          onBack={() => setActiveTab('dashboard')}
          showToast={showToast}
        />;
      case 'sponsors':
        return <SponsorPortal scriptBlocks={[]} showToast={showToast} />;
      case 'finance':
        return <FinanceManager showToast={showToast} />;
      case 'assets':
        return (
          <ErrorBoundary>
            <AssetVault showToast={showToast} />
          </ErrorBoundary>
        );
      case 'ideas':
        return <BrainstormCanvas showToast={showToast} />;
      case 'analytics':
        return <AnalyticsDashboard showToast={showToast} />;
      default:
        return (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4 animate-fade-up">
            <Archive size={48} className="text-text-tertiary" />
            <div className="text-center">
              <h2 className="text-xl font-bold text-text-main uppercase tracking-widest">{activeTab}</h2>
              <p className="text-sm text-text-tertiary mt-2">Módulo en desarrollo...</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-bg-main text-text-main font-barlow overflow-hidden">
      {/* Sidebar (Desktop Only) */}
      <aside className={`hidden md:flex bg-bg-main border-r border-border-subtle transition-all duration-300 flex-col z-20 ${isSidebarOpen ? 'w-60' : 'w-20'}`}>
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-border-subtle gap-3 overflow-hidden shrink-0">
          <div className="w-8 h-8 rounded bg-yt-red flex items-center justify-center font-black text-white text-xs shrink-0">OS</div>
          {isSidebarOpen && (
            <div className="font-barlow-condensed font-black text-lg uppercase tracking-wider text-text-main leading-none">
              Creator<span className="text-yt-red">OS</span>
              <div className="text-[8px] tracking-[0.2em] text-text-tertiary mt-0.5">PRO SUITE</div>
            </div>
          )}
        </div>

        {/* Channel Card */}
        {isSidebarOpen && (activeTab !== 'sponsors' && activeTab !== 'ideas' && activeTab !== 'scripts') && (
          <div className="m-4 p-4 bg-bg-secondary border border-border-subtle rounded animate-fade-up shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center text-text-tertiary font-black">?</div>
              <div>
                <div className="text-xs font-bold leading-tight">Mi Canal</div>
                <div className="text-[10px] text-text-tertiary font-jetbrains uppercase">Sin suscrip.</div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`nav-item w-full ${activeTab === item.id ? 'active' : ''}`}
            >
              <item.icon size={18} className={activeTab === item.id ? 'text-yt-red' : 'text-text-tertiary'} />
              {isSidebarOpen && <span className="text-xs">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Auth Actions */}
        <div className="p-2 border-t border-border-subtle gap-1 flex flex-col">
          <button
            onClick={() => signOut()}
            className="nav-item w-full text-text-tertiary hover:text-yt-red"
          >
            <LogOut size={18} />
            {isSidebarOpen && <span className="text-xs">Cerrar Sesión</span>}
          </button>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-3 hover:bg-bg-tertiary transition-colors flex justify-center rounded-sm"
          >
            <Menu size={20} className="text-text-tertiary" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden bg-bg-main relative pb-16 md:pb-0">

        {/* Mobile Top Bar */}
        <div className="md:hidden h-14 border-b border-border-subtle bg-bg-secondary/90 backdrop-blur-xl flex items-center justify-between px-4 shrink-0 z-30 sticky top-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-yt-red flex items-center justify-center font-black text-white text-[10px] shrink-0">OS</div>
            <div className="font-barlow-condensed font-black text-base uppercase tracking-wider text-text-main leading-none mt-0.5">
              Creator<span className="text-yt-red">OS</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => showToast("No tienes nuevas notificaciones.", "info")}
              className="relative text-text-tertiary"
            >
              <Bell size={18} />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-yt-red rounded-full border-2 border-bg-main"></span>
            </button>
            <button onClick={() => signOut()} className="text-text-tertiary">
              <LogOut size={18} />
            </button>
          </div>
        </div>
        {/* Topbar (Hidden in some views for immersion, and hidden on mobile) */}
        {activeTab !== 'scripts' && activeTab !== 'ideas' && (
          <header className="hidden md:flex h-16 border-b border-border-subtle bg-bg-main/50 backdrop-blur-xl items-center justify-between px-8 shrink-0">
            <div className="flex-1 max-w-md">
              <div className="relative group flex items-center">
                <Search className="absolute left-3 text-text-tertiary group-focus-within:text-text-main transition-colors" size={16} />
                <input
                  type="text"
                  placeholder="Buscar videos, marcas, activos..."
                  className="w-full bg-bg-secondary border border-border-subtle rounded-sm py-2 pl-10 pr-4 text-xs text-text-main focus:outline-none focus:border-text-tertiary transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      showToast("La búsqueda profunda estará llegando pronto.", "info");
                      e.target.value = '';
                    }
                  }}
                />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={() => showToast("No tienes nuevas notificaciones.", "info")}
                className="relative text-text-tertiary hover:text-text-main transition-colors"
              >
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-yt-red rounded-full border-2 border-bg-main"></span>
              </button>
              <div
                onClick={() => showToast("Centro de ayuda en construcción.", "info")}
                className="w-8 h-8 rounded-full bg-bg-secondary border border-border-subtle flex items-center justify-center cursor-pointer overflow-hidden group hover:border-yt-red transition-all"
              >
                <div className="w-full h-full bg-bg-tertiary flex items-center justify-center text-[10px] font-black text-text-tertiary">?</div>
              </div>
            </div>
          </header>
        )}

        {/* Content View */}
        <div className="flex-1 overflow-y-auto w-full">
          {renderContent()}
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-bg-secondary/95 backdrop-blur-xl border-t border-border-subtle flex items-center justify-around px-2 z-50">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive ? 'text-yt-red' : 'text-text-tertiary'}`}
              >
                <item.icon size={20} className={isActive ? 'text-yt-red' : 'text-text-tertiary'} />
                <span className={`text-[9px] font-bold ${isActive ? 'text-text-main' : 'text-text-tertiary'}`}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Global Toast */}
        {toast.visible && (
          <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 bg-bg-tertiary border border-border-main text-text-main px-4 py-3 rounded shadow-2xl z-[100] flex items-center gap-3 animate-fade-up max-w-md">
            <span className="text-yt-red"><Info size={16} /></span>
            <span className="text-xs font-bold leading-tight">{toast.message}</span>
          </div>
        )}
      </main>
    </div>
  );
}
