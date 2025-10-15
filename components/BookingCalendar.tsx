import React, { useState } from 'react';
import type { Booking } from '../types/types';
import { useApp } from '../contexts/AppContext';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import BookingDetailsModal from './BookingDetailsModal';

const BookingCalendar: React.FC = () => {
    const { bookings, findComputerById, findUserById } = useApp();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDay = startOfMonth.getDay();
    const daysInMonth = endOfMonth.getDate();

    const days = [];
    for (let i = 0; i < startDay; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }

    const getBookingsForDay = (day: Date): Booking[] => {
        if (!day) return [];
        return bookings.filter(booking => {
            const startDate = new Date(booking.startDate);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(booking.endDate);
            endDate.setHours(0, 0, 0, 0);
            const checkDate = new Date(day);
            checkDate.setHours(0, 0, 0, 0);
            return checkDate >= startDate && checkDate <= endDate;
        });
    };
    
    const changeMonth = (offset: number) => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
    };
    
    const isToday = (day: Date) => {
        const today = new Date();
        return day.getDate() === today.getDate() &&
               day.getMonth() === today.getMonth() &&
               day.getFullYear() === today.getFullYear();
    }
    
    return (
        <>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-slate-200 transition"><ChevronLeftIcon /></button>
                    <h3 className="text-xl font-semibold">
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-slate-200 transition"><ChevronRightIcon /></button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center font-medium text-slate-500 mb-2">
                    <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {days.map((day, index) => (
                        <div key={index} className={`border border-slate-200 h-28 sm:h-32 p-1 overflow-y-auto ${day ? '' : 'bg-slate-50'}`}>
                           {day && (
                                <>
                                    <div className={`text-sm sm:text-base font-semibold ${isToday(day) ? 'bg-indigo-600 text-white rounded-full w-7 h-7 flex items-center justify-center' : ''}`}>
                                        {day.getDate()}
                                    </div>
                                    <div className="mt-1 space-y-1">
                                        {getBookingsForDay(day).map(booking => {
                                            const computer = findComputerById(booking.computerId);
                                            const user = findUserById(booking.userId);
                                            return (
                                                <button key={booking.id} onClick={() => setSelectedBooking(booking)} className="w-full bg-blue-100 text-blue-800 text-xs rounded p-1 truncate text-left hover:bg-blue-200" title={`${computer?.name} - ${user?.name}`}>
                                                    {computer?.name}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </>
                           )}
                        </div>
                    ))}
                </div>
            </div>
            {selectedBooking && (
                <BookingDetailsModal
                    booking={selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                />
            )}
        </>
    );
};

export default BookingCalendar;
