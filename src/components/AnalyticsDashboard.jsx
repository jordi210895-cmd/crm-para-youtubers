import React from 'react';
import {
    BarChart,
    Users,
    Eye,
    Activity,
    Youtube,
    Share2,
    TrendingUp,
    Globe,
    PieChart,
    Calendar
} from 'lucide-react';

export default function AnalyticsDashboard() {
    return (
        <div className="p-8 space-y-8 animate-fade-up">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-barlow-condensed font-black uppercase tracking-tighter text-text-main">
                        Channel <span className="text-yt-red">Analytics</span>
                    </h2>
                    <p className="text-xs text-text-tertiary mt-1">Sincronizado con YouTube Data API • Hace 4 min</p>
                </div>
                <button className="yt-btn flex items-center gap-2">
                    <Share2 size={14} /> Compartir Media Kit
                </button>
            </div>

            {/* Real-time Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={<Users className="text-yt-red" />} label="Subscriptores" value="248,392" trend="+1,204 hoy" />
                <StatCard icon={<Eye className="text-blue-500" />} label="Vistas (28d)" value="1,248,304" trend="+14.2%" />
                <StatCard icon={<Activity className="text-green-500" />} label="Engagement Rate" value="8.4%" trend="+0.5%" />
                <StatCard icon={<Calendar className="text-purple-500" />} label="Videos Publicados" value="12" trend="Este mes" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart Simulation */}
                <div className="lg:col-span-2 glass-card p-6 flex flex-col min-h-[400px]">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary flex items-center gap-2">
                            <BarChart size={16} className="text-yt-red" /> Rendimiento de Vistas
                        </h3>
                        <div className="flex gap-2">
                            {['7D', '28D', '90D', '1Y'].map(t => (
                                <button key={t} className={`text-[9px] font-black uppercase px-2 py-1 rounded ${t === '28D' ? 'bg-bg-tertiary text-text-main' : 'text-text-tertiary'}`}>
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 flex items-end gap-2 px-4 pb-4">
                        {Array.from({ length: 28 }).map((_, i) => {
                            const height = 20 + Math.random() * 80;
                            return (
                                <div
                                    key={i}
                                    className={`flex-1 rounded-t-sm transition-all duration-500 hover:bg-yt-red cursor-pointer ${i === 24 ? 'bg-yt-red shadow-[0_0_12px_rgba(255,0,0,0.4)]' : 'bg-bg-quaternary'}`}
                                    style={{ height: `${height}%` }}
                                />
                            );
                        })}
                    </div>
                    <div className="flex justify-between mt-4 text-[9px] font-jetbrains text-text-tertiary uppercase tracking-widest px-2">
                        <span>01 Feb</span>
                        <span>15 Feb</span>
                        <span>28 Feb</span>
                    </div>
                </div>

                {/* Audience Breakdown */}
                <div className="space-y-6">
                    <div className="glass-card p-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-6 flex items-center gap-2">
                            <Globe size={16} /> Principales Geografías
                        </h3>
                        <div className="space-y-4">
                            {[
                                { country: 'España', pct: 42, color: 'bg-yt-red' },
                                { country: 'México', pct: 28, color: 'bg-blue-500' },
                                { country: 'Argentina', pct: 15, color: 'bg-green-500' },
                                { country: 'Otros', pct: 15, color: 'bg-bg-quaternary' },
                            ].map((item, i) => (
                                <div key={i} className="space-y-1.5">
                                    <div className="flex justify-between text-[10px] font-bold text-text-main uppercase tracking-tight">
                                        <span>{item.country}</span>
                                        <span>{item.pct}%</span>
                                    </div>
                                    <div className="h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
                                        <div className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card p-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-6 flex items-center gap-2">
                            <PieChart size={16} /> Demografía de Edad
                        </h3>
                        <div className="flex items-center justify-around py-4">
                            <div className="relative w-24 h-24 rounded-full border-8 border-bg-tertiary flex items-center justify-center">
                                <div className="absolute inset-0 rounded-full border-8 border-yt-red border-t-transparent border-r-transparent transform rotate-45" />
                                <span className="text-sm font-black text-text-main">18-34</span>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-text-main">
                                    <div className="w-2 h-2 rounded-full bg-yt-red" /> 18-24 (45%)
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-text-main">
                                    <div className="w-2 h-2 rounded-full bg-blue-500" /> 25-34 (38%)
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-text-main">
                                    <div className="w-2 h-2 rounded-full bg-bg-quaternary" /> Otros (17%)
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, trend }) {
    return (
        <div className="glass-card p-5 group">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-bg-tertiary rounded group-hover:bg-bg-quaternary transition-colors">
                    {icon}
                </div>
                <TrendingUp size={14} className="text-text-tertiary group-hover:text-yt-red transition-colors" />
            </div>
            <div className="text-2xl font-black font-barlow-condensed uppercase tracking-tighter text-text-main mb-1 leading-none">{value}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-text-tertiary mb-2">{label}</div>
            <div className={`text-[9px] font-bold font-jetbrains ${trend.startsWith('+') ? 'text-green-500' : 'text-text-tertiary'}`}>
                {trend}
            </div>
        </div>
    );
}
