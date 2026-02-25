import React, { useState } from 'react';
import {
    Lightbulb,
    Plus,
    Maximize2,
    MousePointer2,
    Trash2,
    CheckCircle2
} from 'lucide-react';

const COLORS = [
    'bg-yellow-500/20 border-yellow-500/30',
    'bg-blue-500/20 border-blue-500/30',
    'bg-yt-red/10 border-yt-red/20',
    'bg-green-500/20 border-green-500/30',
];

export default function BrainstormCanvas() {
    const [ideas, setIdeas] = useState([
        { id: 1, text: 'Mi setup 2025: Minimalismo Extremo', color: COLORS[0], x: 100, y: 150 },
        { id: 2, text: 'Review de las nuevas gafas de Apple', color: COLORS[1], x: 400, y: 200 },
    ]);

    const addIdea = () => {
        const newIdea = {
            id: Date.now(),
            text: 'Nueva gran idea...',
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            x: 200 + Math.random() * 200,
            y: 200 + Math.random() * 200,
        };
        setIdeas([...ideas, newIdea]);
    };

    const deleteIdea = (id) => {
        setIdeas(ideas.filter(i => i.id !== id));
    };

    return (
        <div className="flex flex-col h-screen bg-bg-main font-barlow overflow-hidden">
            {/* Canvas Header */}
            <div className="h-14 flex items-center justify-between px-6 border-b border-border-subtle bg-bg-secondary/50 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-barlow-condensed font-black uppercase tracking-tighter text-text-main flex items-center gap-2">
                        <Lightbulb className="text-yellow-500" size={20} />
                        AI <span className="text-yellow-500">Brainstorming</span>
                    </h2>
                    <span className="text-[10px] font-jetbrains font-bold text-text-tertiary bg-bg-tertiary px-2 py-0.5 rounded">
                        Canvas Infinito
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <button className="yt-btn-ghost flex items-center gap-2">
                        <MousePointer2 size={14} /> Seleccionar
                    </button>
                    <button onClick={addIdea} className="yt-btn flex items-center gap-2">
                        <Plus size={14} /> Añadir Post-it
                    </button>
                </div>
            </div>

            {/* Infinite Canvas Simulation */}
            <div className="flex-1 relative bg-[radial-gradient(var(--border-main)_1px,transparent_1px)] [background-size:24px_24px] overflow-auto p-12">
                {ideas.map((idea) => (
                    <div
                        key={idea.id}
                        style={{ left: idea.x, top: idea.y }}
                        className={`absolute w-56 h-56 p-6 glass-card ${idea.color} border-2 shadow-2xl animate-fade-up group cursor-move`}
                    >
                        <textarea
                            className="w-full h-full bg-transparent text-sm font-bold text-text-main resize-none focus:outline-none placeholder:text-text-tertiary/50"
                            value={idea.text}
                            onChange={(e) => {
                                const newText = e.target.value;
                                setIdeas(ideas.map(i => i.id === idea.id ? { ...i, text: newText } : i));
                            }}
                        />
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <button
                                onClick={() => deleteIdea(idea.id)}
                                className="p-1.5 bg-bg-secondary rounded hover:text-yt-red transition-colors"
                            >
                                <Trash2 size={12} />
                            </button>
                            <button
                                title="Convertir en Proyecto"
                                className="p-1.5 bg-bg-secondary rounded hover:text-green-500 transition-colors"
                            >
                                <CheckCircle2 size={12} />
                            </button>
                        </div>
                        <div className="absolute bottom-2 left-2 text-[8px] font-black font-jetbrains text-text-tertiary uppercase tracking-widest">
                            Post-it #{idea.id.toString().slice(-4)}
                        </div>
                    </div>
                ))}

                {/* Empty State */}
                {ideas.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center space-y-4 max-w-sm">
                            <div className="w-16 h-16 bg-bg-secondary border border-border-subtle rounded-full flex items-center justify-center mx-auto">
                                <Lightbulb size={32} className="text-text-tertiary" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-text-main">Tu lienzo está vacío</h3>
                                <p className="text-xs text-text-tertiary leading-relaxed">
                                    Usa el botón "Añadir Post-it" para capturar tus ideas brillantes antes de que se escapen.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
