import React, { useState } from 'react';
import {
    DollarSign,
    FileText,
    Download,
    Filter,
    Plus,
    CheckCircle,
    Clock,
    TrendingUp,
    CreditCard,
    PieChart
} from 'lucide-react';

const INVOICES = [
    { id: 'INV-001', brand: 'NordVPN', amount: '$3,200', date: '25 Feb 2025', status: 'Paid', video: 'Review PC Gaming $800' },
    { id: 'INV-002', brand: 'Notion', amount: '$2,200', date: '21 Feb 2025', status: 'Pending', video: '10 AI Tools 2025' },
    { id: 'INV-003', brand: 'Skillshare', amount: '$2,800', date: '18 Feb 2025', status: 'Draft', video: 'Aprende React en 10 min' },
];

export default function FinanceManager() {
    const [filter, setFilter] = useState('All');

    return (
        <div className="p-8 space-y-8 animate-fade-up">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-barlow-condensed font-black uppercase tracking-tighter text-text-main">
                        Gestión <span className="text-yt-red">Financiera</span>
                    </h2>
                    <p className="text-xs text-text-tertiary mt-1">Sigue tus ingresos, genera facturas y gestiona deals.</p>
                </div>
                <div className="flex gap-3">
                    <button className="yt-btn-ghost flex items-center gap-2">
                        <PieChart size={14} /> Reporte Q1
                    </button>
                    <button className="yt-btn flex items-center gap-2">
                        <Plus size={14} /> Nueva Factura
                    </button>
                </div>
            </div>

            {/* Financial Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 bg-gradient-to-br from-green-900/10 to-transparent">
                    <div className="flex justify-between items-center mb-4">
                        <DollarSign className="text-green-500" size={24} />
                        <TrendingUp className="text-green-500" size={16} />
                    </div>
                    <div className="text-3xl font-black font-barlow-condensed text-text-main leading-none mb-1">$24,500.00</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Balance Total</div>
                    <div className="mt-4 text-[10px] text-green-500 font-bold">+12.5% vs mes pasado</div>
                </div>

                <div className="glass-card p-6 bg-gradient-to-br from-blue-900/10 to-transparent">
                    <div className="flex justify-between items-center mb-4">
                        <Clock className="text-blue-500" size={24} />
                    </div>
                    <div className="text-3xl font-black font-barlow-condensed text-text-main leading-none mb-1">$13,700.00</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Pendiente de Cobro</div>
                    <div className="mt-4 text-[10px] text-blue-500 font-bold">7 Facturas activas</div>
                </div>

                <div className="glass-card p-6 bg-gradient-to-br from-yt-red/10 to-transparent">
                    <div className="flex justify-between items-center mb-4">
                        <CreditCard className="text-yt-red" size={24} />
                    </div>
                    <div className="text-3xl font-black font-barlow-condensed text-text-main leading-none mb-1">$4,100.00</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Impuestos Estimados (VAT)</div>
                    <div className="mt-4 text-[10px] text-yt-red font-bold">Proyección trimestral</div>
                </div>
            </div>

            {/* Invoices Table */}
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-text-tertiary flex items-center gap-2">
                        <FileText size={12} /> historial de Facturación
                    </h3>
                    <div className="flex gap-2">
                        {['All', 'Paid', 'Pending', 'Draft'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`text-[9px] font-black uppercase px-2 py-1 rounded transition-colors ${filter === f ? 'bg-yt-red text-white' : 'text-text-tertiary hover:text-text-main'}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="glass-card overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-bg-tertiary/10 border-b border-border-subtle">
                                <th className="p-4 text-[9px] font-black uppercase tracking-widest text-text-tertiary">ID / Marca</th>
                                <th className="p-4 text-[9px] font-black uppercase tracking-widest text-text-tertiary">Concepto</th>
                                <th className="p-4 text-[9px] font-black uppercase tracking-widest text-text-tertiary">Fecha</th>
                                <th className="p-4 text-[9px] font-black uppercase tracking-widest text-text-tertiary text-right">Monto</th>
                                <th className="p-4 text-[9px] font-black uppercase tracking-widest text-text-tertiary text-center">Estado</th>
                                <th className="p-4 text-[9px] font-black uppercase tracking-widest text-text-tertiary text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-subtle">
                            {INVOICES.filter(inv => filter === 'All' || inv.status === filter).map((inv, i) => (
                                <tr key={i} className="hover:bg-bg-tertiary/20 transition-colors group">
                                    <td className="p-4">
                                        <div className="text-xs font-bold text-text-main">{inv.brand}</div>
                                        <div className="text-[9px] text-text-tertiary font-jetbrains mt-0.5">{inv.id}</div>
                                    </td>
                                    <td className="p-4 text-xs font-medium text-text-secondary">{inv.video}</td>
                                    <td className="p-4 text-xs font-medium text-text-tertiary">{inv.date}</td>
                                    <td className="p-4 text-xs font-black text-text-main text-right font-jetbrains">{inv.amount}</td>
                                    <td className="p-4 text-center">
                                        <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-full ${inv.status === 'Paid' ? 'bg-green-500/10 text-green-500' :
                                                inv.status === 'Pending' ? 'bg-blue-500/10 text-blue-500' :
                                                    'bg-text-tertiary/10 text-text-tertiary'
                                            }`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="p-2 text-text-tertiary hover:text-text-main transition-colors inline-flex">
                                            <Download size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Automation Alert */}
            <div className="p-5 bg-blue-500/5 border border-blue-500/20 rounded-sm flex gap-4">
                <CheckCircle className="text-blue-500 shrink-0" size={20} />
                <div>
                    <p className="text-xs font-bold text-text-main uppercase tracking-tight">Automatización de Facturas</p>
                    <p className="text-[10px] text-text-secondary mt-1 leading-relaxed">
                        CreatorOS está configurado para generar una factura borrador automáticamente cuando un video con sponsor marcado como "Grabando" pasa a "Editando". El envío se programa para cuando el video esté "Publicado".
                    </p>
                </div>
            </div>
        </div>
    );
}
