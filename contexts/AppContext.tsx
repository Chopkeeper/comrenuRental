import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { User, Computer, Booking } from '../types/types';

// Initial data for demonstration purposes
const initialUsers: User[] = [
    { id: 'user-1', name: 'Admin', role: 'admin', password: 'admin' },
    { id: 'user-2', name: 'Alice', role: 'user', password: 'password123' },
    { id: 'user-3', name: 'Bob', role: 'user', password: 'password123' },
];

const initialComputers: Computer[] = [
    {
        id: 'comp-1',
        assetNumber: 'LT-MBP16-001',
        name: 'MacBook Pro 16"',
        imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1926&auto=format&fit=crop',
        purchaseYear: 2023,
        description: 'Powerful laptop for creative professionals. Features the M2 Pro chip for exceptional performance.',
    },
    {
        id: 'comp-2',
        assetNumber: 'LT-DLLXP-002',
        name: 'Dell XPS 15',
        imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=1770&auto=format&fit=crop',
        purchaseYear: 2022,
        description: 'A sleek and powerful Windows laptop with a stunning OLED display, ideal for both work and play.',
    },
    {
        id: 'comp-3',
        assetNumber: 'LT-THNKPD-003',
        name: 'Lenovo ThinkPad X1',
        imageUrl: 'https://images.unsplash.com/photo-1542393545-10f5cde2c810?q=80&w=1964&auto=format&fit=crop',
        purchaseYear: 2023,
        description: 'Known for its durability and excellent keyboard, the ThinkPad is a reliable business companion.',
    },
];

const initialBookings: Booking[] = [
    {
        id: 'booking-1',
        computerId: 'comp-1',
        userId: 'user-2',
        startDate: new Date(new Date().setDate(new Date().getDate() + 2)),
        endDate: new Date(new Date().setDate(new Date().getDate() + 5)),
    },
    {
        id: 'booking-2',
        computerId: 'comp-3',
        userId: 'user-3',
        startDate: new Date(new Date().setDate(new Date().getDate() - 1)),
        endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    },
];


interface AppContextType {
    users: User[];
    computers: Computer[];
    bookings: Booking[];
    currentUser: User | null;
    login: (name: string, password: string) => boolean;
    addUser: (name: string, password: string) => Promise<void>;
    addComputer: (computer: Omit<Computer, 'id'>) => Promise<void>;
    addBooking: (booking: Omit<Booking, 'id'>) => Promise<boolean>;
    setCurrentUser: (user: User) => void;
    logout: () => void;
    findComputerById: (id: string) => Computer | undefined;
    findUserById: (id: string) => User | undefined;
    updateComputer: (id: string, computerData: Partial<Omit<Computer, 'id'>>) => Promise<void>;
    deleteComputer: (id: string) => Promise<void>;
    updateBooking: (id: string, bookingData: { startDate: Date; endDate: Date }) => Promise<boolean>;
    deleteBooking: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [computers, setComputers] = useState<Computer[]>(initialComputers);
    const [bookings, setBookings] = useState<Booking[]>(initialBookings);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    const login = (name: string, password: string): boolean => {
        const user = users.find(u => u.name.toLowerCase() === name.toLowerCase() && u.password === password);
        if (user) {
            setCurrentUser(user);
            return true;
        }
        return false;
    };

    const logout = () => {
        setCurrentUser(null);
    }

    const addUser = async (name: string, password: string) => {
        const newUser: User = {
            id: `user-${Date.now()}`,
            name,
            password,
            role: 'user', // New users are always 'user' role
        };
        setUsers(prev => [...prev, newUser]);
    };

    const addComputer = async (computer: Omit<Computer, 'id'>) => {
        const newComputer: Computer = {
            ...computer,
            id: `comp-${Date.now()}`,
        };
        setComputers(prev => [...prev, newComputer]);
    };
    
    const updateComputer = async (id: string, computerData: Partial<Omit<Computer, 'id'>>) => {
        setComputers(prev =>
            prev.map(c =>
                c.id === id ? { ...c, ...computerData } : c
            )
        );
    };

    const deleteComputer = async (id: string) => {
        setComputers(prev => prev.filter(c => c.id !== id));
        setBookings(prev => prev.filter(b => b.computerId !== id));
    };

    const addBooking = useCallback(async (booking: Omit<Booking, 'id'>): Promise<boolean> => {
        const newBookingStart = new Date(booking.startDate);
        newBookingStart.setHours(0,0,0,0);
        const newBookingEnd = new Date(booking.endDate);
        newBookingEnd.setHours(0,0,0,0);

        const isConflict = bookings.some(b => {
             if (b.computerId !== booking.computerId) {
                 return false;
             }
             const existingStart = new Date(b.startDate);
             existingStart.setHours(0,0,0,0);
             const existingEnd = new Date(b.endDate);
             existingEnd.setHours(0,0,0,0);

             return newBookingStart <= existingEnd && newBookingEnd >= existingStart;
        });
        
        if (isConflict) {
            return false;
        }
        
        const newBooking: Booking = {
            ...booking,
            id: `booking-${Date.now()}`,
        };
        setBookings(prev => [...prev, newBooking]);
        return true;
    }, [bookings]);

    const updateBooking = useCallback(async (id: string, bookingData: { startDate: Date; endDate: Date }): Promise<boolean> => {
        const newBookingStart = new Date(bookingData.startDate);
        newBookingStart.setHours(0, 0, 0, 0);
        const newBookingEnd = new Date(bookingData.endDate);
        newBookingEnd.setHours(0, 0, 0, 0);

        const bookingToUpdate = bookings.find(b => b.id === id);
        if (!bookingToUpdate) return false;

        const isConflict = bookings.some(b => {
            if (b.id === id || b.computerId !== bookingToUpdate.computerId) {
                return false;
            }
            const existingStart = new Date(b.startDate);
            existingStart.setHours(0, 0, 0, 0);
            const existingEnd = new Date(b.endDate);
            existingEnd.setHours(0, 0, 0, 0);

            return newBookingStart <= existingEnd && newBookingEnd >= existingStart;
        });

        if (isConflict) {
            return false;
        }

        setBookings(prev => prev.map(b => b.id === id ? { ...b, ...bookingData } : b));
        return true;
    }, [bookings]);

    const deleteBooking = async (id: string) => {
        setBookings(prev => prev.filter(b => b.id !== id));
    };

    const findComputerById = (id: string) => computers.find(c => c.id === id);
    const findUserById = (id:string) => users.find(u => u.id === id);


    return (
        <AppContext.Provider value={{ 
            users, computers, bookings, currentUser, 
            login, addUser, addComputer, addBooking, setCurrentUser, logout,
            findComputerById, findUserById, updateComputer, deleteComputer,
            updateBooking, deleteBooking
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = (): AppContextType => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};