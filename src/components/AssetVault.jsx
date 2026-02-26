import React from 'react';
import {
    Folder,
    File,
    Image as ImageIcon,
    Link as LinkIcon,
    Upload,
    MoreVertical,
    Plus
} from 'lucide-react';

export default function AssetVault() {
    const folders = [];

    const recentAssets = [];

    return (
        <div className="p-8 space-y-8 animate-fade-up">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-barlow-condensed font-black uppercase tracking-tighter text-text-main">
                        Asset <span className="text-yt-red">Vault</span>
                    </h2>
                    <p className="text-xs text-text-tertiary mt-1">Gestor de archivos y biblioteca global de producción.</p>
                </div>
                <button className="yt-btn flex items-center gap-2">
                    <Upload size={14} /> Subir Archivo
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {folders.map((folder, i) => (
                    <div key={i} className="glass-card p-6 flex items-center gap-4 cursor-pointer group">
                        <div className={`w-12 h-12 rounded bg-bg-tertiary flex items-center justify-center ${folder.color} border border-border-subtle group-hover:border-text-tertiary/30 transition-colors`}>
                            <folder.icon size={24} />
                        </div>
                        <div>
                            <div className="text-sm font-bold text-text-main uppercase tracking-tight">{folder.name}</div>
                            <div className="text-[10px] text-text-tertiary font-jetbrains">{folder.count} archivos</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-text-tertiary border-b border-border-subtle pb-2">Archivos Recientes</h3>
                <div className="glass-card divide-y divide-border-subtle">
                    {recentAssets.map((asset, i) => (
                        <div key={i} className="p-4 flex items-center gap-4 hover:bg-bg-tertiary/20 transition-colors group">
                            <div className="w-10 h-10 rounded bg-bg-tertiary flex items-center justify-center border border-border-subtle">
                                {asset.type === 'image' ? <ImageIcon size={18} className="text-blue-400" /> : asset.type === 'link' ? <LinkIcon size={18} className="text-green-400" /> : <File size={18} className="text-text-secondary" />}
                            </div>
                            <div className="flex-1">
                                <div className="text-xs font-bold text-text-main">{asset.name}</div>
                                <div className="text-[9px] text-text-tertiary mt-0.5">{asset.size} • {asset.date}</div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button className="yt-btn-ghost py-1 px-3 text-[9px]">Descargar</button>
                                <MoreVertical size={14} className="text-text-tertiary" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
