import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, Computer, Booking } from '../types';

// Helper to parse dates from API responses or localStorage
const parseBookings = (bookings: any[]): Booking[] => {
    return bookings.map(b => ({
        ...b,
        startDate: new Date(b.startDate),
        endDate: new Date(b.endDate),
    }));
};

const API_URL = 'http://localhost:5001/api'; // Backend URL

interface AppContextType {
    currentUser: User | null;
    users: User[];
    computers: Computer[];
    bookings: Booking[];
    login: (name: string, password?: string) => Promise<boolean>;
    logout: () => void;
    addUser: (name: string, password?: string) => Promise<boolean>;
    addComputer: (computer: Omit<Computer, 'id'>) => void;
    updateComputer: (computerId: string, updates: Partial<Computer>) => void;
    deleteComputer: (computerId: string) => void;
    addBooking: (booking: Omit<Booking, 'id' | 'status'>) => Promise<boolean>;
    updateBooking: (bookingId: string, updates: Partial<Pick<Booking, 'startDate' | 'endDate' | 'reason'>>) => Promise<boolean>;
    deleteBooking: (bookingId: string) => void;
    approveBooking: (bookingId: string) => Promise<boolean>;
    findComputerById: (id: string) => Computer | undefined;
    findUserById: (id: string) => User | undefined;
    changePassword: (userId: string, oldPassword?: string, newPassword?: string) => boolean;
    importData: (jsonString: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('currentUser');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    // Data will be fetched from API
    const [users, setUsers] = useState<User[]>([]);
    const [computers, setComputers] = useState<Computer[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);

    useEffect(() => {
        // Persist currentUser to localStorage
        if (currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
        } else {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('authToken');
        }
    }, [currentUser]);

    // TODO: Add useEffect hooks to fetch users, computers, and bookings from the API when the app loads or currentUser changes.

    const login = async (name: string, password?: string): Promise<boolean> => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, password }),
            });

            if (!response.ok) {
                return false;
            }

            const data = await response.json();
            if (data.token && data.user) {
                localStorage.setItem('authToken', data.token);
                setCurrentUser(data.user);
                return true;
            }
            return false;
        } catch (error) {
            console.error("Login request failed:", error);
            return false;
        }
    };

    const logout = () => {
        setCurrentUser(null);
    };

    const addUser = async (name: string, password?: string): Promise<boolean> => {
        try {
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, password, role: 'user' }),
            });
            if (response.ok) {
                alert('เพิ่มผู้ใช้สำเร็จแล้ว');
                // TODO: Refresh user list after adding
                return true;
            } else {
                 const errorData = await response.json();
                 alert(`เพิ่มผู้ใช้ไม่สำเร็จ: ${errorData.msg || 'เกิดข้อผิดพลาด'}`);
                 return false;
            }
        } catch (error) {
            console.error("Add user request failed:", error);
            alert('เพิ่มผู้ใช้ไม่สำเร็จ: เกิดข้อผิดพลาดในการเชื่อมต่อ');
            return false;
        }
    };
    
    // --- Placeholder functions - to be implemented with backend API ---

    const addComputer = (computer: Omit<Computer, 'id'>) => {
        console.log("TODO: Add computer via API", computer);
        alert("ฟังก์ชันนี้จะถูกเชื่อมต่อกับ Backend ในขั้นตอนถัดไป");
    };

    const updateComputer = (computerId: string, updates: Partial<Computer>) => {
        console.log("TODO: Update computer via API", computerId, updates);
        alert("ฟังก์ชันนี้จะถูกเชื่อมต่อกับ Backend ในขั้นตอนถัดไป");
    };

    const deleteComputer = (computerId: string) => {
        console.log("TODO: Delete computer via API", computerId);
        alert("ฟังก์ชันนี้จะถูกเชื่อมต่อกับ Backend ในขั้นตอนถัดไป");
    };

    const addBooking = async (booking: Omit<Booking, 'id' | 'status'>): Promise<boolean> => {
        console.log("TODO: Add booking via API", booking);
        alert("ฟังก์ชันนี้จะถูกเชื่อมต่อกับ Backend ในขั้นตอนถัดไป");
        return false;
    };

    const approveBooking = async (bookingId: string): Promise<boolean> => {
        console.log("TODO: Approve booking via API", bookingId);
        alert("ฟังก์ชันนี้จะถูกเชื่อมต่อกับ Backend ในขั้นตอนถัดไป");
        return false;
    };

    const updateBooking = async (bookingId: string, updates: Partial<Pick<Booking, 'startDate' | 'endDate' | 'reason'>>): Promise<boolean> => {
        console.log("TODO: Update booking via API", bookingId, updates);
        alert("ฟังก์ชันนี้จะถูกเชื่อมต่อกับ Backend ในขั้นตอนถัดไป");
        return false;
    };

    const deleteBooking = (bookingId: string) => {
        console.log("TODO: Delete booking via API", bookingId);
        alert("ฟังก์ชันนี้จะถูกเชื่อมต่อกับ Backend ในขั้นตอนถัดไป");
    };

    const findComputerById = (id: string) => computers.find(c => c.id === id);
    const findUserById = (id: string) => users.find(u => u.id === id);

    const changePassword = (userId: string, oldPassword?: string, newPassword?: string): boolean => {
        console.log("TODO: Change password via API", userId);
        alert("ฟังก์ชันนี้จะถูกเชื่อมต่อกับ Backend ในขั้นตอนถัดไป");
        return false;
    };
    
    const importData = (jsonString: string): boolean => {
       alert("ฟังก์ชันนำเข้า/ส่งออกข้อมูลไม่สามารถใช้งานได้เมื่อเชื่อมต่อกับฐานข้อมูลกลาง");
       return false;
    };

    const value = {
        currentUser,
        users,
        computers,
        bookings,
        login,
        logout,
        addUser,
        addComputer,
        updateComputer,
        deleteComputer,
        addBooking,
        updateBooking,
        deleteBooking,
        approveBooking,
        findComputerById,
        findUserById,
        changePassword,
        importData,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
