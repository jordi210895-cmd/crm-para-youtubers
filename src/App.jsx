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
  LogOut
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

const NAV_ITEMS = [
  { id: 'dashboard', icon: Home, label: 'Inicio' },
  { id: 'scripts', icon: FileText, label: 'Script Studio' },
  { id: 'sponsors', icon: Users, label: 'Sponsor Portal' },
  { id: 'finance', icon: DollarSign, label: 'Finanzas' },
  { id: 'assets', icon: Archive, label: 'Asset Vault' },
  { id: 'ideas', icon: Lightbulb, label: 'Lab de Ideas' },
  { id: 'analytics', icon: BarChart2, label: 'Analytics' },
];

export default function App() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (!user) {
    return <Login />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'scripts':
        return <ScriptStudio />;
      case 'sponsors':
        return <SponsorPortal scriptBlocks={[
          { type: 'Hook', text: '¿Sabías que el 90% de los creadores fallan por no tener las herramientas adecuadas? Hoy te presento 10 herramientas de IA que cambiarán tu vida.' },
          { type: 'Intro', text: 'Bienvenidos a un nuevo video. Soy Juan y hoy vamos a optimizar tu flujo de trabajo de una vez por todas.' },
          { type: 'Sponsor', text: 'Pero antes, un mensaje de nuestro patrocinador: NordVPN. Protégete en línea y accede a contenido global con un solo clic.' }
        ]} />;
      case 'finance':
        return <FinanceManager />;
      case 'assets':
        return <AssetVault />;
      case 'ideas':
        return <BrainstormCanvas />;
      case 'analytics':
        return <AnalyticsDashboard />;
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
      {/* Sidebar */}
      <aside className={`bg-bg-main border-r border-border-subtle transition-all duration-300 flex flex-col ${isSidebarOpen ? 'w-60' : 'w-20'}`}>
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
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yt-red to-yt-red-dark flex items-center justify-center text-white font-black">JR</div>
              <div>
                <div className="text-xs font-bold leading-tight">JuanTech</div>
                <div className="text-[10px] text-text-tertiary font-jetbrains uppercase">248K Subs</div>
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
      <main className="flex-1 flex flex-col overflow-hidden bg-bg-main">
        {/* Topbar (Hidden in some views for immersion) */}
        {activeTab !== 'scripts' && activeTab !== 'ideas' && (
          <header className="h-16 border-b border-border-subtle bg-bg-main/50 backdrop-blur-xl flex items-center justify-between px-8 shrink-0">
            <div className="flex-1 max-w-md">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-text-main transition-colors" size={16} />
                <input
                  type="text"
                  placeholder="Buscar videos, marcas, activos..."
                  className="w-full bg-bg-secondary border border-border-subtle rounded-sm py-2 pl-10 pr-4 text-xs text-text-main focus:outline-none focus:border-text-tertiary transition-colors"
                />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <button className="relative text-text-tertiary hover:text-text-main transition-colors">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-yt-red rounded-full border-2 border-bg-main"></span>
              </button>
              <div className="w-8 h-8 rounded-full bg-bg-secondary border border-border-subtle flex items-center justify-center cursor-pointer overflow-hidden border-2 border-yt-red/20 group hover:border-yt-red transition-all">
                <div className="w-full h-full bg-gradient-to-br from-yt-red to-yt-red-dark flex items-center justify-center text-[10px] font-black text-white">JR</div>
              </div>
            </div>
          </header>
        )}

        {/* Content View */}
        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
