
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { User, Computer, Booking } from '../types/types';

type ServerStatus = 'loading' | 'online' | 'offline';

interface AppContextType {
    currentUser: User | null;
    users: User[];
    computers: Computer[];
    bookings: Booking[];
    serverStatus: ServerStatus;
    login: (name: string, password: string) => Promise<boolean>;
    logout: () => void;
    addUser: (name: string, password: string) => Promise<void>;
    addComputer: (computer: Omit<Computer, 'id'>) => Promise<void>;
    addBooking: (booking: Omit<Booking, 'id' | 'status'>) => Promise<void>;
    updateBooking: (id: string, data: { startDate: Date, endDate: Date, reason: string }) => Promise<boolean>;
    deleteBooking: (id: string) => Promise<void>;
    findComputerById: (id: string) => Computer | undefined;
    findUserById: (id: string) => User | undefined;
    changePassword: (userId: string, oldPassword: string, newPassword: string) => Promise<boolean>;
    // Add other state and functions as needed
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};

// Helper to get auth token
const getAuthHeader = () => {
    const token = localStorage.getItem('authToken');
    return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : {'Content-Type': 'application/json'};
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [serverStatus, setServerStatus] = useState<ServerStatus>('loading');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [computers, setComputers] = useState<Computer[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);

    const fetchComputers = useCallback(async () => {
        try {
            const res = await fetch('/api/computers', { headers: getAuthHeader() });
            if (res.ok) {
                const data = await res.json();
                setComputers(data);
            }
        } catch (error) {
            console.error("Failed to fetch computers", error);
        }
    }, []);

    const fetchBookings = useCallback(async () => {
        try {
            const res = await fetch('/api/bookings', { headers: getAuthHeader() });
            if (res.ok) {
                const data: (Booking & { startDate: string, endDate: string })[] = await res.json();
                const formattedBookings = data.map(b => ({ ...b, startDate: new Date(b.startDate), endDate: new Date(b.endDate) }));
                setBookings(formattedBookings);
            }
        } catch (error) {
            console.error("Failed to fetch bookings", error);
        }
    }, []);
    
    const fetchUsers = useCallback(async () => {
        if(currentUser?.role !== 'admin') return;
        try {
            const res = await fetch('/api/users', { headers: getAuthHeader() });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
        }
    }, [currentUser?.role]);


    const fetchAllData = useCallback(async () => {
        await Promise.all([
            fetchComputers(),
            fetchBookings(),
            fetchUsers()
        ]);
    }, [fetchComputers, fetchBookings, fetchUsers]);

    const login = async (name: string, password: string): Promise<boolean> => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, password }),
            });
            if (res.ok) {
                const { token, user } = await res.json();
                localStorage.setItem('authToken', token);
                setCurrentUser(user);
                await fetchAllData();
                return true;
            }
            return false;
        } catch (error) {
            console.error("Login failed", error);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setCurrentUser(null);
        setUsers([]);
        setComputers([]);
        setBookings([]);
    };
    
    const addUser = async (name: string, password: string) => {
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify({ name, password, role: 'user' }),
            });
            if(res.ok) await fetchUsers();
        } catch (error) {
            console.error("Failed to add user", error);
        }
    };
    
    const addComputer = async (computer: Omit<Computer, 'id'>) => {
        try {
            const res = await fetch('/api/computers', {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify(computer),
            });
            if (res.ok) await fetchComputers();
        } catch (error) {
            console.error("Failed to add computer", error);
        }
    };

    const addBooking = async (booking: Omit<Booking, 'id' | 'status'>) => {
        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify(booking),
            });
            if (res.ok) await fetchBookings();
        } catch (error) {
            console.error("Failed to add booking", error);
        }
    };

    const updateBooking = async (id: string, data: { startDate: Date, endDate: Date, reason: string }): Promise<boolean> => {
        try {
            const res = await fetch(`/api/bookings/${id}`, {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify(data),
            });
            if (res.ok) {
                await fetchBookings();
                return true;
            }
            return false;
        } catch (error) {
            console.error("Failed to update booking", error);
            return false;
        }
    };

    const deleteBooking = async (id: string) => {
        try {
            const res = await fetch(`/api/bookings/${id}`, {
                method: 'DELETE',
                headers: getAuthHeader(),
            });
            if (res.ok) await fetchBookings();
        } catch (error) {
            console.error("Failed to delete booking", error);
        }
    };

    const changePassword = async (userId: string, oldPassword: string, newPassword: string): Promise<boolean> => {
        try {
            const res = await fetch(`/api/auth/updatepassword`, {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify({ oldPassword, newPassword }),
            });
            return res.ok;
        } catch (error) {
            console.error("Failed to change password", error);
            return false;
        }
    };
    
    const findComputerById = (id: string) => computers.find(c => c.id === id);
    const findUserById = (id: string) => users.find(u => u.id === id) || (currentUser?.id === id ? currentUser : undefined);


    useEffect(() => {
        const checkServer = async () => {
            try {
                const res = await fetch('/api/health');
                if (res.ok) {
                    setServerStatus('online');
                } else {
                    throw new Error('Server not healthy');
                }
            } catch (error) {
                setServerStatus('offline');
            }
        };

        const checkAuth = async () => {
            const token = localStorage.getItem('authToken');
            if (token) {
                try {
                    const res = await fetch('/api/auth/me', { headers: getAuthHeader() });
                    if (res.ok) {
                        const user = await res.json();
                        setCurrentUser(user);
                    } else {
                        localStorage.removeItem('authToken');
                    }
                } catch (error) {
                    console.error("Failed to verify token", error);
                    localStorage.removeItem('authToken');
                }
            }
        };

        const initialize = async () => {
            await checkServer();
            await checkAuth();
        }

        initialize();
    }, []);

    useEffect(() => {
        if (currentUser) {
            fetchAllData();
        }
    }, [currentUser, fetchAllData]);

    const value: AppContextType = {
        serverStatus,
        currentUser,
        users,
        computers,
        bookings,
        login,
        logout,
        addUser,
        addComputer,
        addBooking,
        updateBooking,
        deleteBooking,
        findComputerById,
        findUserById,
        changePassword,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
