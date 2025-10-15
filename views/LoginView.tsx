import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { ComputerIcon } from '../components/icons/ComputerIcon';

const LoginView: React.FC = () => {
    const { login } = useApp();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const success = await login(username, password);
        if (!success) {
            setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        }
        setIsLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100">
            <div className="p-8 bg-white rounded-lg shadow-xl w-full max-w-sm">
                <div className="flex flex-col items-center mb-6">
                    <ComputerIcon className="h-12 w-12 text-indigo-600 mb-2" />
                    <h2 className="text-2xl font-bold text-center text-slate-800">
                        ระบบเช่ายืมคอมพิวเตอร์
                    </h2>
                    <p className="text-sm text-slate-500 mt-2">กรุณาเข้าสู่ระบบเพื่อใช้งานต่อ</p>
                </div>
                <form onSubmit={handleLogin}>
                    {error && <p className="text-red-500 text-xs text-center mb-4 bg-red-50 p-2 rounded-md">{error}</p>}
                    <div className="mb-4">
                        <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1">ชื่อผู้ใช้</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            aria-label="Username"
                            placeholder="เช่น ผู้ดูแลระบบ หรือ อลิซ"
                            required
                            disabled={isLoading}
                        />
                    </div>
                     <div className="mb-6">
                        <label htmlFor="password"className="block text-sm font-medium text-slate-700 mb-1">รหัสผ่าน</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            aria-label="Password"
                            placeholder="••••••••"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginView;
