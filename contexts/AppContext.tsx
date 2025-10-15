import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, Computer, Booking } from '../types';

// Initial Data for demonstration
const initialUsersData: User[] = [
    { id: 'u1', name: 'ผู้ดูแลระบบ', password: 'admin', role: 'admin' },
    { id: 'u2', name: 'อลิซ', password: 'password', role: 'user' },
    { id: 'u3', name: 'บ๊อบ', password: 'password', role: 'user' },
];

const initialComputersData: Computer[] = [
    { id: 'c1', assetNumber: 'DELL-001', name: 'Dell Latitude 7420', imageUrl: 'https://picsum.photos/seed/DELL-001/400/300', purchaseYear: 2021, description: 'แล็ปท็อปธุรกิจที่เชื่อถือได้สำหรับงานประจำวัน' },
    { id: 'c2', assetNumber: 'MBP-001', name: 'MacBook Pro 16"', imageUrl: 'https://picsum.photos/seed/MBP-001/400/300', purchaseYear: 2022, description: 'ทรงพลังและเพรียวบาง เหมาะสำหรับมืออาชีพสายสร้างสรรค์' },
    { id: 'c3', assetNumber: 'LEN-001', name: 'Lenovo ThinkPad X1', imageUrl: 'https://picsum.photos/seed/LEN-001/400/300', purchaseYear: 2023, description: 'เบาเป็นพิเศษและทนทาน พร้อมคีย์บอร์ดที่ดีที่สุดในระดับเดียวกัน' },
    { id: 'c4', assetNumber: 'HP-001', name: 'HP Spectre x360', imageUrl: 'https://picsum.photos/seed/HP-001/400/300', purchaseYear: 2022, description: 'อุปกรณ์ 2-in-1 ที่หลากหลายพร้อมจอแสดงผลที่น่าทึ่ง' },
];

// Helper to parse dates from localStorage
const parseBookings = (bookings: any[]): Booking[] => {
    return bookings.map(b => ({
        ...b,
        startDate: new Date(b.startDate),
        endDate: new Date(b.endDate),
    }));
};

const initialBookingsData: Booking[] = parseBookings([
    { id: 'b1', computerId: 'c1', userId: 'u2', startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), endDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), status: 'confirmed', reason: 'สำหรับนำเสนอผลงานที่ออฟฟิศในเมือง' },
    { id: 'b2', computerId: 'c3', userId: 'u3', startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), status: 'confirmed', reason: 'สำหรับทำงานนอกสถานที่ที่ไซต์ลูกค้า' },
    { id: 'b3', computerId: 'c2', userId: 'u2', startDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), status: 'pending', reason: 'สำหรับตัดต่อวิดีโอแคมเปญการตลาดใหม่' },
]);


interface AppContextType {
    currentUser: User | null;
    users: User[];
    computers: Computer[];
    bookings: Booking[];
    login: (name: string, password?: string) => boolean;
    logout: () => void;
    addUser: (name: string, password?: string) => void;
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
    const [users, setUsers] = useState<User[]>(() => {
        const storedUsers = localStorage.getItem('users');
        return storedUsers ? JSON.parse(storedUsers) : initialUsersData;
    });
    const [computers, setComputers] = useState<Computer[]>(() => {
        const storedComputers = localStorage.getItem('computers');
        return storedComputers ? JSON.parse(storedComputers) : initialComputersData;
    });
    const [bookings, setBookings] = useState<Booking[]>(() => {
        const storedBookings = localStorage.getItem('bookings');
        return storedBookings ? parseBookings(JSON.parse(storedBookings)) : initialBookingsData;
    });

    useEffect(() => {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }, [currentUser]);

    useEffect(() => {
        localStorage.setItem('users', JSON.stringify(users));
    }, [users]);

    useEffect(() => {
        localStorage.setItem('computers', JSON.stringify(computers));
    }, [computers]);

    useEffect(() => {
        localStorage.setItem('bookings', JSON.stringify(bookings));
    }, [bookings]);

    const login = (name: string, password?: string): boolean => {
        const user = users.find(u => u.name.toLowerCase() === name.toLowerCase() && u.password === password);
        if (user) {
            setCurrentUser(user);
            return true;
        }
        return false;
    };

    const logout = () => {
        setCurrentUser(null);
    };

    const addUser = (name: string, password?: string) => {
        const newUser: User = {
            id: `u${Date.now()}`,
            name,
            password,
            role: 'user',
        };
        setUsers(prev => [...prev, newUser]);
    };

    const addComputer = (computer: Omit<Computer, 'id'>) => {
        const newComputer: Computer = {
            id: `c${Date.now()}`,
            ...computer,
        };
        setComputers(prev => [...prev, newComputer]);
    };

    const updateComputer = (computerId: string, updates: Partial<Computer>) => {
        setComputers(prev => prev.map(c => c.id === computerId ? { ...c, ...updates } : c));
    };

    const deleteComputer = (computerId: string) => {
        setComputers(prev => prev.filter(c => c.id !== computerId));
        // Also delete associated bookings
        setBookings(prev => prev.filter(b => b.computerId !== computerId));
    };
    
    const isConflict = (newBooking: Omit<Booking, 'id' | 'userId'> & {startDate: Date; endDate: Date}, existingBookingId?: string): boolean => {
        return bookings.some(booking => {
            if (booking.status !== 'confirmed') return false; // Only check confirmed bookings
            if (booking.id === existingBookingId) return false; // Ignore the booking being updated
            if (booking.computerId !== newBooking.computerId) return false; // Different computer

            const newStart = newBooking.startDate.getTime();
            const newEnd = newBooking.endDate.getTime();
            const existingStart = booking.startDate.getTime();
            const existingEnd = booking.endDate.getTime();

            // Check for overlap
            return (newStart < existingEnd && newEnd > existingStart);
        });
    };


    const addBooking = async (booking: Omit<Booking, 'id' | 'status'>): Promise<boolean> => {
        const newBooking: Booking = {
            id: `b${Date.now()}`,
            ...booking,
            status: 'pending',
        };
        setBookings(prev => [...prev, newBooking]);
        return true;
    };

    const approveBooking = async (bookingId: string): Promise<boolean> => {
        const bookingToApprove = bookings.find(b => b.id === bookingId);
        if (!bookingToApprove) return false;

        if (isConflict(bookingToApprove)) {
            return false; // Conflict found, cannot approve
        }

        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'confirmed' } : b));
        return true;
    };

    const updateBooking = async (bookingId: string, updates: Partial<Pick<Booking, 'startDate' | 'endDate' | 'reason'>>): Promise<boolean> => {
        const bookingToUpdate = bookings.find(b => b.id === bookingId);
        if (!bookingToUpdate) return false;
        
        const updatedBookingData = { ...bookingToUpdate, ...updates };

        if (updates.startDate || updates.endDate) {
            if (isConflict(updatedBookingData, bookingId)) {
                return false;
            }
        }

        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, ...updates } : b));
        return true;
    };

    const deleteBooking = (bookingId: string) => {
        setBookings(prev => prev.filter(b => b.id !== bookingId));
    };

    const findComputerById = (id: string) => computers.find(c => c.id === id);
    const findUserById = (id: string) => users.find(u => u.id === id);

    const changePassword = (userId: string, oldPassword?: string, newPassword?: string): boolean => {
        const user = users.find(u => u.id === userId);
        if (!user || !newPassword) return false;

        // Admin changing other user's password doesn't need old password
        if (currentUser?.role === 'admin' && currentUser.id !== userId) {
             setUsers(prev => prev.map(u => u.id === userId ? { ...u, password: newPassword } : u));
             return true;
        }

        // User changing their own password
        if (user.password === oldPassword) {
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, password: newPassword } : u));
            if (currentUser?.id === userId) {
                setCurrentUser(prev => prev ? { ...prev, password: newPassword } : null);
            }
            return true;
        }
        return false;
    };
    
    const importData = (jsonString: string): boolean => {
        try {
            const data = JSON.parse(jsonString);
            // Basic validation
            if (!data.users || !data.computers || !data.bookings || !Array.isArray(data.users)) {
                throw new Error("Invalid data structure");
            }
    
            const parsedBookings = parseBookings(data.bookings);
    
            setUsers(data.users);
            setComputers(data.computers);
            setBookings(parsedBookings);
            
            // Log out current user to prevent inconsistencies
            logout();
    
            alert("นำเข้าข้อมูลสำเร็จ! กรุณาล็อกอินอีกครั้ง");
            return true;
        } catch (error) {
            console.error("Failed to import data:", error);
            alert("นำเข้าข้อมูลไม่สำเร็จ กรุณาตรวจสอบว่าไฟล์ที่เลือกเป็นไฟล์ที่ส่งออกมาจากแอปพลิเคชันนี้อย่างถูกต้อง");
            return false;
        }
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