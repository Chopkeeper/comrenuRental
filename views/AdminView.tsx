import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import BookingCalendar from '../components/BookingCalendar';
import Modal from '../components/Modal';
import { UserIcon } from '../components/icons/UserIcon';
import { ComputerIcon } from '../components/icons/ComputerIcon';
import { PencilIcon } from '../components/icons/PencilIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import { DownloadIcon } from '../components/icons/DownloadIcon';
import { generateComputerDescription } from '../services/geminiService';
import { exportToCsv } from '../utils/export';
import type { Computer } from '../types/types';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

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

const ComputerForm: React.FC<{ onClose: () => void; computerToEdit: Computer | null }> = ({ onClose, computerToEdit }) => {
    const [assetNumber, setAssetNumber] = useState('');
    const [name, setName] = useState('');
    const [purchaseYear, setPurchaseYear] = useState(new Date().getFullYear());
    const [description, setDescription] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const { addComputer, updateComputer } = useApp();

    useEffect(() => {
        if (computerToEdit) {
            setAssetNumber(computerToEdit.assetNumber);
            setName(computerToEdit.name);
            setPurchaseYear(computerToEdit.purchaseYear);
            setDescription(computerToEdit.description);
            setImage(computerToEdit.imageUrl);
        }
    }, [computerToEdit]);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const base64 = await fileToBase64(e.target.files[0]);
            setImage(base64);
        }
    };

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (assetNumber.trim() && name.trim() && description.trim() && image) {
            const computerData = { assetNumber, name, purchaseYear, imageUrl: image, description };
            if (computerToEdit) {
                await updateComputer(computerToEdit.id, computerData);
            } else {
                await addComputer(computerData);
            }
            onClose();
        } else {
            alert('Please fill all fields and upload an image.')
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <h3 className="text-lg font-medium leading-6 text-gray-900">{computerToEdit ? 'Edit' : 'Add New'} Computer</h3>
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
                <label htmlFor="image" className="block text-sm font-medium text-gray-700">Image</label>
                <input type="file" id="image" onChange={handleImageChange} accept="image/*" className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                {image && <img src={image} alt="Preview" className="mt-2 h-20 w-auto rounded" />}
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
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">{computerToEdit ? 'Save Changes' : 'Add Computer'}</button>
            </div>
        </form>
    );
};

const ReportsSection: React.FC = () => {
    const { bookings, findComputerById, findUserById } = useApp();
    const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7));
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = () => {
        setIsExporting(true);
        if (!reportMonth) {
            alert('Please select a month to generate the report.');
            setIsExporting(false);
            return;
        }

        const [year, month] = reportMonth.split('-').map(Number);
        const startDateOfMonth = new Date(year, month - 1, 1);
        const endDateOfMonth = new Date(year, month, 0, 23, 59, 59);

        const filteredBookings = bookings.filter(b => {
            const bookingStart = new Date(b.startDate);
            const bookingEnd = new Date(b.endDate);
            return bookingStart <= endDateOfMonth && bookingEnd >= startDateOfMonth;
        });

        if (filteredBookings.length === 0) {
            alert(`No bookings found for ${startDateOfMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}.`);
            setIsExporting(false);
            return;
        }
        
        const reportData = filteredBookings.map(b => {
            const computer = findComputerById(b.computerId);
            const user = findUserById(b.userId);
            return {
                'Booking ID': b.id,
                'Computer Name': computer?.name || 'N/A',
                'Asset Number': computer?.assetNumber || 'N/A',
                'Booked By': user?.name || 'N/A',
                'Start Date': new Date(b.startDate).toLocaleDateString(),
                'End Date': new Date(b.endDate).toLocaleDateString(),
            };
        });

        const monthName = startDateOfMonth.toLocaleString('default', { month: 'long' });
        exportToCsv(`Booking_Report_${monthName}_${year}.csv`, reportData);
        setIsExporting(false);
    };

    return (
         <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Monthly Reports</h3>
            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div>
                    <label htmlFor="reportMonth" className="block text-sm font-medium text-gray-700">Select Month</label>
                    <input
                        type="month"
                        id="reportMonth"
                        value={reportMonth}
                        onChange={(e) => setReportMonth(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
                <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md shadow hover:bg-teal-700 transition self-end sm:self-center mt-2 sm:mt-0 disabled:opacity-50"
                    aria-label="Export booking report to Excel"
                >
                    <DownloadIcon className="h-5 w-5"/>
                    {isExporting ? 'Exporting...' : 'Export to Excel'}
                </button>
            </div>
        </div>
    );
};

const ComputerList: React.FC<{ onEdit: (computer: Computer) => void }> = ({ onEdit }) => {
    const { computers, deleteComputer } = useApp();
    
    const handleDelete = (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete ${name}? This will also remove all associated bookings.`)) {
            deleteComputer(id);
        }
    }

    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Manage Inventory</h3>
            <div className="space-y-3">
                {computers.map(computer => (
                    <div key={computer.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-md">
                        <div className="flex items-center gap-4">
                            <img src={computer.imageUrl} alt={computer.name} className="h-12 w-16 object-cover rounded"/>
                            <div>
                                <p className="font-semibold text-slate-800">{computer.name}</p>
                                <p className="text-sm text-slate-500">{computer.assetNumber}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => onEdit(computer)} className="p-2 text-slate-600 hover:text-indigo-600 transition" aria-label={`Edit ${computer.name}`}>
                                <PencilIcon />
                            </button>
                            <button onClick={() => handleDelete(computer.id, computer.name)} className="p-2 text-slate-600 hover:text-red-600 transition" aria-label={`Delete ${computer.name}`}>
                                <TrashIcon />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const AdminView: React.FC = () => {
    const [isAddUserModalOpen, setAddUserModalOpen] = useState(false);
    const [isComputerModalOpen, setComputerModalOpen] = useState(false);
    const [computerToEdit, setComputerToEdit] = useState<Computer | null>(null);

    const handleAddComputer = () => {
        setComputerToEdit(null);
        setComputerModalOpen(true);
    };

    const handleEditComputer = (computer: Computer) => {
        setComputerToEdit(computer);
        setComputerModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-3xl font-bold text-slate-900">Admin Dashboard</h2>
                <div className="flex gap-2">
                    <button onClick={() => setAddUserModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition">
                        <UserIcon className="h-5 w-5" />
                        Add User
                    </button>
                    <button onClick={handleAddComputer} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-700 transition">
                        <ComputerIcon className="h-5 w-5" />
                        Add Computer
                    </button>
                </div>
            </div>
            
            <ReportsSection />
            <ComputerList onEdit={handleEditComputer} />
            <BookingCalendar />

            <Modal isOpen={isAddUserModalOpen} onClose={() => setAddUserModalOpen(false)}>
                <AddUserForm onClose={() => setAddUserModalOpen(false)} />
            </Modal>
            <Modal isOpen={isComputerModalOpen} onClose={() => setComputerModalOpen(false)}>
                <ComputerForm onClose={() => setComputerModalOpen(false)} computerToEdit={computerToEdit} />
            </Modal>
        </div>
    );
};

export default AdminView;