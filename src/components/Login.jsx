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
    const [error, setError] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn, signUp, signInWithGoogle } = useAuth();

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError(null);
        try {
            await signInWithGoogle();
        } catch (err) {
            console.error('Google Auth Error:', err);
            setError('Error al conectar con Google.');
            setLoading(false);
        }
    };

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

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-[#333]"></div>
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                            <span className="px-2 bg-[#1e1e1e] text-gray-500">O continúa con</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        disabled={loading}
                        onClick={handleGoogleSignIn}
                        className="w-full bg-white hover:bg-gray-200 text-black py-4 rounded-lg flex items-center justify-center gap-2 group disabled:opacity-50 transition-all font-bold"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span className="text-sm">Vincular con Google (YouTube)</span>
                    </button>

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
