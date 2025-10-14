import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { User, Computer, Booking } from '../types/types';

// Initial data for demonstration purposes
const initialUsers: User[] = [
    { id: 'user-1', name: 'Admin', role: 'admin' },
    { id: 'user-2', name: 'Alice', role: 'user' },
    { id: 'user-3', name: 'Bob', role: 'user' },
];

const initialComputers: Computer[] = [
    {
        id: 'comp-1',
        assetNumber: 'LT-MBP16-001',
        name: 'MacBook Pro 16"',
        imageUrl: 'https://picsum.photos/seed/LT-MBP16-001/400/300',
        purchaseYear: 2023,
        description: 'Powerful laptop for creative professionals. Features the M2 Pro chip for exceptional performance.',
    },
    {
        id: 'comp-2',
        assetNumber: 'LT-DLLXP-002',
        name: 'Dell XPS 15',
        imageUrl: 'https://picsum.photos/seed/LT-DLLXP-002/400/300',
        purchaseYear: 2022,
        description: 'A sleek and powerful Windows laptop with a stunning OLED display, ideal for both work and play.',
    },
    {
        id: 'comp-3',
        assetNumber: 'LT-THNKPD-003',
        name: 'Lenovo ThinkPad X1',
        imageUrl: 'https://picsum.photos/seed/LT-THNKPD-003/400/300',
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
    addUser: (name: string) => Promise<void>;
    addComputer: (computer: Omit<Computer, 'id'>) => Promise<void>;
    addBooking: (booking: Omit<Booking, 'id'>) => Promise<boolean>;
    setCurrentUser: (user: User) => void;
    findComputerById: (id: string) => Computer | undefined;
    findUserById: (id: string) => User | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [computers, setComputers] = useState<Computer[]>(initialComputers);
    const [bookings, setBookings] = useState<Booking[]>(initialBookings);
    const [currentUser, setCurrentUser] = useState<User | null>(initialUsers[0]);


    const addUser = async (name: string) => {
        const newUser: User = {
            id: `user-${Date.now()}`,
            name,
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

             // Conflict if the new booking period overlaps with an existing one
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

    const findComputerById = (id: string) => computers.find(c => c.id === id);
    const findUserById = (id:string) => users.find(u => u.id === id);


    return (
        <AppContext.Provider value={{ users, computers, bookings, currentUser, addUser, addComputer, addBooking, setCurrentUser, findComputerById, findUserById }}>
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