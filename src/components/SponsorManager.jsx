import React, { useState, useEffect } from 'react';
import {
    Users,
    Plus,
    Search,
    Mail,
    Globe,
    ExternalLink,
    ChevronRight,
    Loader2,
    Briefcase,
    DollarSign
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
export default function SponsorManager({ showToast }) {
    const { user } = useAuth();
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newBrand, setNewBrand] = useState({ name: '', contact_email: '', website: '' });
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        if (user) {
            fetchBrands();
        }
    }, [user]);

    const fetchBrands = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('brands')
                .select('*')
                .eq('creator_id', user.id)
                .order('name');
            if (error) throw error;
            setBrands(data || []);
        } catch (err) {
            console.error('Error fetching brands:', err);
            showToast('Error cargando marcas.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddBrand = async (e) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            const { error } = await supabase
                .from('brands')
                .insert([{ ...newBrand, creator_id: user.id }]);
            if (error) throw error;

            showToast('¡Marca añadida con éxito!', 'success');
            setIsAddModalOpen(false);
            setNewBrand({ name: '', contact_email: '', website: '' });
            fetchBrands();
        } catch (err) {
            console.error('Error adding brand:', err);
            showToast('Error al añadir marca.', 'error');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-8 animate-fade-up pb-24 md:pb-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-barlow-condensed font-black uppercase tracking-tighter text-text-main">
                        Gestión de <span className="text-yt-red">Patrocinadores</span>
                    </h1>
                    <p className="text-xs text-text-tertiary mt-1">
                        Controla tus marcas, contactos y acuerdos comerciales
                    </p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="yt-btn flex items-center gap-2"
                >
                    <Plus size={16} /> Nueva Marca
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats Bar */}
                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="glass-card p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Total Marcas</p>
                        <p className="text-2xl font-black text-text-main">{brands.length}</p>
                    </div>
                    <div className="glass-card p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Deals Activos</p>
                        <p className="text-2xl font-black text-blue-500">0</p>
                    </div>
                </div>

                {/* Brands List */}
                <div className="md:col-span-3">
                    <div className="glass-card overflow-hidden">
                        <div className="p-4 border-b border-border-subtle bg-bg-tertiary/20 flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-widest text-text-main flex items-center gap-2">
                                <Users size={14} /> Directorio de Marcas
                            </h3>
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                                <input
                                    type="text"
                                    placeholder="Buscar marca..."
                                    className="bg-bg-main border border-border-subtle rounded py-1 pl-8 pr-4 text-[10px] text-text-main focus:outline-none focus:border-yt-red"
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div className="p-12 flex justify-center">
                                <Loader2 className="animate-spin text-text-tertiary" />
                            </div>
                        ) : brands.length === 0 ? (
                            <div className="p-12 text-center">
                                <p className="text-text-tertiary text-xs uppercase font-bold tracking-widest">Aún no has añadido ninguna marca</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border-subtle">
                                {brands.map(brand => (
                                    <div key={brand.id} className="p-4 flex items-center justify-between group hover:bg-bg-tertiary/10 transition-colors">
                                        <div className="flex items-center gap-6">
                                            <div className="w-12 h-12 rounded bg-bg-tertiary border border-border-subtle flex items-center justify-center font-black text-yt-red text-lg uppercase">
                                                {brand.name.substring(0, 1)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-text-main group-hover:text-yt-red transition-colors">{brand.name}</h4>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <span className="text-[10px] text-text-tertiary flex items-center gap-1">
                                                        <Mail size={10} /> {brand.contact_email || 'Sin email'}
                                                    </span>
                                                    {brand.website && (
                                                        <a href={brand.website} target="_blank" rel="noreferrer" className="text-[10px] text-blue-400 flex items-center gap-1 hover:underline">
                                                            <Globe size={10} /> Web
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="p-2 text-text-tertiary hover:text-text-main transition-colors">
                                                <Briefcase size={16} />
                                            </button>
                                            <ChevronRight size={16} className="text-text-tertiary" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Brand Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-bg-secondary border border-border-subtle rounded-lg w-full max-w-md overflow-hidden animate-fade-up">
                        <div className="p-5 border-b border-border-subtle flex justify-between items-center">
                            <h2 className="text-lg font-black uppercase tracking-widest text-text-main">Añadir Nueva Marca</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-text-tertiary hover:text-yt-red transition-colors">
                                <Plus className="rotate-45" size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleAddBrand} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Nombre de la Marca *</label>
                                <input
                                    required
                                    type="text"
                                    className="w-full bg-bg-main border border-border-subtle rounded p-3 text-sm text-text-main focus:outline-none focus:border-yt-red"
                                    placeholder="Ej: Lexus, NordVPN, Shopify..."
                                    value={newBrand.name}
                                    onChange={e => setNewBrand({ ...newBrand, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Email de Contacto</label>
                                <input
                                    type="email"
                                    className="w-full bg-bg-main border border-border-subtle rounded p-3 text-sm text-text-main focus:outline-none focus:border-yt-red"
                                    placeholder="marketing@marca.com"
                                    value={newBrand.contact_email}
                                    onChange={e => setNewBrand({ ...newBrand, contact_email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Sitio Web</label>
                                <input
                                    type="url"
                                    className="w-full bg-bg-main border border-border-subtle rounded p-3 text-sm text-text-main focus:outline-none focus:border-yt-red"
                                    placeholder="https://www.marca.com"
                                    value={newBrand.website}
                                    onChange={e => setNewBrand({ ...newBrand, website: e.target.value })}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isCreating}
                                className="yt-btn w-full mt-4 flex items-center justify-center gap-2"
                            >
                                {isCreating ? <Loader2 size={16} className="animate-spin" /> : null}
                                {isCreating ? 'CREANDO...' : 'REGISTRAR MARCA'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
