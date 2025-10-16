import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { User, Computer, Booking } from '../types/types';

type ServerStatus = 'loading' | 'online' | 'offline';

// Define the type for the data needed to create a user
type AddUserPayload = Pick<User, 'name' | 'password' | 'position' | 'department' | 'employeeType'>;
// Define the type for the data needed to update a user
type UpdateUserPayload = Omit<User, 'id' | 'role' | 'password'>;


interface AppContextType {
    currentUser: User | null;
    users: User[];
    computers: Computer[];
    bookings: Booking[];
    serverStatus: ServerStatus;
    login: (name: string, password: string) => Promise<boolean>;
    logout: () => void;
    addUser: (userData: AddUserPayload) => Promise<boolean>;
    updateUser: (id: string, userData: UpdateUserPayload) => Promise<boolean>;
    addComputer: (computer: Omit<Computer, 'id'>) => Promise<void>;
    // FIX: Add updateComputer and deleteComputer to the context type
    updateComputer: (id: string, computerData: Omit<Computer, 'id'>) => Promise<boolean>;
    deleteComputer: (id: string) => Promise<void>;
    addBooking: (booking: Omit<Booking, 'id' | 'status'>) => Promise<void>;
    updateBooking: (id: string, data: { startDate: Date, endDate: Date, reason: string }) => Promise<boolean>;
    deleteBooking: (id: string) => Promise<void>;
    findComputerById: (id: string) => Computer | undefined;
    findUserById: (id: string) => User | undefined;
    changePassword: (userId: string, oldPassword: string, newPassword: string) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};

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
            if (res.ok) setComputers(await res.json());
        } catch (error) { console.error("Failed to fetch computers", error); }
    }, []);

    const fetchBookings = useCallback(async () => {
        try {
            const res = await fetch('/api/bookings', { headers: getAuthHeader() });
            if (res.ok) {
                const data: (Booking & { startDate: string, endDate: string })[] = await res.json();
                setBookings(data.map(b => ({ ...b, startDate: new Date(b.startDate), endDate: new Date(b.endDate) })));
            }
        } catch (error) { console.error("Failed to fetch bookings", error); }
    }, []);
    
    const fetchUsers = useCallback(async () => {
        if(currentUser?.role !== 'admin') return;
        try {
            const res = await fetch('/api/users', { headers: getAuthHeader() });
            if (res.ok) setUsers(await res.json());
        } catch (error) { console.error("Failed to fetch users", error); }
    }, [currentUser?.role]);

    const fetchAllData = useCallback(async () => {
        await Promise.all([ fetchComputers(), fetchBookings(), fetchUsers() ]);
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
                return true;
            }
            return false;
        } catch (error) {
            console.error("Login failed", error);
            return false;
        }
    };
    
    const addUser = async (userData: AddUserPayload): Promise<boolean> => {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
             if (res.ok) {
                const { token, user } = await res.json();
                // Log in the new user immediately
                localStorage.setItem('authToken', token);
                setCurrentUser(user);
                return true;
            }
            // Handle error response from backend
            const errorData = await res.json();
            alert(errorData.msg || 'Registration failed.');
            return false;
        } catch (error) {
            console.error("Failed to add user", error);
            return false;
        }
    };

    const updateUser = async (id: string, userData: UpdateUserPayload): Promise<boolean> => {
        try {
            const res = await fetch(`/api/users/${id}`, {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify(userData),
            });
            if (res.ok) {
                await fetchUsers(); // Refresh user list
                return true;
            }
            return false;
        } catch (error) {
            console.error("Failed to update user", error);
            return false;
        }
    };
    
    const logout = () => {
        localStorage.removeItem('authToken');
        setCurrentUser(null);
        setUsers([]); setComputers([]); setBookings([]);
    };
    
    const addComputer = async (computer: Omit<Computer, 'id'>) => {
        try {
            const res = await fetch('/api/computers', { method: 'POST', headers: getAuthHeader(), body: JSON.stringify(computer) });
            if (res.ok) await fetchComputers();
        } catch (error) { console.error("Failed to add computer", error); }
    };

    // FIX: Implement updateComputer function
    const updateComputer = async (id: string, computerData: Omit<Computer, 'id'>): Promise<boolean> => {
        try {
            const res = await fetch(`/api/computers/${id}`, {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify(computerData),
            });
            if (res.ok) {
                await fetchComputers();
                return true;
            }
            return false;
        } catch (error) {
            console.error("Failed to update computer", error);
            return false;
        }
    };

    // FIX: Implement deleteComputer function
    const deleteComputer = async (id: string) => {
        try {
            const res = await fetch(`/api/computers/${id}`, { method: 'DELETE', headers: getAuthHeader() });
            if (res.ok) await fetchComputers();
        } catch (error) { console.error("Failed to delete computer", error); }
    };

    const addBooking = async (booking: Omit<Booking, 'id' | 'status'>) => {
        try {
            const res = await fetch('/api/bookings', { method: 'POST', headers: getAuthHeader(), body: JSON.stringify(booking) });
            if (res.ok) await fetchBookings();
        } catch (error) { console.error("Failed to add booking", error); }
    };

    const updateBooking = async (id: string, data: { startDate: Date, endDate: Date, reason: string }): Promise<boolean> => {
        try {
            const res = await fetch(`/api/bookings/${id}`, { method: 'PUT', headers: getAuthHeader(), body: JSON.stringify(data) });
            if (res.ok) { await fetchBookings(); return true; } return false;
        } catch (error) { console.error("Failed to update booking", error); return false; }
    };

    const deleteBooking = async (id: string) => {
        try {
            const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE', headers: getAuthHeader() });
            if (res.ok) await fetchBookings();
        } catch (error) { console.error("Failed to delete booking", error); }
    };

    const changePassword = async (userId: string, oldPassword: string, newPassword: string): Promise<boolean> => {
        try {
            const res = await fetch(`/api/auth/updatepassword`, { method: 'PUT', headers: getAuthHeader(), body: JSON.stringify({ oldPassword, newPassword }) });
            return res.ok;
        } catch (error) { console.error("Failed to change password", error); return false; }
    };
    
    const findComputerById = (id: string) => computers.find(c => c.id === id);
    const findUserById = (id: string) => users.find(u => u.id === id) || (currentUser?.id === id ? currentUser : undefined);

    useEffect(() => {
        const initialize = async () => {
            try {
                const res = await fetch('/api/health');
                if (!res.ok) throw new Error('Server not healthy');
                setServerStatus('online');
                const token = localStorage.getItem('authToken');
                if (token) {
                    const authRes = await fetch('/api/auth/me', { headers: getAuthHeader() });
                    if (authRes.ok) setCurrentUser(await authRes.json());
                    else localStorage.removeItem('authToken');
                }
            } catch (error) {
                setServerStatus('offline');
            }
        };
        initialize();
    }, []);

    useEffect(() => {
        if (currentUser && serverStatus === 'online') {
            fetchAllData();
        }
    }, [currentUser, serverStatus, fetchAllData]);

    const value: AppContextType = {
        serverStatus, currentUser, users, computers, bookings,
        login, logout, addUser, updateUser, addComputer, 
        // FIX: Provide updateComputer and deleteComputer in the context value
        updateComputer, deleteComputer,
        addBooking, updateBooking, deleteBooking, findComputerById, findUserById, changePassword,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};