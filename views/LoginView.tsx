import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { positions, departments, employeeTypes } from '../utils/formData';

const LoginForm: React.FC = () => {
    const { login } = useApp();
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const success = await login(name, password);
        if (!success) {
            setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        }
        setIsLoading(false);
    };

    return (
        <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">{error}</div>}
            <div className="space-y-4">
                <div>
                    <label htmlFor="login-username">Username (สำหรับ Login):</label>
                    <input id="login-username" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                    <label htmlFor="login-password">รหัสผ่าน:</label>
                    <input id="login-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
            </div>
            <div>
                <button type="submit" disabled={isLoading} className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400">
                    {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
                </button>
            </div>
        </form>
    );
};

const RegisterForm: React.FC = () => {
    const { addUser } = useApp();
    const [name, setName] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [password, setPassword] = useState('');
    const [position, setPosition] = useState('');
    const [department, setDepartment] = useState('');
    const [employeeType, setEmployeeType] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        await addUser({ name: name, password, position, department, employeeType });
        // The context handles login, so no need to do anything else here.
        setIsLoading(false);
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
                <label htmlFor="reg-username">Username (สำหรับ Login):</label>
                <input id="reg-username" type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
                <label htmlFor="reg-displayName">ชื่อ-นามสกุล (ที่แสดงในระบบ):</label>
                <input id="reg-displayName" type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} required className="mt-1 w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
                <label htmlFor="reg-password">รหัสผ่าน:</label>
                <input id="reg-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1 w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
                <label htmlFor="reg-position">ตำแหน่ง:</label>
                <select id="reg-position" value={position} onChange={e => setPosition(e.target.value)} required className="mt-1 w-full px-3 py-2 border rounded-md bg-white">
                    <option value="">-- กรุณาเลือกตำแหน่ง --</option>
                    {positions.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="reg-employeeType">ประเภทเจ้าหน้าที่:</label>
                <select id="reg-employeeType" value={employeeType} onChange={e => setEmployeeType(e.target.value)} required className="mt-1 w-full px-3 py-2 border rounded-md bg-white">
                    <option value="">-- กรุณาเลือกประเภท --</option>
                    {employeeTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="reg-department">หน่วยงาน/แผนก:</label>
                <select id="reg-department" value={department} onChange={e => setDepartment(e.target.value)} required className="mt-1 w-full px-3 py-2 border rounded-md bg-white">
                    <option value="">-- กรุณาเลือกหน่วยงาน --</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            </div>
            <button type="submit" disabled={isLoading} className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400">
                {isLoading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}
            </button>
        </form>
    );
};


const LoginView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
            <div className="w-full max-w-md p-6 sm:p-8 space-y-6 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">ระบบยืมคอมพิวเตอร์</h2>
                </div>
                <div>
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                            <button onClick={() => setActiveTab('login')} className={`${activeTab === 'login' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                                เข้าสู่ระบบ
                            </button>
                            <button onClick={() => setActiveTab('register')} className={`${activeTab === 'register' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                                ลงทะเบียนผู้ใช้ใหม่
                            </button>
                        </nav>
                    </div>
                    <div className="pt-6">
                        {activeTab === 'login' ? <LoginForm /> : <RegisterForm />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginView;