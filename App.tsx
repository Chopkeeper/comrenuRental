
import React from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import AdminView from './views/AdminView';
import UserView from './views/UserView';
import Header from './components/Header';
import LoginView from './views/LoginView';
import Footer from './components/Footer';

const ServerStatusOverlay: React.FC = () => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col justify-center items-center text-white p-8 text-center backdrop-blur-sm">
            <div className="bg-red-500/20 border border-red-500 rounded-full p-4 mb-6 animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h2 className="text-3xl font-bold mb-4">ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้</h2>
            <p className="max-w-xl mb-6 text-slate-300">ดูเหมือนว่ามีปัญหากับการเชื่อมต่อเซิร์ฟเวอร์หลังบ้าน (Backend) ทำให้แอปพลิเคชันไม่สามารถทำงานได้ในขณะนี้</p>
            <div className="bg-slate-800 border border-slate-700 p-4 rounded-lg text-left max-w-xl w-full">
                <h3 className="font-semibold text-lg mb-2 text-slate-100">ขั้นตอนการตรวจสอบสำหรับผู้ดูแลระบบ:</h3>
                <ul className="list-decimal list-inside space-y-2 text-slate-300">
                    <li>ตรวจสอบ Log การทำงานของ "Web Service" บน Render เพื่อหาข้อความ Error</li>
                    <li>
                        ตรวจสอบ Environment Variable ชื่อ <code className="bg-slate-900 text-yellow-400 px-1 py-0.5 rounded-sm">MONGO_URI</code> ว่าถูกต้อง 100%
                        (ชื่อผู้ใช้, รหัสผ่าน, ชื่อฐานข้อมูล)
                    </li>
                    <li>
                        ตรวจสอบการตั้งค่า "Network Access" ใน MongoDB Atlas ว่าได้เพิ่ม <code className="bg-slate-900 text-yellow-400 px-1 py-0.5 rounded-sm">0.0.0.0/0</code>
                        (Allow Access from Anywhere) แล้ว
                    </li>
                </ul>
            </div>
            <p className="mt-6 text-sm text-slate-400">กรุณาลองรีเฟรชหน้าเว็บอีกครั้งหลังจากแก้ไขปัญหาแล้ว</p>
        </div>
    );
};


const AppContent: React.FC = () => {
    const { currentUser, serverStatus } = useApp();

    if (serverStatus === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-100">
                <div className="flex items-center gap-3 text-slate-500">
                     <svg className="animate-spin h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>กำลังตรวจสอบการเชื่อมต่อเซิร์ฟเวอร์...</span>
                </div>
            </div>
        );
    }
    
    if (serverStatus === 'offline') {
        return <ServerStatusOverlay />;
    }


    if (!currentUser) {
        return <LoginView />;
    }

    return (
        <div className="min-h-screen bg-slate-100 flex flex-col">
            <Header />
            <main className="p-4 sm:p-6 md:p-8 flex-grow">
                {currentUser?.role === 'admin' ? <AdminView /> : <UserView />}
            </main>
            <Footer />
        </div>
    );
};

const App: React.FC = () => {
    return (
        <AppProvider>
            <AppContent />
        </AppProvider>
    );
};

export default App;