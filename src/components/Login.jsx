import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    LogIn,
    UserPlus,
    Mail,
    Lock,
    AlertCircle,
    ArrowRight,
    ShieldCheck
} from 'lucide-react';

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { signIn, signUp } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (isLogin) {
                const { error } = await signIn({ email, password });
                if (error) throw error;
            } else {
                const { error } = await signUp({
                    email,
                    password,
                    options: {
                        data: {
                            role: 'admin', // Default role for registration
                        }
                    }
                });
                if (error) throw error;
                alert('Revisa tu email para confirmar la cuenta.');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg-main flex items-center justify-center p-6 font-barlow">
            <div className="max-w-md w-full space-y-8 animate-fade-up">
                {/* Logo */}
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-yt-red rounded-2xl mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(255,0,0,0.3)]">
                        <ShieldCheck size={40} className="text-white" />
                    </div>
                    <h1 className="text-4xl font-barlow-condensed font-black uppercase tracking-tighter text-text-main">
                        Creator<span className="text-yt-red">OS</span>
                    </h1>
                    <p className="text-xs text-text-tertiary uppercase tracking-[0.2em] font-bold">Inicia sesión en tu base de operaciones</p>
                </div>

                <div className="glass-card p-8 bg-bg-secondary/50 backdrop-blur-xl border-border-subtle shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-yt-red transition-colors" size={16} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-bg-main border border-border-subtle rounded py-3 pl-10 pr-4 text-sm text-text-main focus:outline-none focus:border-text-tertiary transition-colors"
                                    placeholder="tu@email.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Contraseña</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-yt-red transition-colors" size={16} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-bg-main border border-border-subtle rounded py-3 pl-10 pr-4 text-sm text-text-main focus:outline-none focus:border-text-tertiary transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-yt-red/10 border border-yt-red/20 rounded flex gap-3 animate-shake">
                                <AlertCircle className="text-yt-red shrink-0" size={18} />
                                <p className="text-xs text-yt-red font-medium">{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full yt-btn py-4 flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
                                    <span className="text-sm">
                                        {isLogin ? 'Acceder al Studio' : 'Crear Cuenta de Creador'}
                                    </span>
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="flex-1 h-px bg-border-subtle"></div>
                            <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">o continúa con</span>
                            <div className="flex-1 h-px bg-border-subtle"></div>
                        </div>

                        <button
                            onClick={() => useAuth().signInWithGoogle()}
                            className="w-full bg-white text-black font-bold py-3 px-4 rounded flex items-center justify-center gap-3 transition-all hover:bg-gray-100"
                        >
                            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            <span className="text-sm">Google</span>
                        </button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-border-subtle text-center">

                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-xs font-bold text-text-tertiary hover:text-text-main transition-colors uppercase tracking-widest"
                        >
                            {isLogin ? '¿No tienes cuenta? Registrate' : '¿Ya tienes cuenta? Ingresa'}
                        </button>
                    </div>
                </div>

                <p className="text-center text-[10px] text-text-tertiary uppercase tracking-widest">
                    Sinfonía de producción & business · CreatorOS v1.0
                </p>
            </div>
        </div>
    );
}
