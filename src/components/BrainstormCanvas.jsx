import React, { useState, useRef, useEffect } from 'react';
import {
    Lightbulb,
    Plus,
    Maximize2,
    MousePointer2,
    Trash2,
    CheckCircle2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const COLORS = [
    'bg-yellow-500/20 border-yellow-500/30',
    'bg-blue-500/20 border-blue-500/30',
    'bg-yt-red/10 border-yt-red/20',
    'bg-green-500/20 border-green-500/30',
];

export default function BrainstormCanvas({ showToast }) {
    const { user } = useAuth();
    const [ideas, setIdeas] = useState([]);
    const containerRef = useRef(null);
    const [draggingId, setDraggingId] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (user) {
            fetchIdeas();
        }
    }, [user]);

    const fetchIdeas = async () => {
        try {
            const { data, error } = await supabase
                .from('brainstorm_ideas')
                .select('*')
                .eq('creator_id', user.id)
                .order('created_at', { ascending: true });

            if (error) throw error;
            if (data) {
                setIdeas(data.map(d => ({
                    id: d.id,
                    text: d.content,
                    color: d.color || COLORS[0],
                    x: d.position_x || 0,
                    y: d.position_y || 0
                })));
            }
        } catch (err) {
            console.error("Error obteniendo ideas:", err);
            if (showToast) showToast("Error cargando el panel de ideas.", "error");
        }
    };

    const addIdea = async () => {
        const newColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        const initX = Math.round(50 + Math.random() * 200);
        const initY = Math.round(50 + Math.random() * 200);

        // Optimistic UI update could be tricky with UUIDs, so let's await
        try {
            const { data, error } = await supabase.from('brainstorm_ideas').insert([{
                creator_id: user.id,
                content: 'Nueva gran idea...',
                color: newColor,
                position_x: initX,
                position_y: initY
            }]).select();

            if (error) throw error;

            if (data && data.length > 0) {
                setIdeas([...ideas, {
                    id: data[0].id,
                    text: data[0].content,
                    color: data[0].color,
                    x: data[0].position_x,
                    y: data[0].position_y
                }]);
            }
        } catch (err) {
            console.error("Error creando idea", err);
            if (showToast) showToast("Hubo un error al crear la idea.", "error");
        }
    };

    const deleteIdea = async (id) => {
        // Optimistic delete
        setIdeas(ideas.filter(i => i.id !== id));
        try {
            await supabase.from('brainstorm_ideas').delete().eq('id', id);
        } catch (err) {
            console.error("Error eliminando idea", err);
        }
    };

    const saveIdeaContent = async (id, newContent) => {
        try {
            await supabase.from('brainstorm_ideas').update({ content: newContent }).eq('id', id);
        } catch (err) {
            console.error("Error guardando contenido", err);
        }
    };

    const handlePointerDown = (e, idea) => {
        // Ignorar si hace clic en el área de texto o botones
        if (e.target.tagName === 'TEXTAREA' || e.target.closest('button')) return;

        setDraggingId(idea.id);

        if (containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const clickXInContainer = e.clientX - containerRect.left + containerRef.current.scrollLeft;
            const clickYInContainer = e.clientY - containerRect.top + containerRef.current.scrollTop;

            setDragOffset({
                x: clickXInContainer - idea.x,
                y: clickYInContainer - idea.y
            });
        }

        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (draggingId === null || !containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const pointerXInContainer = e.clientX - containerRect.left + containerRef.current.scrollLeft;
        const pointerYInContainer = e.clientY - containerRect.top + containerRef.current.scrollTop;

        setIdeas(prevIdeas => prevIdeas.map(idea => {
            if (idea.id === draggingId) {
                return {
                    ...idea,
                    x: pointerXInContainer - dragOffset.x,
                    y: pointerYInContainer - dragOffset.y
                };
            }
            return idea;
        }));
    };

    const handlePointerUp = async (e) => {
        if (draggingId !== null) {
            const movedIdea = ideas.find(i => i.id === draggingId);
            setDraggingId(null);
            e.currentTarget.releasePointerCapture(e.pointerId);

            // Guardar en BD la posición final
            if (movedIdea) {
                try {
                    await supabase.from('brainstorm_ideas').update({
                        position_x: Math.round(movedIdea.x),
                        position_y: Math.round(movedIdea.y)
                    }).eq('id', movedIdea.id);
                } catch (err) {
                    console.error("Error guardando posición", err);
                }
            }
        }
    };

    return (
        <div className="flex flex-col h-screen bg-bg-main font-barlow overflow-hidden">
            {/* Canvas Header */}
            <div className="h-14 flex items-center justify-between px-6 border-b border-border-subtle bg-bg-secondary/50 backdrop-blur-md shrink-0 relative z-50">
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
            <div
                ref={containerRef}
                className="flex-1 relative bg-[radial-gradient(var(--border-main)_1px,transparent_1px)] [background-size:24px_24px] overflow-auto p-12 touch-none"
            >
                {ideas.map((idea) => (
                    <div
                        key={idea.id}
                        style={{ left: idea.x, top: idea.y, zIndex: draggingId === idea.id ? 50 : 10 }}
                        className={`absolute w-56 h-56 p-6 glass-card ${idea.color} border-2 shadow-2xl animate-fade-up group cursor-move ${draggingId === idea.id ? 'scale-105 shadow-xl opacity-90' : ''} transition-transform duration-75`}
                        onPointerDown={(e) => handlePointerDown(e, idea)}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                    >
                        <textarea
                            className="w-full h-full bg-transparent text-sm font-bold text-text-main resize-none focus:outline-none placeholder:text-text-tertiary/50"
                            value={idea.text}
                            onChange={(e) => {
                                const newText = e.target.value;
                                setIdeas(ideas.map(i => i.id === idea.id ? { ...i, text: newText } : i));
                            }}
                            onBlur={(e) => saveIdeaContent(idea.id, e.target.value)}
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
