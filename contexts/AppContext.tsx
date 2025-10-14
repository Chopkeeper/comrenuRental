import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { User, Computer, Booking } from '../types/types';

interface AppContextType {
    users: User[];
    computers: Computer[];
    bookings: Booking[];
    currentUser: User | null;
    addUser: (name: string) => void;
    addComputer: (computer: Omit<Computer, 'id'>) => void;
    addBooking: (booking: Omit<Booking, 'id'>) => boolean;
    setCurrentUser: (user: User) => void;
    findComputerById: (id: string) => Computer | undefined;
    findUserById: (id: string) => User | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialUsers: User[] = [
    { id: 'user-1', name: 'Admin Alice', role: 'admin' },
    { id: 'user-2', name: 'User Bob', role: 'user' },
];

const initialComputers: Computer[] = [
    { id: 'comp-1', name: 'Dell XPS 15', assetNumber: 'DXPS15-001', purchaseYear: 2023, imageUrl: 'https://picsum.photos/seed/dxps15/400/300', description: 'Powerful laptop for creative professionals.'},
    { id: 'comp-2', name: 'MacBook Pro 14', assetNumber: 'MBP14-002', purchaseYear: 2023, imageUrl: 'https://picsum.photos/seed/mbp14/400/300', description: 'Sleek and efficient for all tasks.' },
    { id: 'comp-3', name: 'Lenovo ThinkPad X1', assetNumber: 'LTPX1-003', purchaseYear: 2022, imageUrl: 'https://picsum.photos/seed/ltpx1/400/300', description: 'A reliable business workhorse.' },
];

const initialBookings: Booking[] = [
    { id: 'booking-1', computerId: 'comp-1', userId: 'user-2', startDate: new Date(new Date().setDate(new Date().getDate() + 2)), endDate: new Date(new Date().setDate(new Date().getDate() + 5)) },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [computers, setComputers] = useState<Computer[]>(initialComputers);
    const [bookings, setBookings] = useState<Booking[]>(initialBookings);
    const [currentUser, setCurrentUser] = useState<User | null>(initialUsers[0]);

    const addUser = (name: string) => {
        const newUser: User = {
            id: `user-${Date.now()}`,
            name,
            role: 'user',
        };
        setUsers(prev => [...prev, newUser]);
    };

    const addComputer = (computer: Omit<Computer, 'id'>) => {
        const newComputer: Computer = {
            id: `comp-${Date.now()}`,
            ...computer,
        };
        setComputers(prev => [...prev, newComputer]);
    };

    const addBooking = useCallback((booking: Omit<Booking, 'id'>): boolean => {
        const newStartDate = new Date(booking.startDate);
        newStartDate.setHours(0, 0, 0, 0);
        const newEndDate = new Date(booking.endDate);
        newEndDate.setHours(23, 59, 59, 999);

        const isConflict = bookings.some(b => {
            if (b.computerId !== booking.computerId) return false;
            
            const existingStartDate = new Date(b.startDate);
            existingStartDate.setHours(0, 0, 0, 0);
            const existingEndDate = new Date(b.endDate);
            existingEndDate.setHours(23, 59, 59, 999);

            return (
                (newStartDate >= existingStartDate && newStartDate <= existingEndDate) ||
                (newEndDate >= existingStartDate && newEndDate <= existingEndDate) ||
                (newStartDate <= existingStartDate && newEndDate >= existingEndDate)
            );
        });

        if (isConflict) {
            alert('Booking conflict! This computer is already booked for the selected dates.');
            return false;
        }

        const newBooking: Booking = {
            id: `booking-${Date.now()}`,
            ...booking,
        };
        setBookings(prev => [...prev, newBooking]);
        return true;
    }, [bookings]);

    const findComputerById = (id: string) => computers.find(c => c.id === id);
    const findUserById = (id: string) => users.find(u => u.id === id);


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