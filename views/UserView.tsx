import React, { useState } from 'react';
import type { Computer } from '../types/types';
import { useApp } from '../contexts/AppContext';
import BookingCalendar from '../components/BookingCalendar';
import ComputerCard from '../components/ComputerCard';
import Modal from '../components/Modal';

const BookingForm: React.FC<{ computer: Computer; onClose: () => void }> = ({ computer, onClose }) => {
    const { currentUser, addBooking } = useApp();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentUser) {
            setError('You must be logged in to book a computer.');
            return;
        }
        if (!startDate || !endDate) {
            setError('Please select a start and end date.');
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
             <div className="flex justify-end gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
                    {isSubmitting ? 'Submitting...' : 'Request Booking'}
                </button>
            </div>
        </form>
    )

}

const MyBookings: React.FC = () => {
    const { currentUser, bookings, findComputerById, deleteBooking } = useApp();
    if (!currentUser) return null;

    const myBookings = bookings
        .filter(b => b.userId === currentUser.id)
        .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

    if (myBookings.length === 0) {
        return null; // Don't show the section if there are no bookings
    }
    
    const handleCancel = (bookingId: string) => {
        if (window.confirm('Are you sure you want to cancel this booking request?')) {
            deleteBooking(bookingId);
        }
    };

    return (
         <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">My Bookings</h2>
            <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50">
                        <tr className="border-b">
                            <th className="p-2 font-semibold">Computer</th>
                            <th className="p-2 font-semibold">From</th>
                            <th className="p-2 font-semibold">To</th>
                            <th className="p-2 font-semibold">Status</th>
                            <th className="p-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {myBookings.map(booking => {
                            const computer = findComputerById(booking.computerId);
                            return (
                                <tr key={booking.id} className="border-b hover:bg-slate-50">
                                    <td className="p-2">{computer?.name}</td>
                                    <td className="p-2">{booking.startDate.toLocaleDateString()}</td>
                                    <td className="p-2">{booking.endDate.toLocaleDateString()}</td>
                                    <td className="p-2">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="p-2 text-right">
                                        {booking.status === 'pending' && (
                                            <button onClick={() => handleCancel(booking.id)} className="text-xs text-red-600 hover:underline font-semibold">
                                                Cancel Request
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

const UserView: React.FC = () => {
    const { computers } = useApp();
    const [selectedComputer, setSelectedComputer] = useState<Computer | null>(null);

    return (
        <div className="space-y-8">
            <MyBookings />
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