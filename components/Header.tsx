
import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import ChangePasswordModal from './ChangePasswordModal';
import { KeyIcon } from './icons/KeyIcon';

const Header: React.FC = () => {
    const { currentUser, logout } = useApp();
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    return (
        <>
            <header className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <h1 className="text-2xl font-bold text-slate-800">ระบบยืมคอมพิวเตอร์ พัฒนาโดย นายนิเทศก์ บัวสาย</h1>
                        {currentUser && (
                            <div className="flex items-center gap-4">
                                <span className="text-slate-600">ยินดีต้อนรับ, <span className="font-semibold">{currentUser.name}</span>!</span>
                                <button
                                    onClick={() => setIsPasswordModalOpen(true)}
                                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-indigo-600 transition"
                                    title="เปลี่ยนรหัสผ่าน"
                                >
                                    <KeyIcon className="h-5 w-5" />
                                    <span>เปลี่ยนรหัสผ่าน</span>
                                </button>
                                <button
                                    onClick={logout}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition text-sm font-medium"
                                >
                                    ออกจากระบบ
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>
            <ChangePasswordModal 
                isOpen={isPasswordModalOpen} 
                onClose={() => setIsPasswordModalOpen(false)} 
            />
        </>
    );
};

export default Header;