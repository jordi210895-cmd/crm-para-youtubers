import React, { useState, useEffect } from 'react';
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
    PieChart,
    X,
    Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const INVOICES = [];

export default function FinanceManager({ showToast }) {
    const { user } = useAuth();
    const [filter, setFilter] = useState('All');
    const [invoices, setInvoices] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Modal State
    const [videos, setVideos] = useState([]);
    const [brands, setBrands] = useState([]);
    const [newInvoice, setNewInvoice] = useState({ video_id: '', brand_id: '', amount: '', status: 'Pending' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            fetchInvoices();
            fetchFormOptions();
        }
    }, [user]);

    const fetchInvoices = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('invoices')
                .select(`
                    id, 
                    amount, 
                    status, 
                    created_at,
                    invoice_number,
                    video:videos(title),
                    brand:brands(name)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            if (data) setInvoices(data);
        } catch (error) {
            console.error("Error fetching invoices:", error);
            showToast("Error al cargar las facturas", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchFormOptions = async () => {
        try {
            const [videosRes, brandsRes] = await Promise.all([
                supabase.from('videos').select('id, title').eq('creator_id', user.id),
                supabase.from('brands').select('id, name')
            ]);

            if (videosRes.data) setVideos(videosRes.data);
            if (brandsRes.data) setBrands(brandsRes.data);
        } catch (error) {
            console.error("Error fetching options:", error);
        }
    };

    const handleCreateInvoice = async (e) => {
        e.preventDefault();
        if (!newInvoice.video_id || !newInvoice.amount) return;

        setIsSubmitting(true);
        try {
            const payload = {
                video_id: newInvoice.video_id,
                brand_id: newInvoice.brand_id || null,
                amount: parseFloat(newInvoice.amount),
                status: newInvoice.status
            };

            const { error } = await supabase.from('invoices').insert([payload]);
            if (error) throw error;

            showToast("Factura creada exitosamente", "success");
            setIsModalOpen(false);
            setNewInvoice({ video_id: '', brand_id: '', amount: '', status: 'Pending' });
            fetchInvoices(); // Recargar lista
        } catch (error) {
            console.error("Error creating invoice:", error);
            showToast("Error al crear la factura", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const safeInvoices = Array.isArray(invoices) ? invoices : [];
    const totalBalance = safeInvoices.reduce((acc, inv) => acc + Number(inv.amount || 0), 0);
    const pendingBalance = safeInvoices.filter(i => i.status === 'Pending').reduce((acc, inv) => acc + Number(inv.amount || 0), 0);
    const activeInvoices = safeInvoices.filter(i => i.status === 'Pending').length;

    return (
        <div className="p-4 md:p-8 space-y-6 md:space-y-8 animate-fade-up">
            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-barlow-condensed font-black uppercase tracking-tighter text-text-main">
                        Gestión <span className="text-yt-red">Financiera</span>
                    </h2>
                    <p className="text-xs text-text-tertiary mt-1">Sigue tus ingresos, genera facturas y gestiona deals.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => showToast("Construyendo el reporte trimestral (PDF)... Estará disponible pronto.", "info")}
                        className="yt-btn-ghost flex items-center gap-2"
                    >
                        <PieChart size={14} /> Reporte Q1
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="yt-btn flex items-center gap-2"
                    >
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
                    <div className="text-3xl font-black font-barlow-condensed text-text-main leading-none mb-1">${totalBalance.toFixed(2)}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Balance Total</div>
                    <div className="mt-4 text-[10px] text-gray-500 font-bold">{safeInvoices.length} facturas registradas</div>
                </div>

                <div className="glass-card p-6 bg-gradient-to-br from-blue-900/10 to-transparent">
                    <div className="flex justify-between items-center mb-4">
                        <Clock className="text-blue-500" size={24} />
                    </div>
                    <div className="text-3xl font-black font-barlow-condensed text-text-main leading-none mb-1">${pendingBalance.toFixed(2)}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Pendiente de Cobro</div>
                    <div className="mt-4 text-[10px] text-gray-500 font-bold">{activeInvoices} Facturas activas</div>
                </div>

                <div className="glass-card p-6 bg-gradient-to-br from-yt-red/10 to-transparent">
                    <div className="flex justify-between items-center mb-4">
                        <CreditCard className="text-yt-red" size={24} />
                    </div>
                    <div className="text-3xl font-black font-barlow-condensed text-text-main leading-none mb-1">${(totalBalance * 0.21).toFixed(2)}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Impuestos Estimados (VAT 21%)</div>
                    <div className="mt-4 text-[10px] text-gray-500 font-bold">Proyección automática</div>
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

                <div className="glass-card overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
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
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-text-tertiary">
                                        <Loader2 className="animate-spin mx-auto" size={24} />
                                    </td>
                                </tr>
                            ) : safeInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-text-tertiary text-[10px] uppercase font-black tracking-widest">
                                        No hay facturas registradas
                                    </td>
                                </tr>
                            ) : (
                                safeInvoices.filter(inv => filter === 'All' || inv.status === filter).map((inv, i) => (
                                    <tr key={i} className="hover:bg-bg-tertiary/20 transition-colors group">
                                        <td className="p-4">
                                            <div className="text-xs font-bold text-text-main">{inv.brand?.name || 'Creador Independiente'}</div>
                                            <div className="text-[9px] text-text-tertiary font-jetbrains mt-0.5">#{inv.invoice_number || (inv.id ? inv.id.slice(0, 8) : '---')}</div>
                                        </td>
                                        <td className="p-4 text-xs font-medium text-text-secondary">{inv.video?.title || 'Sin video asignado'}</td>
                                        <td className="p-4 text-xs font-medium text-text-tertiary">{new Date(inv.created_at).toLocaleDateString()}</td>
                                        <td className="p-4 text-xs font-black text-text-main text-right font-jetbrains">${inv.amount}</td>
                                        <td className="p-4 text-center">
                                            <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-full ${inv.status === 'Paid' ? 'bg-green-500/10 text-green-500' :
                                                inv.status === 'Pending' ? 'bg-blue-500/10 text-blue-500' :
                                                    'bg-text-tertiary/10 text-text-tertiary'
                                                }`}>
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => showToast(`Generando PDF para factura #${inv.invoice_number || (inv.id ? inv.id.slice(0, 4) : '---')}...`, "info")}
                                                className="p-2 text-text-tertiary hover:text-text-main transition-colors inline-flex"
                                            >
                                                <Download size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                )))}
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

            {/* Modal de Nueva Factura */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-bg-main/90 flex items-center justify-center p-4 z-50">
                    <div className="glass-card max-w-md w-full p-6 animate-fade-up">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-black uppercase font-barlow-condensed tracking-tighter">Crear Nueva Factura</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-text-tertiary hover:text-yt-red transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateInvoice} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-text-tertiary mb-2">Video Asociado (Requerido)</label>
                                <select
                                    className="w-full bg-bg-main border border-border-subtle rounded p-3 text-sm text-text-main focus:border-yt-red transition-colors"
                                    value={newInvoice.video_id}
                                    onChange={(e) => setNewInvoice({ ...newInvoice, video_id: e.target.value })}
                                    required
                                >
                                    <option value="">Selecciona un proyecto...</option>
                                    {videos.map(v => (
                                        <option key={v.id} value={v.id}>{v.title}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-text-tertiary mb-2">Marca / Sponsor (Opcional)</label>
                                <select
                                    className="w-full bg-bg-main border border-border-subtle rounded p-3 text-sm text-text-main focus:border-yt-red transition-colors"
                                    value={newInvoice.brand_id}
                                    onChange={(e) => setNewInvoice({ ...newInvoice, brand_id: e.target.value })}
                                >
                                    <option value="">Ninguna marca...</option>
                                    {brands.map(b => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-text-tertiary mb-2">Monto ($)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        required
                                        className="w-full bg-bg-main border border-border-subtle rounded p-3 text-sm text-text-main focus:border-yt-red transition-colors"
                                        placeholder="0.00"
                                        value={newInvoice.amount}
                                        onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-text-tertiary mb-2">Estado</label>
                                    <select
                                        className="w-full bg-bg-main border border-border-subtle rounded p-3 text-sm text-text-main focus:border-yt-red transition-colors"
                                        value={newInvoice.status}
                                        onChange={(e) => setNewInvoice({ ...newInvoice, status: e.target.value })}
                                    >
                                        <option value="Draft">Borrador</option>
                                        <option value="Pending">Pendiente</option>
                                        <option value="Paid">Pagada</option>
                                    </select>
                                </div>
                            </div>

                            <button type="submit" disabled={isSubmitting} className="yt-btn w-full mt-6 py-3 flex justify-center">
                                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : 'Registrar Factura'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
