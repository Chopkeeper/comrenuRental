
import React, { useState } from 'react';
import type { Computer } from '../types';
import { useApp } from '../contexts/AppContext';
import BookingCalendar from './BookingCalendar';
import ComputerCard from './ComputerCard';
import Modal from './Modal';

// FIX: Update BookingForm to collect a reason and handle form submission asynchronously.
const BookingForm: React.FC<{ computer: Computer; onClose: () => void }> = ({ computer, onClose }) => {
    const { currentUser, addBooking } = useApp();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) {
            setError('You must be logged in to book a computer.');
            return;
        }
        if (!startDate || !endDate || !reason.trim()) {
            setError('Please fill out all fields, including the reason for booking.');
            return;
        }
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start > end) {
            setError('End date must be after start date.');
            return;
        }
        
        setError('');
        setIsSubmitting(true);

        await addBooking({
            computerId: computer.id,
            userId: currentUser.id,
            startDate: start,
            endDate: end,
            reason: reason.trim(),
        });
        
        setIsSubmitting(false);
        alert('Your booking request has been sent for approval.');
        onClose();
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Book: {computer.name}</h3>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
            </div>
            <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
            </div>
            <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason for Booking</label>
                <textarea 
                    id="reason" 
                    value={reason} 
                    onChange={e => setReason(e.target.value)} 
                    rows={3}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                    placeholder="e.g., For project X presentation at client site."
                    required 
                />
            </div>
             <div className="flex justify-end gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
                    {isSubmitting ? 'Submitting...' : 'Request Booking'}
                </button>
            </div>
        </form>
    )

}

const UserView: React.FC = () => {
    const { computers } = useApp();
    const [selectedComputer, setSelectedComputer] = useState<Computer | null>(null);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Available Computers</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {computers.map(computer => (
                        <ComputerCard key={computer.id} computer={computer} onBook={() => setSelectedComputer(computer)} />
                    ))}
                </div>
            </div>

            <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Booking Calendar</h2>
                <BookingCalendar />
            </div>
            
            <Modal isOpen={!!selectedComputer} onClose={() => setSelectedComputer(null)}>
                {selectedComputer && <BookingForm computer={selectedComputer} onClose={() => setSelectedComputer(null)} />}
            </Modal>
        </div>
    );
};

export default UserView;