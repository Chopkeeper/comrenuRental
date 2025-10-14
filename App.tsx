import React from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import AdminView from './views/AdminView';
import UserView from './views/UserView';
import Header from './components/Header';

const AppContent: React.FC = () => {
    const { currentUser } = useApp();

    return (
        <div className="min-h-screen bg-slate-100">
            <Header />
            <main className="p-4 sm:p-6 md:p-8">
                {currentUser?.role === 'admin' ? <AdminView /> : <UserView />}
            </main>
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