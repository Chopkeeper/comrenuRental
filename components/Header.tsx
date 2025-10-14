
import React from 'react';
import { useApp } from '../contexts/AppContext';
import { UserIcon } from './icons/UserIcon';
import { ComputerIcon } from './icons/ComputerIcon';

const Header: React.FC = () => {
    const { users, currentUser, setCurrentUser } = useApp();

    const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedUser = users.find(u => u.id === e.target.value);
        if (selectedUser) {
            setCurrentUser(selectedUser);
        }
    };

    return (
        <header className="bg-white shadow-md">
            <div className="container mx-auto px-4 sm:px-6 md:px-8 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <ComputerIcon className="h-8 w-8 text-indigo-600" />
                    <h1 className="text-2xl font-bold text-slate-800">
                        Computer Rental System
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <UserIcon className="h-6 w-6 text-slate-500" />
                    <select
                        value={currentUser?.id || ''}
                        onChange={handleUserChange}
                        className="p-2 border border-slate-300 rounded-md bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    >
                        {users.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.name} ({user.role})
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </header>
    );
};

export default Header;
