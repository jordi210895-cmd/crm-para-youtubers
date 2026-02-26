import React, { useState, Component } from 'react';
import { Youtube, RefreshCw, BarChart2, Users, Eye, Activity, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// 1. ERROR BOUNDARY
// Esto evita que toda la pantalla se ponga negra si algo falla dentro de Analytics
class AnalyticsErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Error capturado en Analytics:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 h-full flex items-center justify-center animate-fade-up">
                    <div className="glass-card p-8 border-yt-red/30 bg-yt-red/5 max-w-md w-full text-center">
                        <AlertTriangle size={48} className="text-yt-red mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-text-main mb-2">Error al cargar datos</h2>
                        <p className="text-xs text-text-secondary mb-4">
                            Ha ocurrido un problema inesperado al mostrar las analíticas.
                        </p>
                        <p className="text-[10px] text-text-tertiary font-jetbrains break-all bg-bg-main p-2 rounded">
                            {this.state.error?.toString()}
                        </p>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

// 2. COMPONENTE PRINCIPAL (SOLO LÓGICA DE ESTADO)
export default function AnalyticsDashboard() {
    return (
        <AnalyticsErrorBoundary>
            <AnalyticsContent />
        </AnalyticsErrorBoundary>
    );
}

// 3. CONTENIDO REAL (Protegido por el Error Boundary)
function AnalyticsContent() {
    // Usamos catch para evitar que el destructuring rompa si auth falla
    const auth = useAuth() || {};
    const signInWithGoogle = auth.signInWithGoogle;
    const user = auth.user;

    const [isConnecting, setIsConnecting] = useState(false);

    // LÓGICA DE VERIFICACIÓN ESTRICTA
    // Solo asumimos que está conectado si existe el user Y tiene el objeto youtube_stats
    const ytStats = user?.user_metadata?.youtube_stats;
    const isConnected = !!ytStats;

    const handleConnect = async () => {
        if (!signInWithGoogle) {
            alert("El servicio de autenticación no está disponible en este momento.");
            return;
        }

        setIsConnecting(true);
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error('Error connecting YouTube:', error);
            alert('Error al conectar con YouTube. Revisa la consola.');
        } finally {
            setIsConnecting(false);
        }
    };

    // VISTA 1: NO CONECTADO (Botón grande)
    if (!isConnected) {
        return (
            <div className="h-full min-h-[70vh] flex flex-col items-center justify-center p-8 animate-fade-up">
                <div className="max-w-md w-full glass-card p-12 text-center space-y-8 border-2 border-yt-red/10">
                    <div className="w-24 h-24 bg-yt-red/10 rounded-full flex items-center justify-center mx-auto mb-2 border border-yt-red/20">
                        <Youtube size={48} className="text-yt-red" />
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-3xl font-barlow-condensed font-black uppercase tracking-tighter text-text-main leading-none">
                            Conecta tu <span className="text-yt-red">Canal</span>
                        </h2>
                        <p className="text-sm text-text-secondary leading-relaxed">
                            Aún no has vinculado tu cuenta de YouTube. Conéctala para ver tus estadísticas reales aquí.
                        </p>
                    </div>

                    <button
                        onClick={handleConnect}
                        disabled={isConnecting}
                        className="w-full py-6 flex items-center justify-center gap-3 bg-yt-red hover:bg-yt-red-dark text-white rounded font-black text-lg uppercase tracking-tight transition-all active:scale-95"
                    >
                        {isConnecting ? (
                            <RefreshCw size={24} className="animate-spin" />
                        ) : (
                            <Youtube size={24} />
                        )}
                        {isConnecting ? 'Conectando...' : 'Conectar con YouTube'}
                    </button>

                    <p className="text-[10px] text-text-tertiary uppercase tracking-widest font-bold">
                        Requiere permisos de solo lectura (youtube.readonly)
                    </p>
                </div>
            </div>
        );
    }

    // VISTA 2: CONECTADO (Con Optional Chaining extremo)
    return (
        <div className="p-8 space-y-8 animate-fade-up">
            <header className="flex justify-between items-end border-b border-border-subtle pb-6">
                <div>
                    <h2 className="text-3xl font-barlow-condensed font-black uppercase tracking-tighter text-text-main">
                        Channel <span className="text-yt-red">Analytics</span>
                    </h2>
                    <p className="text-xs text-text-tertiary mt-1 uppercase tracking-widest font-bold">Resumen de rendimiento en tiempo real</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-2 text-yt-red">
                        <Users size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Suscriptores</span>
                    </div>
                    <div className="text-3xl font-black font-barlow-condensed uppercase tracking-tighter text-text-main">
                        {ytStats?.subscriberCount ? Number(ytStats?.subscriberCount).toLocaleString() : "—"}
                    </div>
                </div>

                <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-2 text-blue-500">
                        <Eye size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Vistas Totales</span>
                    </div>
                    <div className="text-3xl font-black font-barlow-condensed uppercase tracking-tighter text-text-main">
                        {ytStats?.viewCount ? Number(ytStats?.viewCount).toLocaleString() : "—"}
                    </div>
                </div>

                <div className="glass-card p-6">
                    <div className="flex items-center gap-3 mb-2 text-green-500">
                        <Activity size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Videos Publicados</span>
                    </div>
                    <div className="text-3xl font-black font-barlow-condensed uppercase tracking-tighter text-text-main">
                        {ytStats?.videoCount ? Number(ytStats?.videoCount).toLocaleString() : "—"}
                    </div>
                </div>
            </div>

            <div className="glass-card p-12 text-center border-dashed">
                <BarChart2 size={32} className="text-text-tertiary/20 mx-auto mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">
                    Las gráficas detalladas se cargarán cuando haya suficientes datos históricos.
                </p>
            </div>
        </div>
    );
}
