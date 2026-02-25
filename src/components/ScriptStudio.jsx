import React, { useState, useEffect } from 'react';
import {
    Play,
    Info,
    CheckCircle,
    Clock,
    FileText,
    Plus,
    X,
    Maximize2
} from 'lucide-react';

const BLOCK_TYPES = [
    { id: 'hook', label: 'Hook', color: 'border-l-yt-red' },
    { id: 'intro', label: 'Intro', color: 'border-l-blue-500' },
    { id: 'sponsor', label: 'Sponsor Segment', color: 'border-l-yellow-500' },
    { id: 'body', label: 'Body', color: 'border-l-green-500' },
    { id: 'cta', label: 'CTA', color: 'border-l-purple-500' },
];

const INITIAL_BLOCKS = [
    { id: 1, type: 'hook', text: '', notes: '', time: 0 },
];

export default function ScriptStudio({ brandBrief }) {
    const [blocks, setBlocks] = useState(INITIAL_BLOCKS);
    const [totalTime, setTotalTime] = useState(0);

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

    return (
        <div className="flex h-screen bg-bg-main overflow-hidden font-barlow">
            {/* Editor Panel */}
            <div className="flex-1 flex flex-col border-r border-border-subtle bg-bg-main overflow-hidden">
                {/* Header */}
                <div className="h-14 flex items-center justify-between px-6 border-bottom border-border-subtle bg-bg-secondary/50 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-barlow-condensed font-black uppercase tracking-tighter text-text-main flex items-center gap-2">
                            <FileText className="text-yt-red" size={20} />
                            Script <span className="text-yt-red">Studio</span>
                        </h2>
                        <div className="flex items-center gap-2 px-3 py-1 bg-bg-quaternary/50 border border-border-subtle rounded-sm">
                            <Clock size={14} className="text-text-tertiary" />
                            <span className="text-xs font-jetbrains font-bold text-text-main">{formatTime(totalTime)}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="yt-btn-ghost flex items-center gap-2">
                            <Maximize2 size={14} /> Fullscreen
                        </button>
                        <button className="yt-btn flex items-center gap-2">
                            <CheckCircle size={14} /> Guardar Script
                        </button>
                    </div>
                </div>

                {/* Blocks Area */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                    {blocks.map((block) => {
                        const typeInfo = BLOCK_TYPES.find(t => t.id === block.type);
                        return (
                            <div key={block.id} className={`glass-card border-l-4 ${typeInfo.color} group animate-fade-up`}>
                                <div className="p-4 flex items-center justify-between border-b border-border-subtle bg-bg-tertiary/20">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">{typeInfo.label}</span>
                                        <span className="text-[10px] font-jetbrains font-bold text-yt-red bg-yt-red/10 px-1.5 rounded">{formatTime(block.time)}</span>
                                    </div>
                                    <button
                                        onClick={() => deleteBlock(block.id)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-text-tertiary hover:text-yt-red"
                                    >
                                        <X size={14} />
                                    </button>
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
                    })}

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
            <aside className="w-80 bg-bg-secondary border-l border-border-subtle flex flex-col">
                <div className="h-14 flex items-center px-6 border-b border-border-subtle bg-bg-secondary">
                    <h3 className="text-sm font-black uppercase tracking-widest text-text-tertiary flex items-center gap-2">
                        <CheckCircle className="text-green-500" size={16} /> Brand Brief
                    </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div>
                        <span className="text-[10px] font-black uppercase text-text-tertiary block mb-2 tracking-widest">Marca</span>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-blue-500/20 border border-blue-500/30 flex items-center justify-center font-black text-blue-400">
                                N
                            </div>
                            <div>
                                <div className="text-sm font-bold text-text-main">NordVPN</div>
                                <div className="text-[10px] font-jetbrains font-bold text-yt-red uppercase tracking-tight">Vence en 3 días</div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <span className="text-[10px] font-black uppercase text-text-tertiary block tracking-widest">Requisitos Obligatorios</span>
                        <ul className="space-y-3">
                            {[
                                'Mencionar garantía de devolución de 30 días.',
                                'Mostrar la interfaz de la App en pantalla.',
                                'Usar el link en la primera línea de la descripción.',
                                'Explicar el beneficio de seguridad en WiFi público.',
                                'CTA final enfocado en el cupón "JUANTECH".'
                            ].map((req, i) => (
                                <li key={i} className="flex gap-3 text-xs text-text-secondary leading-relaxed">
                                    <div className="mt-0.5"><CheckCircle size={14} className="text-text-tertiary" /></div>
                                    {req}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="pt-6 border-t border-border-subtle">
                        <span className="text-[10px] font-black uppercase text-text-tertiary block mb-3 tracking-widest">Archivos del Deal</span>
                        <div className="space-y-2">
                            <div className="p-3 bg-bg-tertiary/50 border border-border-subtle rounded group cursor-pointer hover:border-text-tertiary transition-colors flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Play size={14} className="text-yt-red" />
                                    <span className="text-xs font-semibold text-text-main">contrato_v2.pdf</span>
                                </div>
                                <maximize size={12} className="text-text-tertiary" />
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
}
