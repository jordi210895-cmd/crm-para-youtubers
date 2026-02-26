import React, { useState } from 'react';
import {
    Play,
    TrendingUp,
    Users,
    DollarSign,
    Eye,
    Clock,
    MoreVertical,
    ChevronRight,
    AlertCircle
} from 'lucide-react';

const VIDEOS = [];

const DEALS = [];

const STAGE_STYLE = {
    Negociando: "bg-yellow-500/10 text-yellow-500",
    Producción: "bg-blue-500/10 text-blue-500",
    Cobrado: "bg-green-500/10 text-green-500",
};

export default function Dashboard() {
    return (
        <div className="p-8 space-y-8 animate-fade-up">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-barlow-condensed font-black uppercase tracking-tighter text-text-main">
                        Dashboard de <span className="text-yt-red">Creador</span>
                    </h1>
                    <p className="text-xs text-text-tertiary mt-1">
                        Bienvenido de nuevo — <span className="text-gray-500 font-bold">No hay alertas pendientes ⚡</span>
                    </p>
                </div>
                <button className="yt-btn flex items-center gap-2">
                    <PlusIcon /> Nuevo Proyecto
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard icon={<DollarSign className="text-green-500" />} label="Ingresos" value="$0.00" sub="Sin datos este Q" trend="none" />
                <KpiCard icon={<Play className="text-yt-red" />} label="Videos" value="0" sub="0 con sponsor" />
                <KpiCard icon={<Users className="text-blue-500" />} label="Deals" value="0" sub="$0 pendiente" />
                <KpiCard icon={<Eye className="text-purple-500" />} label="Vistas" value="0" sub="Sin datos este mes" trend="none" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Videos Section */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-tertiary border-b border-border-subtle pb-2">
                        <Play size={12} /> Videos en Producción
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {VIDEOS.map((video, i) => (
                            <div key={i} className="glass-card group overflow-hidden">
                                <div className={`h-32 bg-gradient-to-br ${video.color} flex items-center justify-center text-4xl relative`}>
                                    {video.emoji}
                                    <div className="absolute bottom-2 right-2 bg-black/80 text-[10px] font-jetbrains px-1.5 py-0.5 rounded text-white">
                                        {video.duration}
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                                        <div className="h-full bg-yt-red" style={{ width: `${video.progress}%` }}></div>
                                    </div>
                                </div>
                                <div className="p-4 space-y-3">
                                    <h3 className="text-sm font-bold text-text-main leading-tight line-clamp-2">{video.title}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-bg-tertiary rounded text-text-secondary border border-border-subtle">
                                            {video.statusLabel}
                                        </span>
                                        {video.sponsor && (
                                            <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-yt-red/5 rounded text-yt-red border border-yt-red/20">
                                                ◈ {video.sponsor}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-1 bg-bg-quaternary rounded-full overflow-hidden">
                                            <div className="h-full bg-yt-red shadow-[0_0_8px_rgba(255,0,0,0.5)]" style={{ width: `${video.progress}%` }}></div>
                                        </div>
                                        <span className="text-[10px] font-jetbrains text-text-tertiary">{video.progress}%</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar: Deals */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-tertiary border-b border-border-subtle pb-2">
                        <Users size={12} /> Pipeline de Sponsors
                    </div>
                    <div className="glass-card divide-y divide-border-subtle">
                        {DEALS.map((deal, i) => (
                            <div key={i} className="p-4 flex items-center gap-4 hover:bg-bg-tertiary/20 transition-colors cursor-pointer group">
                                <div className={`w-10 h-10 rounded border border-border-subtle bg-bg-tertiary flex items-center justify-center font-black ${deal.logoColor}`}>
                                    {deal.logo}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-text-main">{deal.brand}</span>
                                        {deal.urgent && (
                                            <span className="text-[8px] font-black bg-yt-red/10 text-yt-red px-1.5 py-0.5 rounded animate-pulse">URGENTE</span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${STAGE_STYLE[deal.stage]}`}>
                                            {deal.stage}
                                        </span>
                                        <span className="text-[9px] font-jetbrains text-text-tertiary">{deal.deal}</span>
                                    </div>
                                </div>
                                <ChevronRight size={14} className="text-text-tertiary group-hover:text-text-main transition-colors" />
                            </div>
                        ))}
                    </div>

                    <div className="glass-card p-4 bg-yt-red/5 border-yt-red/10 border-l-2 border-l-yt-red">
                        <div className="flex gap-3">
                            <AlertCircle size={16} className="text-yt-red shrink-0" />
                            <div>
                                <p className="text-[11px] font-bold text-text-main uppercase tracking-tight">Acción Requerida</p>
                                <p className="text-[10px] text-text-secondary mt-1">
                                    No tienes acciones inmediatas requeridas por parte de las marcas.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function KpiCard({ icon, label, value, sub, trend }) {
    return (
        <div className="glass-card p-5 group relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-bg-tertiary rounded-lg border border-border-subtle group-hover:border-text-tertiary/30 transition-colors">
                    {icon}
                </div>
                {trend === 'up' && <TrendingUp size={14} className="text-green-500" />}
            </div>
            <div className="text-2xl font-black font-barlow-condensed uppercase tracking-tighter text-text-main leading-none mb-1">
                {value}
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-text-tertiary mb-2">{label}</div>
            <div className="text-[10px] font-jetbrains font-bold text-text-secondary">{sub}</div>
        </div>
    );
}

function PlusIcon() {
    return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
}
