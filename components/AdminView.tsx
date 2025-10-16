import React, { useState } from 'react';
import BookingCalendar from './BookingCalendar';
import ManageUsers from './ManageUsers';
import ManageComputers from './ManageComputers';
import BookingHistory from './BookingHistory';
import { DashboardIcon } from './icons/DashboardIcon';
import { HistoryIcon } from './icons/HistoryIcon';
import { UserIcon } from './icons/UserIcon';
import { ComputerIcon } from './icons/ComputerIcon';

type AdminTab = 'dashboard' | 'history' | 'users' | 'computers';

const AdminView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <BookingCalendar />;
            case 'history':
                return <BookingHistory />;
            case 'users':
                return <ManageUsers />;
            case 'computers':
                return <ManageComputers />;
            default:
                return null;
        }
    };
    
    const TabButton: React.FC<{tabName: AdminTab, label: string, icon: React.ReactNode}> = ({ tabName, label, icon }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tabName
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-200'
            }`}
        >
            {icon}
            {label}
        </button>
    );

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-900">Admin Dashboard</h2>
            <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-200">
                <div className="flex flex-wrap items-center gap-2">
                    <TabButton tabName="dashboard" label="ภาพรวมปฏิทิน" icon={<DashboardIcon />} />
                    <TabButton tabName="history" label="ประวัติการจอง" icon={<HistoryIcon />} />
                    <TabButton tabName="users" label="จัดการผู้ใช้" icon={<UserIcon className="h-5 w-5"/>} />
                    <TabButton tabName="computers" label="จัดการคอมพิวเตอร์" icon={<ComputerIcon className="h-5 w-5"/>} />
                </div>
            </div>
            
            <div className="mt-6">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default AdminView;