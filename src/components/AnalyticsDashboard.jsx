import React, { useState, useEffect } from 'react';
import { BarChart2, Users, Eye, Activity, Youtube, TrendingUp, Calendar, Globe, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AnalyticsDashboard() {
    const { session, signInWithGoogle } = useAuth();
    const [channelData, setChannelData] = useState(null);
    const [loadingStats, setLoadingStats] = useState(false);

    // Check if we have a Google Provider token
    const isConnected = !!session?.provider_token;

    useEffect(() => {
        if (isConnected && session.provider_token) {
            fetchChannelStats();
        }
    }, [isConnected, session]);

    const fetchChannelStats = async () => {
        setLoadingStats(true);
        try {
            const response = await fetch('https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&mine=true', {
                headers: {
                    Authorization: `Bearer ${session.provider_token}`,
                },
            });
            const data = await response.json();

            if (data.items && data.items.length > 0) {
                setChannelData(data.items[0]);
            } else {
                console.warn("No YouTube channel found for this Google Account.");
            }
        } catch (error) {
            console.error("Error fetching YouTube stats:", error);
        } finally {
            setLoadingStats(false);
        }
    };

    const handleConnectClick = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error("Error connecting to Google:", error);
        }
    };

    if (!isConnected) {
        return (
            <div className="p-4 md:p-8 h-full flex flex-col items-center justify-center animate-fade-up">
                <div className="max-w-md w-full glass-card p-6 md:p-10 text-center space-y-6">
                    <div className="w-20 h-20 bg-yt-red/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-yt-red/20">
                        <Youtube size={32} className="text-yt-red" />
                    </div>

                    <h2 className="text-3xl font-barlow-condensed font-black uppercase tracking-tighter text-white">
                        Conecta tu Canal
                    </h2>

                    <p className="text-gray-400 text-sm leading-relaxed">
                        CreatorOS necesita acceder a tus analíticas de YouTube en modo lectura para generar los informes y proyecciones de ingresos.
                    </p>

                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded p-4 flex items-start text-left gap-3">
                        <AlertCircle className="text-yellow-500 mt-0.5 shrink-0" size={16} />
                        <div className="space-y-2">
                            <p className="text-xs text-yellow-500/90 leading-relaxed">
                                <strong>Atención Beta Testers:</strong> Durante la fase de prueba, Google mostrará una alerta de seguridad roja. Por favor haz clic en "Configuración Avanzada" {'>'} "Ir a la app (inseguro)" para continuar.
                            </p>
                            <p className="text-[10px] text-yellow-500/70 border-t border-yellow-500/20 pt-2 mt-2">
                                <strong>¿Te sigue saliendo esta pantalla?</strong> Supabase requiere que inicies sesión directamente con Google. Cierra tu sesión actual de correo y vuelve a entrar usando exclusivamente el botón "Vincular con Google".
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleConnectClick}
                        className="w-full bg-white text-black font-black uppercase tracking-widest text-sm py-4 rounded hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 mt-4 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    >
                        {/* Google Icon SVG */}
                        <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Vincular con Google
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-6 md:space-y-8 animate-fade-up pb-24 md:pb-8">
            {/* Cabecera */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-subtle pb-6">
                <div>
                    <h2 className="text-3xl font-barlow-condensed font-black uppercase tracking-tighter text-text-main flex items-center gap-2">
                        {channelData ? channelData.snippet.title : 'Channel'} <span className="text-yt-red">Analytics</span>
                    </h2>
                    <p className="text-xs text-text-tertiary mt-1 uppercase tracking-widest font-bold">Datos en Tiempo Real</p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-bg-secondary border border-border-subtle rounded text-xs font-bold text-text-secondary hover:text-text-main transition-colors flex items-center gap-2">
                        <Calendar size={14} />
                        Histórico Total
                    </button>
                    <button
                        onClick={fetchChannelStats}
                        disabled={loadingStats}
                        className={`px-4 py-2 bg-yt-red text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-yt-red-dark transition-colors flex items-center gap-2 shadow-lg shadow-yt-red/20 ${loadingStats ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Youtube size={14} />
                        {loadingStats ? 'Sincronizando...' : 'Actualizar Datos'}
                    </button>
                </div>
            </header>

            {/* Tarjetas de Estadísticas Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={<Users size={16} />}
                    label="Suscriptores Totales"
                    value={channelData ? new Intl.NumberFormat('es-ES').format(channelData.statistics.subscriberCount) : '...'}
                    trend="Real"
                    trendUp={true}
                    colorClass="text-yt-red"
                    bgClass="bg-yt-red/10"
                />
                <StatCard
                    icon={<Eye size={16} />}
                    label="Vistas Totales"
                    value={channelData ? new Intl.NumberFormat('es-ES').format(channelData.statistics.viewCount) : '...'}
                    trend="Real"
                    trendUp={true}
                    colorClass="text-blue-500"
                    bgClass="bg-blue-500/10"
                />
                <StatCard
                    icon={<Activity size={16} />}
                    label="Retención Media"
                    value="48.2%"
                    trend="-1.2%"
                    trendUp={false}
                    colorClass="text-yellow-500"
                    bgClass="bg-yellow-500/10"
                />
                <StatCard
                    icon={<Globe size={16} />}
                    label="Ingresos Estimados"
                    value="$12,450"
                    trend="+8%"
                    trendUp={true}
                    colorClass="text-green-500"
                    bgClass="bg-green-500/10"
                />
            </div>

            {/* Sección Inferior simulando gráficos y tablas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Gráfico Principal (Espacio reservado visualmente) */}
                <div className="glass-card p-6 lg:col-span-2 flex flex-col min-h-[350px]">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-text-secondary">Evolución de Vistas</h3>
                        <BarChart2 size={16} className="text-text-tertiary" />
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border-subtle rounded-lg bg-bg-secondary/30 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-t from-bg-tertiary/20 to-transparent"></div>
                        <BarChart2 size={48} className="text-text-tertiary/30 mb-4 group-hover:scale-110 transition-transform duration-500" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary bg-bg-main px-4 py-2 rounded-full border border-border-subtle z-10 shadow-lg">
                            Área reservada para gráfica (Recharts/Chart.js)
                        </p>
                    </div>
                </div>

                {/* Lista de Top Videos */}
                <div className="glass-card p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-text-secondary">Top Videos</h3>
                        <TrendingUp size={16} className="text-text-tertiary" />
                    </div>

                    <div className="flex-1 space-y-4">
                        <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed border-border-subtle rounded-lg bg-bg-tertiary/10 group-hover:border-yt-red/30 transition-colors">
                            <TrendingUp size={24} className="text-text-tertiary mb-3 group-hover:text-yt-red/50 transition-colors" />
                            <p className="text-text-tertiary text-[10px] uppercase font-black tracking-widest">Sin datos de rendimiento</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, trend, trendUp, colorClass, bgClass }) {
    return (
        <div className="glass-card p-5 group hover:border-border-hover transition-colors">
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-start">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bgClass} ${colorClass}`}>
                        {icon}
                    </div>
                    <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${trendUp ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {trendUp ? '↑' : '↓'} {trend}
                    </div>
                </div>

                <div>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-text-tertiary mb-1">{label}</h3>
                    <div className="text-3xl font-black font-barlow-condensed uppercase tracking-tighter text-text-main leading-none">
                        {value}
                    </div>
                </div>
            </div>
        </div>
    );
}
