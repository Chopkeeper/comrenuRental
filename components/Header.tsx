import React from 'react';
import { useApp } from '../contexts/AppContext';
import { UserIcon } from './icons/UserIcon';
import { ComputerIcon } from './icons/ComputerIcon';

const Header: React.FC = () => {
    const { currentUser, logout } = useApp();

    return (
        <header className="bg-white shadow-md">
            <div className="container mx-auto px-4 sm:px-6 md:px-8 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <ComputerIcon className="h-8 w-8 text-indigo-600" />
                    <h1 className="text-2xl font-bold text-slate-800">
                        Computer Rental System
                    </h1>
                </div>
                {currentUser && (
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                           <UserIcon className="h-6 w-6 text-slate-500" />
                           <span className="font-medium text-slate-700">Welcome, {currentUser.name}</span>
                        </div>
                        <button
                            onClick={logout}
                            className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 transition text-sm font-semibold"
                            aria-label="Logout"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
