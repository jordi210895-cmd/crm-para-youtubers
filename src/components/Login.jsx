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
