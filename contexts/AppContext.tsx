import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { User, Computer, Booking } from '../types';

// Helper to parse dates from API responses
const parseBookings = (bookings: any[]): Booking[] => {
    return bookings.map(b => ({
        ...b,
        startDate: new Date(b.startDate),
        endDate: new Date(b.endDate),
    }));
};

const API_URL = '/api'; // Use relative path for proxy

// Helper function to get auth token from localStorage
const getAuthHeader = () => {
    const token = localStorage.getItem('authToken');
    return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
};


interface AppContextType {
    currentUser: User | null;
    users: User[];
    computers: Computer[];
    bookings: Booking[];
    login: (name: string, password?: string) => Promise<boolean>;
    logout: () => void;
    addUser: (name: string, password?: string) => Promise<boolean>;
    deleteUser: (userId: string) => Promise<boolean>;
    addComputer: (computer: Omit<Computer, 'id'>) => Promise<boolean>;
    updateComputer: (computerId: string, updates: Partial<Computer>) => Promise<boolean>;
    deleteComputer: (computerId: string) => Promise<boolean>;
    addBooking: (booking: Omit<Booking, 'id' | 'status'>) => Promise<boolean>;
    updateBooking: (bookingId: string, updates: Partial<Pick<Booking, 'startDate' | 'endDate' | 'reason'>>) => Promise<boolean>;
    deleteBooking: (bookingId: string) => Promise<boolean>;
    approveBooking: (bookingId: string) => Promise<boolean>;
    findComputerById: (id: string) => Computer | undefined;
    findUserById: (id: string) => User | undefined;
    changePassword: (userId: string, oldPassword?: string, newPassword?: string) => Promise<boolean>;
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
    const [users, setUsers] = useState<User[]>([]);
    const [computers, setComputers] = useState<Computer[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);

    const fetchData = useCallback(async () => {
        if (!currentUser) return;
        try {
            const headers = getAuthHeader();
            const requests = [
                fetch(`${API_URL}/computers`, { headers }),
                fetch(`${API_URL}/bookings`, { headers })
            ];

            if (currentUser.role === 'admin') {
                requests.unshift(fetch(`${API_URL}/users`, { headers }));
            }

            const responses = await Promise.all(requests);
            
            if (currentUser.role === 'admin') {
                const usersRes = responses[0];
                if (usersRes.ok) setUsers(await usersRes.json());
                
                const computersRes = responses[1];
                if (computersRes.ok) setComputers(await computersRes.json());

                const bookingsRes = responses[2];
                if (bookingsRes.ok) setBookings(parseBookings(await bookingsRes.json()));
            } else {
                 setUsers([currentUser]); // User can only see themselves
                 const computersRes = responses[0];
                 if (computersRes.ok) setComputers(await computersRes.json());

                 const bookingsRes = responses[1];
                 if (bookingsRes.ok) setBookings(parseBookings(await bookingsRes.json()));
            }

        } catch (error) {
            console.error("Failed to fetch data:", error);
        }
    }, [currentUser]);

    useEffect(() => {
        if (currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            fetchData();
        } else {
            localStorage.removeItem('currentUser');
            localStorage.removeItem('authToken');
            setUsers([]);
            setComputers([]);
            setBookings([]);
        }
    }, [currentUser, fetchData]);

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
             // NOTE: This endpoint is public for the first user (admin), but for subsequent users, it should be protected.
             // We will handle this logic on the backend. Here, we call it as if it's an admin action.
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify({ name, password }), // Backend determines role
            });
            if (response.ok) {
                alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบด้วยชื่อผู้ใช้และรหัสผ่านที่คุณเพิ่งสร้าง');
                if(currentUser?.role === 'admin') {
                    fetchData(); // Refresh user list if an admin is adding another user
                }
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

    const deleteUser = async (userId: string): Promise<boolean> => {
        try {
            const response = await fetch(`${API_URL}/users/${userId}`, {
                method: 'DELETE',
                headers: getAuthHeader(),
            });
            if (response.ok) {
                fetchData();
                return true;
            }
             const errorData = await response.json();
             alert(`ลบผู้ใช้ไม่สำเร็จ: ${errorData.msg || 'เกิดข้อผิดพลาด'}`);
            return false;
        } catch (error) {
            console.error("Delete user failed:", error);
            alert('ลบผู้ใช้ไม่สำเร็จ: เกิดข้อผิดพลาดในการเชื่อมต่อ');
            return false;
        }
    };
    
    const addComputer = async (computer: Omit<Computer, 'id'>): Promise<boolean> => {
       try {
            const response = await fetch(`${API_URL}/computers`, {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify(computer),
            });
            if (response.ok) {
                fetchData();
                return true;
            }
            return false;
        } catch (error) {
            console.error("Add computer failed:", error);
            return false;
        }
    };

    const updateComputer = async (computerId: string, updates: Partial<Computer>): Promise<boolean> => {
        try {
            const response = await fetch(`${API_URL}/computers/${computerId}`, {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify(updates),
            });
            if (response.ok) {
                fetchData();
                return true;
            }
            return false;
        } catch (error) {
            console.error("Update computer failed:", error);
            return false;
        }
    };

    const deleteComputer = async (computerId: string): Promise<boolean> => {
        try {
            const response = await fetch(`${API_URL}/computers/${computerId}`, {
                method: 'DELETE',
                headers: getAuthHeader(),
            });
            if (response.ok) {
                fetchData();
                return true;
            }
            return false;
        } catch (error) {
            console.error("Delete computer failed:", error);
            return false;
        }
    };

    const addBooking = async (booking: Omit<Booking, 'id' | 'status'>): Promise<boolean> => {
         try {
            const response = await fetch(`${API_URL}/bookings`, {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify(booking),
            });
            if (response.ok) {
                fetchData();
                return true;
            }
            return false;
        } catch (error) {
            console.error("Add booking failed:", error);
            return false;
        }
    };

    const approveBooking = async (bookingId: string): Promise<boolean> => {
        try {
            const response = await fetch(`${API_URL}/bookings/${bookingId}/approve`, {
                method: 'PUT',
                headers: getAuthHeader(),
            });
            if (response.ok) {
                fetchData();
                return true;
            }
            return false;
        } catch (error) {
            console.error("Approve booking failed:", error);
            return false;
        }
    };

    const updateBooking = async (bookingId: string, updates: Partial<Pick<Booking, 'startDate' | 'endDate' | 'reason'>>): Promise<boolean> => {
        try {
            const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify(updates),
            });
            if (response.ok) {
                fetchData();
                return true;
            }
            return false;
        } catch (error) {
            console.error("Update booking failed:", error);
            return false;
        }
    };

    const deleteBooking = async (bookingId: string): Promise<boolean> => {
        try {
            const response = await fetch(`${API_URL}/bookings/${bookingId}`, {
                method: 'DELETE',
                headers: getAuthHeader(),
            });
            if (response.ok) {
                fetchData();
                return true;
            }
            return false;
        } catch (error) {
            console.error("Delete booking failed:", error);
            return false;
        }
    };

    const findComputerById = (id: string) => computers.find(c => c.id === id);
    const findUserById = (id: string) => users.find(u => u.id === id);

    const changePassword = async (userId: string, oldPassword?: string, newPassword?: string): Promise<boolean> => {
        try {
            const response = await fetch(`${API_URL}/auth/password`, {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify({ oldPassword, newPassword }),
            });
            return response.ok;
        } catch (error) {
            console.error("Change password failed:", error);
            return false;
        }
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
        deleteUser,
        addComputer,
        updateComputer,
        deleteComputer,
        addBooking,
        updateBooking,
        deleteBooking: (id: string) => deleteBooking(id), // Ensure it returns void
        approveBooking,
        findComputerById,
        findUserById,
        changePassword,
        importData,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};