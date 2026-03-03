import React, { useRef, useState, useEffect } from 'react';
import {
    Folder,
    File,
    Image as ImageIcon,
    Link as LinkIcon,
    Upload,
    MoreVertical,
    Plus,
    Loader2,
    X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function AssetVault({ showToast }) {
    const { user } = useAuth();
    const fileInputRef = useRef(null);
    const [assets, setAssets] = useState([]);
    const [videos, setVideos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);

    // Upload Modal State
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedVideoId, setSelectedVideoId] = useState('');

    const folders = [];

    useEffect(() => {
        if (user) {
            fetchAssetsAndVideos();
        }
    }, [user]);

    const fetchAssetsAndVideos = async () => {
        setIsLoading(true);
        try {
            // Fetch videos for the upload selector
            const videosRes = await supabase.from('videos').select('id, title').eq('creator_id', user?.id);
            if (videosRes.error) throw videosRes.error;
            if (videosRes.data) setVideos(videosRes.data);

            // Fetch assets
            if (videosRes.data && videosRes.data.length > 0) {
                const videoIds = videosRes.data.map(v => v.id);
                const assetsRes = await supabase.from('assets').select('*, video:videos(title)').in('video_id', videoIds).order('created_at', { ascending: false });
                if (assetsRes.error) throw assetsRes.error;
                if (assetsRes.data) setAssets(assetsRes.data);
            }
        } catch (error) {
            console.error("Error fetching vault data:", error);
            showToast(error.message || "Error cargando los archivos.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
            setIsUploadModalOpen(true);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const confirmUpload = async () => {
        if (!selectedFile || !selectedVideoId) return showToast("Selecciona un video al que pertenece el archivo.", "error");

        setIsUploading(true);
        const fileName = `${Date.now()}_${selectedFile.name.replace(/\s+/g, '_')}`;

        try {
            // 1. Upload to Supabase Storage Bucket 'vault'
            showToast("Subiendo archivo al servidor...", "info");
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('vault')
                .upload(`${user.id}/${fileName}`, selectedFile, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                if (uploadError.message.includes('Bucket not found')) {
                    // Provide clear instruction if bucket doesn't exist yet
                    throw new Error("El bucket 'vault' no existe en Supabase Storage. Debes crearlo público.");
                }
                throw uploadError;
            }

            // 2. Get Public URL
            const { data: publicUrlData } = supabase.storage.from('vault').getPublicUrl(`${user.id}/${fileName}`);

            // 3. Save to database
            const { error: dbError } = await supabase.from('assets').insert([{
                video_id: selectedVideoId,
                name: selectedFile.name,
                url: publicUrlData.publicUrl,
                type: selectedFile.type.startsWith('image/') ? 'image' : 'file'
            }]);

            if (dbError) throw dbError;

            showToast("Archivo subido y registrado con éxito.", "success");
            setIsUploadModalOpen(false);
            setSelectedFile(null);
            setSelectedVideoId('');
            fetchAssetsAndVideos(); // Refetch
        } catch (error) {
            console.error("Upload Error:", error);
            showToast(error.message || "Error al subir el archivo.", "error");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = null;
        }
    };

    const getFileSizeDisplay = (sizeInBytes) => {
        if (!sizeInBytes) return "Desconocido";
        const mb = sizeInBytes / (1024 * 1024);
        return mb > 1 ? `${mb.toFixed(2)} MB` : `${(sizeInBytes / 1024).toFixed(0)} KB`;
    };

    return (
        <div className="p-8 space-y-8 animate-fade-up">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-barlow-condensed font-black uppercase tracking-tighter text-text-main">
                        Asset <span className="text-yt-red">Vault</span>
                    </h2>
                    <p className="text-xs text-text-tertiary mt-1">Gestor de archivos y biblioteca global de producción.</p>
                </div>
                <button
                    onClick={handleUploadClick}
                    className="yt-btn flex items-center gap-2"
                >
                    <Upload size={14} /> Subir Archivo
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(!Array.isArray(folders) || folders.length === 0) ? (
                    <div className="col-span-1 md:col-span-3 p-8 text-center border-2 border-dashed border-border-subtle rounded-lg bg-bg-tertiary/10">
                        <p className="text-text-tertiary text-[10px] uppercase font-black tracking-widest">No hay carpetas creadas</p>
                    </div>
                ) : (
                    folders.map((folder, i) => (
                        <div key={i} className="glass-card p-6 flex items-center gap-4 cursor-pointer group">
                            <div className={`w-12 h-12 rounded bg-bg-tertiary flex items-center justify-center ${folder.color} border border-border-subtle group-hover:border-text-tertiary/30 transition-colors`}>
                                <folder.icon size={24} />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-text-main uppercase tracking-tight">{folder.name}</div>
                                <div className="text-[10px] text-text-tertiary font-jetbrains">{folder.count} archivos</div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-text-tertiary border-b border-border-subtle pb-2">Archivos Recientes</h3>
                <div className="glass-card divide-y divide-border-subtle">
                    {isLoading ? (
                        <div className="p-8 text-center text-text-tertiary">
                            <Loader2 className="animate-spin mx-auto" size={24} />
                        </div>
                    ) : (!Array.isArray(assets) || assets.length === 0) ? (
                        <div className="p-8 text-center">
                            <p className="text-text-tertiary text-[10px] uppercase font-black tracking-widest">No hay archivos recientes</p>
                        </div>
                    ) : (
                        assets.map((asset, i) => (
                            <div key={asset.id} className="p-4 flex items-center gap-4 hover:bg-bg-tertiary/20 transition-colors group">
                                <div className="w-10 h-10 rounded bg-bg-tertiary flex items-center justify-center border border-border-subtle overflow-hidden">
                                    {asset.type === 'image' && asset.url ?
                                        <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                                        :
                                        (asset.type === 'image' ? <ImageIcon size={18} className="text-blue-400" /> : <File size={18} className="text-text-secondary" />)
                                    }
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs font-bold text-text-main">{asset.name}</div>
                                    <div className="text-[9px] text-text-tertiary mt-0.5 font-jetbrains">
                                        {asset.video?.title || 'General'} • {new Date(asset.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <a
                                        href={asset.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="yt-btn-ghost py-1 px-3 text-[9px]"
                                    >
                                        Ver / Descargar
                                    </a>
                                    <MoreVertical size={14} className="text-text-tertiary" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div className="fixed inset-0 bg-bg-main/90 flex items-center justify-center p-4 z-50">
                    <div className="glass-card max-w-md w-full p-6 animate-fade-up">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-black uppercase font-barlow-condensed tracking-tighter">Vincular Archivo</h3>
                            <button onClick={() => {
                                setIsUploadModalOpen(false);
                                if (fileInputRef.current) fileInputRef.current.value = null;
                            }} className="text-text-tertiary hover:text-yt-red transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mb-4">
                            <p className="text-xs text-text-secondary">Estás subiendo: <span className="font-bold text-text-main">{selectedFile?.name}</span></p>
                            <p className="text-[10px] text-text-tertiary font-jetbrains mt-1">{getFileSizeDisplay(selectedFile?.size)}</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-text-tertiary mb-2">Selecciona el Video destino</label>
                                <select
                                    className="w-full bg-bg-main border border-border-subtle rounded p-3 text-sm text-text-main focus:border-yt-red transition-colors"
                                    value={selectedVideoId}
                                    onChange={(e) => setSelectedVideoId(e.target.value)}
                                >
                                    <option value="">(Requerido por base de datos)</option>
                                    {(Array.isArray(videos) ? videos : []).map(v => (
                                        <option key={v.id} value={v.id}>{v.title}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={confirmUpload}
                                disabled={isUploading || !selectedVideoId}
                                className="yt-btn w-full mt-6 py-3 flex justify-center disabled:opacity-50"
                            >
                                {isUploading ? <Loader2 className="animate-spin" size={16} /> : 'Subir y Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
