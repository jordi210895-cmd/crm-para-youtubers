import React, { useState, useEffect } from 'react';
import {
    Play,
    Info,
    CheckCircle,
    Clock,
    FileText,
    Plus,
    X,
    Maximize2,
    ArrowLeft,
    Loader2,
    Sparkles
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initializing Gemini API internally in generate function
const BLOCK_TYPES = [
    { id: 'hook', label: 'Gancho', color: 'border-l-yt-red' },
    { id: 'intro', label: 'Introducción', color: 'border-l-blue-500' },
    { id: 'sponsor', label: 'Mención', color: 'border-l-yellow-500' },
    { id: 'body', label: 'Desarrollo', color: 'border-l-green-500' },
    { id: 'cta', label: 'CTA Final', color: 'border-l-purple-500' },
];

export default function ScriptStudio({ video, onBack }) {
    const [blocks, setBlocks] = useState([]);
    const [totalTime, setTotalTime] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [scriptId, setScriptId] = useState(null);

    useEffect(() => {
        if (video) fetchScript();
    }, [video]);

    const fetchScript = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('scripts')
                .select('*')
                .eq('video_id', video.id)
                .single();

            if (error && error.code !== 'PGRST116') throw error; // PGRST116 means zero rows/not found

            if (data) {
                setScriptId(data.id);
                setBlocks(data.content?.blocks || []);
            } else {
                setBlocks([]);
                setScriptId(null);
            }
        } catch (error) {
            console.error("Error cargando el guion:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveScript = async () => {
        if (!video) return;
        setIsSaving(true);
        try {
            const payload = {
                video_id: video.id,
                content: { blocks },
                estimated_time_seconds: totalTime,
            };

            if (scriptId) {
                const { error } = await supabase.from('scripts').update(payload).eq('id', scriptId);
                if (error) throw error;
            } else {
                const { data, error } = await supabase.from('scripts').insert([payload]).select().single();
                if (error) throw error;
                if (data) setScriptId(data.id);
            }
        } catch (error) {
            console.error("Error guardando el guion:", error);
            alert("No se pudo guardar el guion.");
        } finally {
            setIsSaving(false);
        }
    };

    const calculateTime = (text) => {
        const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
        // Average speaking rate: 150 words per minute (2.5 words per second)
        return Math.ceil(words / 2.5);
    };

    const updateBlock = (id, field, value) => {
        setBlocks(prev => prev.map(b => {
            if (b.id === id) {
                const updated = { ...b, [field]: value };
                if (field === 'text') {
                    updated.time = calculateTime(value);
                }
                return updated;
            }
            return b;
        }));
    };

    const [isGeneratingBlockId, setIsGeneratingBlockId] = useState(null);
    const [activeAiBlockId, setActiveAiBlockId] = useState(null); // Which block's AI menu is open
    const [aiCustomPrompt, setAiCustomPrompt] = useState("");
    const [aiError, setAiError] = useState(null);

    const generateBlockContentWithAI = async (blockId, blockType, currentText, customInstruction) => {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

        if (!apiKey) {
            setAiError('No se ha detectado la API Key de Gemini. Por favor, añádela a tu archivo .env local o en la configuración de Vercel (Environment Variables) como VITE_GEMINI_API_KEY.');
            return;
        }

        // Initialize Gemini with verified model
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        setIsGeneratingBlockId(blockId);
        setAiError(null);
        try {
            const blockLabel = BLOCK_TYPES.find(t => t.id === blockType)?.label || blockType;
            const prompt = `
Eres un guionista experto en YouTube.
El título del video es: "${video.title}".
Tu tarea es redactar o mejorar el contenido del bloque de guion de tipo: "${blockLabel}".
Texto actual (puede estar vacío): "${currentText || 'Vacio'}".
${customInstruction ? `\nInstrucción Específica del Usuario: "${customInstruction}" (Aplica esto prioritariamente)` : ''}

Instrucciones:
- Si el texto actual está vacío, crea un contenido excelente desde cero para este bloque.
- Si hay texto actual, mejóralo, hazlo más atrapante, retentivo y profesional para YouTube.
- Adapta el tono al estándar de videos de alto rendimiento.
- El 'Hook' (Gancho) debe capturar la atención en los primeros 5 segundos.
- Devuelve **ÚNICAMENTE** el texto final listo para meter en el teleprompter. No añadas notas ni comillas iniciales/finales, solo el guion que se va a narrar.
`;
            const result = await model.generateContent(prompt);
            const aiText = result.response.text();

            // Reemplaza el texto con el generado
            if (aiText) {
                updateBlock(blockId, 'text', aiText.trim());
                setIsGeneratingBlockId(null);
                setActiveAiBlockId(null);
                setAiCustomPrompt("");
                setAiError(null);
            }
        } catch (error) {
            console.error("Error generando texto con AI:", error);
            setAiError("Error Gemini: " + (error.message || "Error desconocido. Revisa la consola."));
            setIsGeneratingBlockId(null);
        }
    };

    const addBlock = (type) => {
        const newBlock = {
            id: Date.now(),
            type: type || 'body',
            text: '',
            notes: '',
            time: 0
        };
        setBlocks([...blocks, newBlock]);
    };

    const deleteBlock = (id) => {
        if (blocks.length > 1) {
            setBlocks(blocks.filter(b => b.id !== id));
        }
    };

    useEffect(() => {
        const total = blocks.reduce((acc, b) => acc + b.time, 0);
        setTotalTime(total);
    }, [blocks]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (!video) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-up h-full">
                <FileText size={48} className="text-text-tertiary mb-4" />
                <h2 className="text-xl font-bold text-text-main uppercase tracking-widest">Sin Proyecto Seleccionado</h2>
                <p className="text-sm text-text-tertiary mt-2">Ve a la pestaña de Inicio y pulsa sobre uno de tus videos.</p>
                {onBack && (
                    <button onClick={onBack} className="mt-6 yt-btn">Volver a Inicio</button>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row h-screen bg-bg-main overflow-hidden font-barlow pb-16 md:pb-0">
            {/* Editor Panel */}
            <div className="flex-1 flex flex-col lg:border-r border-border-subtle bg-bg-main overflow-hidden">
                {/* Header */}
                <div className="h-14 flex items-center justify-between px-4 md:px-6 border-bottom border-border-subtle bg-bg-secondary/50 backdrop-blur-md sticky top-0 z-10 flex-wrap shrink-0">
                    <div className="flex items-center gap-2 md:gap-3">
                        {onBack && (
                            <button onClick={onBack} className="text-text-tertiary hover:text-text-main transition-colors mr-2">
                                <ArrowLeft size={18} />
                            </button>
                        )}
                        <h2 className="text-lg md:text-xl font-barlow-condensed font-black uppercase tracking-tighter text-text-main flex items-center gap-1 md:gap-2 truncate max-w-[150px] md:max-w-xs">
                            <span className="text-yt-red truncate">{video.title}</span>
                        </h2>
                        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-bg-quaternary/50 border border-border-subtle rounded-sm ml-2">
                            <Clock size={14} className="text-text-tertiary" />
                            <span className="text-xs font-jetbrains font-bold text-text-main">{formatTime(totalTime)}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-3">
                        <button className="hidden md:flex yt-btn-ghost items-center gap-2">
                            <Maximize2 size={14} /> Fullscreen
                        </button>
                        <button onClick={handleSaveScript} disabled={isSaving} className="yt-btn flex items-center gap-2 disabled:opacity-50">
                            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                            <span className="hidden md:inline">{isSaving ? 'Guardando...' : 'Guardar'}</span>
                        </button>
                    </div>
                </div>

                {/* Blocks Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border-subtle rounded-lg bg-bg-tertiary/5 space-y-4">
                            <Loader2 size={32} className="text-text-tertiary animate-spin" />
                        </div>
                    ) : blocks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-border-subtle rounded-lg bg-bg-tertiary/10 space-y-4 animate-fade-up">
                            <FileText size={32} className="text-text-tertiary" />
                            <p className="text-text-tertiary text-[10px] uppercase tracking-widest font-black">Añade un bloque para empezar tu guion</p>
                        </div>
                    ) : (
                        blocks.map((block) => {
                            const typeInfo = BLOCK_TYPES.find(t => t.id === block.type);
                            return (
                                <div key={block.id} className={`glass-card border-l-4 ${typeInfo.color} group animate-fade-up`}>
                                    <div className="p-4 flex items-center justify-between border-b border-border-subtle bg-bg-tertiary/20">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">{typeInfo.label}</span>
                                            <span className="text-[10px] font-jetbrains font-bold text-yt-red bg-yt-red/10 px-1.5 rounded">{formatTime(block.time)}</span>
                                        </div>
                                        <div className="flex items-center gap-2 relative">
                                            {/* AI Settings Popover */}
                                            {activeAiBlockId === block.id && (
                                                <div className="absolute right-0 top-10 mt-2 w-72 bg-bg-secondary border border-border-subtle rounded-lg shadow-xl p-4 z-50 animate-fade-in">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 text-blue-400">
                                                            <Sparkles size={12} /> Instrucciones para IA
                                                        </h4>
                                                        <button onClick={() => setActiveAiBlockId(null)} className="text-text-tertiary hover:text-yt-red">
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                    <textarea
                                                        className="w-full h-20 bg-bg-tertiary/20 border border-border-subtle rounded p-2 text-xs text-text-main focus:border-blue-400 focus:outline-none resize-none placeholder:text-text-tertiary/50 mb-3"
                                                        placeholder="Ej: Escríbelo con tono de misterio. Hazlo más gracioso. Enfócate en la curiosidad..."
                                                        value={aiCustomPrompt}
                                                        onChange={(e) => setAiCustomPrompt(e.target.value)}
                                                    />
                                                    {aiError && (
                                                        <div className="mb-3 p-2 bg-red-900/20 border border-red-500/50 rounded text-red-500 text-[10px] font-bold">
                                                            {aiError}
                                                        </div>
                                                    )}
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => generateBlockContentWithAI(block.id, block.type, block.text, aiCustomPrompt)}
                                                            disabled={isGeneratingBlockId === block.id}
                                                            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider py-2 rounded flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                                                        >
                                                            {isGeneratingBlockId === block.id ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                                            Generar
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => activeAiBlockId === block.id ? setActiveAiBlockId(null) : setActiveAiBlockId(block.id)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-400 hover:text-blue-300 flex items-center gap-1 bg-blue-500/10 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider"
                                                title="Generar o Mejorar con IA"
                                            >
                                                <Sparkles size={12} />
                                                <span className="hidden md:inline">IA</span>
                                            </button>
                                            <button
                                                onClick={() => deleteBlock(block.id)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity text-text-tertiary hover:text-yt-red"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 divide-x divide-border-subtle">
                                        <div className="md:col-span-2 p-0">
                                            <textarea
                                                placeholder="Escribe el guion aquí..."
                                                className="w-full h-32 p-4 bg-transparent text-text-main resize-none focus:outline-none placeholder:text-text-tertiary/50"
                                                value={block.text}
                                                onChange={(e) => updateBlock(block.id, 'text', e.target.value)}
                                            />
                                        </div>
                                        <div className="p-0 bg-bg-tertiary/10">
                                            <div className="flex items-center gap-1.5 p-3 border-b border-border-subtle">
                                                <Info size={12} className="text-blue-400" />
                                                <span className="text-[10px] font-bold uppercase tracking-tight text-text-secondary">Notas Internas</span>
                                            </div>
                                            <textarea
                                                placeholder="Notas de producción, B-Roll, etc..."
                                                className="w-full h-24 p-3 bg-transparent text-xs text-text-secondary resize-none focus:outline-none placeholder:text-text-tertiary/30 italic"
                                                value={block.notes}
                                                onChange={(e) => updateBlock(block.id, 'notes', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {/* Add Block Selector */}
                    <div className="flex flex-wrap gap-2 pt-4">
                        {BLOCK_TYPES.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => addBlock(type.id)}
                                className="yt-btn-ghost border-dashed border-text-tertiary/30 hover:border-text-secondary/50 flex items-center gap-2 capitalize"
                            >
                                <Plus size={14} /> {type.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Brand Brief Panel */}
            <aside className="w-full lg:w-80 h-1/3 lg:h-auto bg-bg-secondary border-t lg:border-t-0 lg:border-l border-border-subtle flex flex-col shrink-0">
                <div className="h-10 lg:h-14 flex items-center px-4 lg:px-6 border-b border-border-subtle bg-bg-secondary">
                    <h3 className="text-sm font-black uppercase tracking-widest text-text-tertiary flex items-center gap-2">
                        <CheckCircle className="text-green-500" size={16} /> Brand Brief
                    </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div>
                        <span className="text-[10px] font-black uppercase text-text-tertiary block mb-2 tracking-widest">Marca</span>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-gray-500/10 border border-gray-500/20 flex items-center justify-center font-black text-gray-500">
                                ?
                            </div>
                            <div>
                                <div className="text-sm font-bold text-text-main">Sin Marca</div>
                                <div className="text-[10px] font-jetbrains font-bold text-text-tertiary uppercase tracking-tight">Sin briefing activo</div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <span className="text-[10px] font-black uppercase text-text-tertiary block tracking-widest">Requisitos Obligatorios</span>
                        <ul className="space-y-3">
                            <li className="text-[10px] text-text-tertiary italic">No hay requisitos definidos para este guion.</li>
                        </ul>
                    </div>

                    <div className="pt-6 border-t border-border-subtle">
                        <span className="text-[10px] font-black uppercase text-text-tertiary block mb-3 tracking-widest">Archivos del Deal</span>
                        <div className="space-y-2">
                            <div className="text-[10px] text-text-tertiary italic">No hay archivos vinculados.</div>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
}
