import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import BookingCalendar from '../components/BookingCalendar';
import Modal from '../components/Modal';
import { UserIcon } from '../components/icons/UserIcon';
import { ComputerIcon } from '../components/icons/ComputerIcon';
import { generateComputerDescription } from '../services/geminiService';
import { CheckIcon } from '../components/icons/CheckIcon';
import { XIcon } from '../components/icons/XIcon';

const AddUserForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const { addUser } = useApp();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && password) {
            addUser(name.trim(), password);
            onClose();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Add New User</h3>
            <div>
                <label htmlFor="userName" className="block text-sm font-medium text-gray-700">User Name</label>
                <input
                    type="text"
                    id="userName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                />
            </div>
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                />
            </div>
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Add User</button>
            </div>
        </form>
    );
};

const AddComputerForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [assetNumber, setAssetNumber] = useState('');
    const [name, setName] = useState('');
    const [purchaseYear, setPurchaseYear] = useState(new Date().getFullYear());
    const [description, setDescription] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const { addComputer } = useApp();

    const handleGenerateDescription = async () => {
        if(!name || !purchaseYear) {
            alert("Please enter a name and purchase year first.");
            return;
        }
        setIsGenerating(true);
        try {
            const desc = await generateComputerDescription(name, purchaseYear);
            setDescription(desc);
        } catch (error) {
            console.error(error);
            setDescription("Error generating description.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (assetNumber.trim() && name.trim() && description.trim()) {
            addComputer({ assetNumber, name, purchaseYear, imageUrl: `https://picsum.photos/seed/${assetNumber}/400/300`, description });
            onClose();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <h3 className="text-lg font-medium leading-6 text-gray-900">Add New Computer</h3>
            <div>
                <label htmlFor="assetNumber" className="block text-sm font-medium text-gray-700">Asset Number</label>
                <input type="text" id="assetNumber" value={assetNumber} onChange={(e) => setAssetNumber(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
            </div>
            <div>
                <label htmlFor="computerName" className="block text-sm font-medium text-gray-700">Computer Name</label>
                <input type="text" id="computerName" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
            </div>
            <div>
                <label htmlFor="purchaseYear" className="block text-sm font-medium text-gray-700">Purchase Year</label>
                <input type="number" id="purchaseYear" value={purchaseYear} onChange={(e) => setPurchaseYear(parseInt(e.target.value))} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required></textarea>
                 <button type="button" onClick={handleGenerateDescription} disabled={isGenerating} className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isGenerating ? 'Generating...' : '✨ Auto-generate with AI'}
                </button>
            </div>
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Add Computer</button>
            </div>
        </form>
    );
};

const PendingBookings: React.FC = () => {
    const { bookings, findUserById, findComputerById, approveBooking, deleteBooking } = useApp();
    const pendingBookings = bookings.filter(b => b.status === 'pending').sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

    const handleApprove = async (bookingId: string) => {
        const success = await approveBooking(bookingId);
        if (!success) {
            alert('Approval failed: This booking conflicts with an already confirmed booking.');
        }
    };

    const handleReject = (bookingId: string) => {
        if (window.confirm('Are you sure you want to reject and delete this booking request?')) {
            deleteBooking(bookingId);
        }
    };
    
    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Pending Booking Requests ({pendingBookings.length})</h3>
            {pendingBookings.length === 0 ? (
                 <p className="text-slate-500">There are no pending booking requests.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50">
                            <tr className="border-b">
                                <th className="p-2 font-semibold">User</th>
                                <th className="p-2 font-semibold">Computer</th>
                                <th className="p-2 font-semibold">From</th>
                                <th className="p-2 font-semibold">To</th>
                                <th className="p-2 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingBookings.map(booking => {
                                const user = findUserById(booking.userId);
                                const computer = findComputerById(booking.computerId);
                                return (
                                     <tr key={booking.id} className="border-b hover:bg-slate-50">
                                        <td className="p-2">{user?.name}</td>
                                        <td className="p-2">{computer?.name}</td>
                                        <td className="p-2">{booking.startDate.toLocaleDateString()}</td>
                                        <td className="p-2">{booking.endDate.toLocaleDateString()}</td>
                                        <td className="p-2 flex justify-end gap-2">
                                            <button onClick={() => handleApprove(booking.id)} className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors" title="Approve">
                                                <CheckIcon className="h-5 w-5"/>
                                            </button>
                                            <button onClick={() => handleReject(booking.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors" title="Reject">
                                                <XIcon className="h-5 w-5"/>
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};


const AdminView: React.FC = () => {
    const [isAddUserModalOpen, setAddUserModalOpen] = useState(false);
    const [isAddComputerModalOpen, setAddComputerModalOpen] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-3xl font-bold text-slate-900">Admin Dashboard</h2>
                <div className="flex gap-2">
                    <button onClick={() => setAddUserModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition">
                        <UserIcon className="h-5 w-5" />
                        Add User
                    </button>
                    <button onClick={() => setAddComputerModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-700 transition">
                        <ComputerIcon className="h-5 w-5" />
                        Add Computer
                    </button>
                </div>
            </div>

            <PendingBookings />
            
            <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Confirmed Bookings Calendar</h2>
                <BookingCalendar />
            </div>

            <Modal isOpen={isAddUserModalOpen} onClose={() => setAddUserModalOpen(false)}>
                <AddUserForm onClose={() => setAddUserModalOpen(false)} />
            </Modal>
            <Modal isOpen={isAddComputerModalOpen} onClose={() => setAddComputerModalOpen(false)}>
                <AddComputerForm onClose={() => setAddComputerModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default AdminView;