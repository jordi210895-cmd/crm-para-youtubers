import React, { useState } from 'react';
import {
    Lock,
    MessageSquare,
    CheckCircle,
    Download,
    ExternalLink,
    FileText,
    AlertCircle
} from 'lucide-react';

export default function SponsorPortal({ brandData, scriptBlocks }) {
    const [feedback, setFeedback] = useState('');
    const [isApproved, setIsApproved] = useState(false);

    return (
        <div className="min-h-screen bg-bg-main text-text-main font-barlow flex flex-col">
            {/* External Header */}
            <header className="h-16 border-b border-border-subtle bg-bg-secondary flex items-center justify-between px-8">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded bg-yt-red flex items-center justify-center font-black text-white text-xs">OS</div>
                    <div className="h-6 w-px bg-border-main"></div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-widest text-text-tertiary">Portal del Patrocinador</span>
                        <span className="text-xs font-bold text-text-secondary px-2 py-0.5 bg-bg-tertiary rounded-full border border-border-subtle">
                            {brandData?.name || 'NordVPN'}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-text-tertiary">
                        <Lock size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-tight">Acceso Seguro</span>
                    </div>
                    <button className="yt-btn-ghost text-[10px] flex items-center gap-2">
                        <ExternalLink size={12} /> Soporte
                    </button>
                </div>
            </header>

            <main className="flex-1 max-w-5xl mx-auto w-full p-8 md:p-12 space-y-12">
                {/* Project Intro */}
                <section className="space-y-4 animate-fade-up">
                    <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-green-500/10 text-green-500 text-[10px] font-black uppercase tracking-widest rounded border border-green-500/20">
                            En Revisión
                        </span>
                        <span className="text-text-tertiary text-xs">V2 · Actualizado hace 2 horas</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-barlow-condensed font-black uppercase tracking-tighter leading-none">
                        Review del Guion: <span className="text-yt-red">10 AI Tools 2025</span>
                    </h1>
                    <p className="text-text-secondary max-w-2xl text-lg leading-relaxed">
                        Hola equipo de {brandData?.name || 'NordVPN'}. Aquí tienen la versión final del guion para revisión. Por favor, dejen su feedback en los comentarios o aprueben el contenido para proceder con la grabación.
                    </p>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Script Viewer */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="glass-card overflow-hidden">
                            <div className="p-4 bg-bg-tertiary/30 border-b border-border-subtle flex items-center justify-between">
                                <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary flex items-center gap-2">
                                    <FileText size={16} /> Contenido del Guion
                                </h3>
                                <span className="text-[10px] font-jetbrains font-bold text-text-tertiary uppercase">Solo Lectura</span>
                            </div>
                            <div className="p-8 space-y-10">
                                {scriptBlocks.map((block, i) => (
                                    <div key={i} className="space-y-4">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-yt-red/60 border-b border-yt-red/10 pb-1 inline-block">
                                            {block.type}
                                        </span>
                                        <p className="text-text-main text-lg leading-relaxed font-medium">
                                            {block.text || 'Contenido pendiente de completar...'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar: Feedback & Approval */}
                    <div className="space-y-6">
                        <div className="glass-card p-6 bg-yt-red/5 border-yt-red/10">
                            <h3 className="text-xs font-black uppercase tracking-widest text-yt-red mb-4 flex items-center gap-2">
                                <CheckCircle size={16} /> Confirmación de Marca
                            </h3>
                            <p className="text-xs text-text-secondary mb-6 leading-relaxed">
                                Al hacer clic en aprobar, confirmas que el contenido cumple con todos los requisitos del contrato.
                            </p>
                            <button
                                onClick={() => setIsApproved(!isApproved)}
                                className={`w-full py-4 rounded font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 ${isApproved
                                        ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.3)]'
                                        : 'bg-yt-red text-white hover:bg-yt-red-dark'
                                    }`}
                            >
                                {isApproved ? <CheckCircle size={18} /> : null}
                                {isApproved ? 'Guion Aprobado' : 'Aprobar Guion'}
                            </button>
                        </div>

                        <div className="glass-card p-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-4 flex items-center gap-2">
                                <MessageSquare size={16} /> FeedBack / Comentarios
                            </h3>
                            <textarea
                                className="w-full h-32 bg-bg-main border border-border-subtle rounded p-4 text-xs text-text-main focus:outline-none focus:border-text-tertiary transition-colors resize-none mb-4"
                                placeholder="Escribe tus sugerencias aquí..."
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                            />
                            <button className="yt-btn-ghost w-full">Enviar Feedback</button>
                        </div>

                        <div className="glass-card p-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary mb-4 flex items-center gap-2">
                                <Download size={16} /> Documentos y Activos
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { name: 'Factura_FEBRERO.pdf', type: 'invoice' },
                                    { name: 'Contrato_Signed.pdf', type: 'contract' },
                                    { name: 'Thumb_V1_Final.jpg', type: 'image' }
                                ].map((doc, i) => (
                                    <div key={i} className="group flex items-center justify-between p-3 bg-bg-tertiary/20 border border-border-subtle rounded cursor-pointer hover:border-text-tertiary transition-colors">
                                        <span className="text-[11px] font-bold text-text-secondary group-hover:text-text-main transition-colors">{doc.name}</span>
                                        <Download size={14} className="text-text-tertiary" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 bg-bg-quaternary/30 border border-border-subtle rounded-sm flex gap-3">
                            <AlertCircle size={16} className="text-text-tertiary shrink-0" />
                            <p className="text-[10px] text-text-tertiary leading-tight">
                                Aislamiento de Privacidad: Solo tú y el creador tienen acceso a esta URL única. No compartas este link con terceros.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="h-20 border-t border-border-subtle bg-bg-secondary flex items-center justify-center p-8">
                <p className="text-[10px] font-jetbrains text-text-tertiary uppercase tracking-widest">
                    CreatorOS Portal · Potenciado por YouTube Studio Pro Architecture
                </p>
            </footer>
        </div>
    );
}
