import React, { useState, useEffect } from 'react';
import {
    Play,
    TrendingUp,
    Users,
    DollarSign,
    Eye,
    Clock,
    MoreVertical,
    ChevronRight,
    AlertCircle,
    Plus,
    X,
    Video,
    Loader2,
    Sparkles,
    ArrowRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const DEALS = [];

const STAGE_STYLE = {
    Negociando: "bg-yellow-500/10 text-yellow-500",
    Producción: "bg-blue-500/10 text-blue-500",
    Cobrado: "bg-green-500/10 text-green-500",
};

export default function Dashboard({ onVideoSelect, showToast }) {
    const { user } = useAuth();
    const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newProjectForm, setNewProjectForm] = useState({ title: '', status: 'idea' });

    // Lista de videos
    // Stats
    [stats, setStats] = useState({ revenue: 0, videos: 0, deals: 0, views: 0 });
    [activeDeals, setActiveDeals] = useState([]);

    // Gemini IA States
    const [geminiPrompt, setGeminiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedIdeas, setGeneratedIdeas] = useState([]);

    useEffect(() => {
        if (user) {
            fetchVideos();
        }
    }, [user]);

    const fetchVideos = async () => {
        setIsLoadingVideos(true);
        try {
            // Fetch videos with related brand info
            const { data, error } = await supabase
                .from('videos')
                .select('*, brands(name, logo_url)')
                .eq('creator_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setVideosList(data || []);

            // Calculate Stats
            const newStats = (data || []).reduce((acc, video) => {
                acc.revenue += Number(video.revenue_deal || 0);
                acc.videos += 1;
                acc.views += Number(video.views_count || 0);
                if (video.brand_id) acc.deals += 1;
                return acc;
            }, { revenue: 0, videos: 0, deals: 0, views: 0 });

            setStats(newStats);

            // Fetch Deals for Pipeline (Videos with Brand)
            const deals = (data || [])
                .filter(v => v.brand_id)
                .map(v => ({
                    brand: v.brands?.name || 'Marca Desconocida',
                    logo: (v.brands?.name || 'M').substring(0, 1),
                    logoColor: 'text-yt-red',
                    stage: v.status === 'published' ? 'Cobrado' :
                        v.status === 'idea' ? 'Negociando' : 'Producción',
                    deal: `$${v.revenue_deal || 0}`,
                    urgent: v.is_urgent,
                    id: v.id
                }));
            setActiveDeals(deals);

        } catch (error) {
            console.error("Error cargando videos:", error);
            if (showToast) showToast("Error al cargar datos del Dashboard", "error");
        } finally {
            setIsLoadingVideos(false);
        }
    };

    const handleGenerateIdeas = async () => {
        if (!geminiPrompt.trim()) return;
        setIsGenerating(true);
        try {
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
            if (!apiKey) throw new Error("Clave de API de Gemini no configurada.");

            const { GoogleGenerativeAI } = await import('@google/generative-ai');
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const prompt = `
                Eres el mejor Productor y Estratega de Contenido para YouTube del mundo.
                El usuario creador de contenido te está pidiendo ideas y enfoques para videos sobre la siguiente temática: "${geminiPrompt}".
                Tu objetivo no es solo darle títulos vacíos, sino darle CONTEXTO, IDEAS DE GUION E INFORMACIÓN DE VALOR para estructurar el vídeo.
                
                Genera EXACTAMENTE 3 ideas de videos de alto rendimiento.
                Importante: Devuelve SOLO UN ARRAY JSON VÁLIDO. No pongas comillas invertidas (backticks) de markdown, ni la palabra json. SOLO el texto del array listo para parsear.
                Formato requerido:
                [
                  { 
                    "title": "TÍTULO MAGNÉTICO (Muy atractivo, genera curiosidad)", 
                    "description": "ESCRIBE AQUÍ UN PÁRRAFO COMPLETO (3 a 5 líneas). Explica de qué tratará el video, cuál será el gancho de los primeros minutos, qué información de inmenso valor o entretenimiento se va a dar al espectador, y cómo estructurarlo a nivel de guion resumido o call to action final." 
                  },
                  { "title": "...", "description": "..." },
                  { "title": "...", "description": "..." }
                ]
            `;

            const result = await model.generateContent(prompt);
            let responseText = result.response.text();

            // Clean markdown if accidentally returned
            responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
            const parsedIdeas = JSON.parse(responseText);

            setGeneratedIdeas(parsedIdeas);
        } catch (error) {
            console.error("Error generando ideas con IA:", error);
            alert("Hubo un error generando las ideas. Revisa la consola.");
        } finally {
            setIsGenerating(false);
        }
    };

    const openProjectModalWithIdea = (ideaTitle) => {
        setNewProjectForm({ title: ideaTitle, status: 'idea' });
        setIsNewProjectModalOpen(true);
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        if (!user) return;

        setIsCreating(true);
        try {
            const { data, error } = await supabase
                .from('videos')
                .insert([
                    {
                        title: newProjectForm.title,
                        status: newProjectForm.status,
                        creator_id: user.id
                    }
                ])
                .select();

            if (error) throw error;

            console.log("Proyecto creado exitosamente:", data);

            // Cerrar y limpiar
            setIsNewProjectModalOpen(false);
            setNewProjectForm({ title: '', status: 'idea' });

            // Recargar lista
            fetchVideos();

        } catch (error) {
            console.error("Error al crear proyecto:", error);
            alert("No se pudo crear el proyecto. ¿Están bien las políticas RLS?");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-6 md:space-y-8 animate-fade-up pb-24 md:pb-8">
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
                <button
                    onClick={() => setIsNewProjectModalOpen(true)}
                    className="px-4 py-2 bg-yt-red text-white flex items-center gap-2 rounded text-xs font-bold uppercase tracking-wider hover:bg-yt-red-dark transition-colors"
                >
                    <Plus size={14} /> Nuevo Proyecto
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KpiCard icon={<DollarSign className="text-green-500" />} label="Ingresos" value={`$${stats.revenue.toLocaleString()}`} sub="Presupuesto total en deals" trend="none" />
                <KpiCard icon={<Play className="text-yt-red" />} label="Videos" value={stats.videos.toString()} sub={`${stats.deals} con sponsor`} />
                <KpiCard icon={<Users className="text-blue-500" />} label="Deals" value={stats.deals.toString()} sub="Acuerdos comerciales" />
                <KpiCard icon={<Eye className="text-purple-500" />} label="Vistas" value={stats.views.toLocaleString()} sub="Impacto total acumulado" trend="none" />
            </div>

            {/* Asistente IA Gemini */}
            <div className="glass-card border-l-4 border-l-[#8B5CF6] overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 translate-x-1/4 -translate-y-1/4 opacity-10 pointer-events-none">
                    <Sparkles size={120} className="text-[#8B5CF6]" />
                </div>
                <div className="p-6 relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded bg-[#8B5CF6]/20 flex items-center justify-center">
                            <Sparkles size={16} className="text-[#8B5CF6]" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-text-main uppercase tracking-widest">Inspiración Gemini</h2>
                            <p className="text-[10px] text-text-tertiary">Pídele ideas de videos a tu asistente inteligente</p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Ej: 'Quiero ideas para hablar de los nuevos AirPods Pro...'"
                            className="flex-1 bg-bg-main border border-border-subtle rounded p-3 text-sm text-text-main focus:outline-none focus:border-[#8B5CF6]/50 transition-colors"
                            value={geminiPrompt}
                            onChange={(e) => setGeminiPrompt(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerateIdeas()}
                        />
                        <button
                            onClick={handleGenerateIdeas}
                            disabled={isGenerating || !geminiPrompt.trim()}
                            className="bg-[#8B5CF6] hover:bg-[#7c4de8] text-white px-6 rounded font-bold text-xs uppercase tracking-widest transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {isGenerating ? <Loader2 size={16} className="animate-spin" /> : 'Generar'}
                        </button>
                    </div>

                    {generatedIdeas.length > 0 && (
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-up">
                            {generatedIdeas.map((idea, idx) => (
                                <div key={idx} className="bg-bg-main border border-border-subtle rounded p-4 flex flex-col justify-between group hover:border-[#8B5CF6]/30 transition-colors h-64">
                                    <div className="space-y-3 mb-4 flex-1 overflow-hidden flex flex-col">
                                        <h3 className="text-sm font-bold text-text-main leading-tight shrink-0">{idea.title}</h3>
                                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                            <p className="text-xs text-text-tertiary leading-relaxed whitespace-pre-wrap">{idea.description}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => openProjectModalWithIdea(idea.title)}
                                        className="text-[10px] font-black uppercase tracking-widest text-[#8B5CF6] flex items-center min-gap-1 group-hover:gap-2 transition-all opacity-80 hover:opacity-100 shrink-0 pt-3 border-t border-border-subtle"
                                    >
                                        Crear Proyecto <ArrowRight size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Videos Section */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-tertiary border-b border-border-subtle pb-2">
                        <Play size={12} /> Videos en Producción
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {isLoadingVideos ? (
                            <div className="col-span-1 md:col-span-2 p-8 flex justify-center items-center h-32 border-2 border-dashed border-border-subtle rounded-lg bg-bg-tertiary/5">
                                <Loader2 size={24} className="text-text-tertiary animate-spin" />
                            </div>
                        ) : videosList.length === 0 ? (
                            <div className="col-span-1 md:col-span-2 p-8 text-center border-2 border-dashed border-border-subtle rounded-lg bg-bg-tertiary/10">
                                <p className="text-text-tertiary text-[10px] uppercase tracking-widest font-black">Sin videos en producción</p>
                            </div>
                        ) : (
                            videosList.map((video) => (
                                <div
                                    key={video.id}
                                    onClick={() => onVideoSelect(video)}
                                    className="glass-card group overflow-hidden flex flex-col cursor-pointer hover:border-text-secondary transition-colors"
                                >
                                    <div className="p-4 flex-1 space-y-3">
                                        <h3 className="text-sm font-bold text-text-main leading-tight line-clamp-2">{video.title}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${video.status === 'idea' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                                video.status === 'scripting' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                                    video.status === 'recording' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                        'bg-bg-tertiary text-text-secondary border-border-subtle'
                                                }`}>
                                                {video.status}
                                            </span>
                                            {video.brand_id && (
                                                <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-yt-red/5 rounded text-yt-red border border-yt-red/20">
                                                    ◈ Marca Asignada
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="px-4 py-3 bg-bg-tertiary/20 border-t border-border-subtle flex items-center justify-between">
                                        <span className="text-[9px] font-jetbrains text-text-tertiary">
                                            {new Date(video.created_at).toLocaleDateString()}
                                        </span>
                                        <ChevronRight size={14} className="text-text-tertiary group-hover:text-yt-red transition-colors" />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Sidebar: Deals */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-tertiary border-b border-border-subtle pb-2">
                        <Users size={12} /> Pipeline de Sponsors
                    </div>
                    <div className="glass-card divide-y divide-border-subtle">
                        {activeDeals.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="text-text-tertiary text-[10px] uppercase font-black tracking-widest">Sin sponsors en negociación</p>
                            </div>
                        ) : (
                            activeDeals.map((deal, i) => (
                                <div
                                    key={i}
                                    onClick={() => onVideoSelect({ id: deal.id })}
                                    className="p-4 flex items-center gap-4 hover:bg-bg-tertiary/20 transition-colors cursor-pointer group"
                                >
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
                            )))}
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

            {/* Modal de Nuevo Proyecto */}
            {isNewProjectModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-up">
                    <div className="bg-bg-secondary border border-border-subtle rounded-lg w-full max-w-md overflow-hidden flex flex-col">
                        <div className="flex justify-between items-center p-5 border-b border-border-subtle bg-bg-main/50">
                            <h2 className="text-xl font-barlow-condensed font-black uppercase tracking-tighter text-text-main flex items-center gap-2">
                                <Video className="text-yt-red" size={20} />
                                Nuevo <span className="text-yt-red">Proyecto</span>
                            </h2>
                            <button
                                onClick={() => setIsNewProjectModalOpen(false)}
                                className="text-text-tertiary hover:text-text-main transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateProject} className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary block">
                                    Título del Video *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej: Setup Tour 2026..."
                                    className="w-full bg-bg-main border border-border-subtle rounded p-3 text-sm text-text-main focus:outline-none focus:border-yt-red transition-colors"
                                    value={newProjectForm.title}
                                    onChange={(e) => setNewProjectForm({ ...newProjectForm, title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary block">
                                    Estado Inicial
                                </label>
                                <select
                                    className="w-full bg-bg-main border border-border-subtle rounded p-3 text-sm text-text-main focus:outline-none focus:border-yt-red transition-colors appearance-none"
                                    value={newProjectForm.status}
                                    onChange={(e) => setNewProjectForm({ ...newProjectForm, status: e.target.value })}
                                >
                                    <option value="idea">💡 En Ideación (Lab)</option>
                                    <option value="scripting">📝 Escribiendo Guion</option>
                                    <option value="recording">🎥 En Producción / Grabando</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={isCreating}
                                className="yt-btn w-full mt-4 py-3 flex justify-center items-center gap-2 disabled:opacity-50"
                            >
                                {isCreating ? <Loader2 size={16} className="animate-spin" /> : null}
                                {isCreating ? 'CREANDO...' : 'CREAR PROYECTO'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
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
