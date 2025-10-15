import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { ComputerIcon } from '../components/icons/ComputerIcon';

const LoginView: React.FC = () => {
    const { users, setCurrentUser } = useApp();
    const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || '');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const userToLogin = users.find(u => u.id === selectedUserId);
        if (userToLogin) {
            setCurrentUser(userToLogin);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100">
            <div className="p-8 bg-white rounded-lg shadow-xl w-full max-w-sm">
                <div className="flex flex-col items-center mb-6">
                    <ComputerIcon className="h-12 w-12 text-indigo-600 mb-2" />
                    <h2 className="text-2xl font-bold text-center text-slate-800">
                        Computer Rental System
                    </h2>
                </div>
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label htmlFor="user-select" className="block text-sm font-medium text-slate-700 mb-2">Select user to login</label>
                        <select
                            id="user-select"
                            value={selectedUserId}
                            onChange={e => setSelectedUserId(e.target.value)}
                            className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                            aria-label="Select user to login"
                        >
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.name} ({user.role})
                                </option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition font-semibold">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginView;
