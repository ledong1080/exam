import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, Loader2, ShieldCheck, GraduationCap } from 'lucide-react';
import { authService } from '../services/mockAuth';
import { User as UserType } from '../types';

interface LoginModalProps {
    onClose: () => void;
    onLoginSuccess: (user: UserType) => void;
}

export const LoginModal = ({ onClose, onLoginSuccess }: LoginModalProps) => {
    const [role, setRole] = useState<'teacher' | 'student'>('student');
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Trim inputs before sending
            const user = await authService.login(identifier.trim(), password.trim(), role);
            if (user) {
                onLoginSuccess(user);
                onClose();
            }
        } catch (err: any) {
            setError(err.message || 'Đăng nhập thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in font-poppins">
            <div className="bg-white w-full max-w-[420px] rounded-[30px] shadow-2xl p-8 relative overflow-hidden">
                {/* Decoration */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-teal-400"></div>

                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-teal-400 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200 transform rotate-3">
                        <Lock className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-3xl font-black text-gray-800 tracking-tight">Đăng nhập quản trị</h2>
                    <p className="text-gray-500 text-sm mt-1">Dành cho giáo viên và quản trị viên hệ thống</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    
                    {/* Role Tabs */}
                    <div className="bg-gray-100 p-1.5 rounded-2xl flex gap-1 mb-6">
                        <button 
                            type="button"
                            onClick={() => setRole('student')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${role === 'student' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <User className="w-4 h-4" /> Học sinh
                        </button>
                        <button 
                            type="button"
                            onClick={() => setRole('teacher')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${role === 'teacher' ? 'bg-white text-teal-600 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <ShieldCheck className="w-4 h-4" /> Giáo viên
                        </button>
                    </div>

                    {error && (
                        <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold text-center animate-pulse">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 ml-1">Tên đăng nhập / Email</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type="text"
                                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 font-bold focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all placeholder-gray-400"
                                placeholder={role === 'teacher' ? "admin" : "hs1"}
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 ml-1">Mật khẩu</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-800 font-bold focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all placeholder-gray-400"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                        <label className="flex items-center">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 accent-blue-500" />
                            <span className="ml-2 text-sm text-gray-600 font-medium">Ghi nhớ đăng nhập</span>
                        </label>
                        <a href="#" className="text-sm font-bold text-blue-500 hover:text-blue-700">Quên mật khẩu?</a>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 rounded-2xl font-black text-white text-lg shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 mt-4
                            ${role === 'teacher' 
                                ? 'bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700' 
                                : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                            }
                        `}
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Đăng nhập'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm font-bold">
                        Quay lại trang chủ
                    </button>
                </div>
            </div>
        </div>
    );
};