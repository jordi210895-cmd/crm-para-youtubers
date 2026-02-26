import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
    Mail,
    Lock,
    UserPlus,
    LogIn,
    AlertCircle,
    ArrowRight,
    ShieldCheck
} from 'lucide-react';

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [successMessage, setSuccessMessage] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const { signIn, signUp } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage('');
        setLoading(true);

        try {
            if (isLogin) {
                const { error: signInError } = await signIn({ email, password });
                if (signInError) throw signInError;
            } else {
                const { error: signUpError, data } = await signUp({
                    email,
                    password,
                    options: {
                        data: {
                            role: 'creador',
                        }
                    }
                });

                if (signUpError) throw signUpError;

                // Supabase note: If "Confirm Email" is OFF, 'data.session' will exist and the user is logged in.
                if (data?.session) {
                    setSuccessMessage('¡Registro exitoso! Accediendo al Studio...');
                } else {
                    setSuccessMessage('¡Cuenta creada! Por favor, ve a tu bandeja de entrada (Gmail) y haz clic en el enlace de confirmación para finalizar el registro.');
                    setIsLogin(true);
                    setEmail('');
                    setPassword('');
                }
            }
        } catch (err) {
            console.error('Auth Error:', err);
            setError(err.message === 'Failed to fetch'
                ? 'Error de conexión. Verifica tu conexión a internet.'
                : err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center p-6 font-barlow">
            <div className="max-w-md w-full space-y-8">
                {/* Logo Section */}
                <div className="text-center space-y-2">
                    <div className="w-16 h-16 bg-[#ff0000] rounded-2xl mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(255,0,0,0.3)]">
                        <ShieldCheck size={40} className="text-white" />
                    </div>
                    <h1 className="text-4xl font-bold uppercase tracking-tighter text-white">
                        Creator<span className="text-[#ff0000]">OS</span>
                    </h1>
                    <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">
                        {isLogin ? 'Inicia sesión en tu Studio' : 'Registro de nuevos Creadores'}
                    </p>
                </div>

                <div className="bg-[#1e1e1e] border border-[#333] p-8 rounded-xl shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#ff0000] transition-colors" size={16} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-[#121212] border border-[#333] rounded-lg py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-gray-500 transition-colors"
                                    placeholder="tu@email.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Contraseña</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#ff0000] transition-colors" size={16} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#121212] border border-[#333] rounded-lg py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-gray-500 transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg flex gap-3 items-center">
                                <AlertCircle className="text-red-500 shrink-0" size={18} />
                                <p className="text-xs text-red-500 font-medium">{error}</p>
                            </div>
                        )}

                        {successMessage && (
                            <div className="p-4 bg-green-900/20 border border-green-500/50 rounded-lg flex gap-3 items-center">
                                <ShieldCheck className="text-green-500 shrink-0" size={18} />
                                <p className="text-xs text-green-500 font-medium">{successMessage}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#ff0000] hover:bg-[#cc0000] text-white py-4 rounded-lg flex items-center justify-center gap-2 group disabled:opacity-50 transition-all font-bold"
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

                    <div className="mt-8 pt-6 border-t border-[#333] text-center">
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-xs font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-widest"
                        >
                            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Ingresa'}
                        </button>
                    </div>
                </div>

                <p className="text-center text-[10px] text-gray-500 uppercase tracking-widest">
                    CreatorOS v1.0 · Sistema de Gestión para YouTubers
                </p>
            </div>
        </div>
    );
}
