import React, { useState, useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import BookingCalendar from '../components/BookingCalendar';
import Modal from '../components/Modal';
import { UserIcon } from '../components/icons/UserIcon';
import { ComputerIcon } from '../components/icons/ComputerIcon';
import { CheckIcon } from '../components/icons/CheckIcon';
import { XIcon } from '../components/icons/XIcon';
import type { Computer } from '../types';
import { PencilIcon } from '../components/icons/PencilIcon';
import { TrashIcon } from '../components/icons/TrashIcon';
import ComputerForm from '../components/ComputerForm';
import { DownloadIcon } from '../components/icons/DownloadIcon';
import { UploadIcon } from '../components/icons/UploadIcon';


const AddUserForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addUser } = useApp();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && password) {
            setIsSubmitting(true);
            const success = await addUser(name.trim(), password);
            setIsSubmitting(false);
            if (success) {
                onClose();
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">เพิ่มผู้ใช้ใหม่</h3>
            <div>
                <label htmlFor="userName" className="block text-sm font-medium text-gray-700">ชื่อผู้ใช้</label>
                <input
                    type="text"
                    id="userName"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                    disabled={isSubmitting}
                />
            </div>
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">รหัสผ่าน</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                    disabled={isSubmitting}
                />
            </div>
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300" disabled={isSubmitting}>ยกเลิก</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400" disabled={isSubmitting}>
                    {isSubmitting ? 'กำลังเพิ่ม...' : 'เพิ่มผู้ใช้'}
                </button>
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
            alert('การอนุมัติล้มเหลว: การจองนี้ขัดแย้งกับการจองอื่นที่ได้รับการยืนยันแล้ว');
        }
    };

    const handleReject = (bookingId: string) => {
        if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการปฏิเสธและลบคำขอนี้?')) {
            deleteBooking(bookingId);
        }
    };
    
    if (pendingBookings.length === 0) {
        return (
             <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg text-center text-slate-500">
                <h3 className="text-xl font-bold text-slate-800 mb-2">คำขอจองที่รอดำเนินการ</h3>
                <p>ไม่มีคำขอจองที่รอดำเนินการในขณะนี้</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold text-slate-800 mb-4">คำขอจองที่รอดำเนินการ ({pendingBookings.length})</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50">
                        <tr className="border-b">
                            <th className="p-2 font-semibold">ผู้ใช้</th>
                            <th className="p-2 font-semibold">คอมพิวเตอร์</th>
                            <th className="p-2 font-semibold">จาก</th>
                            <th className="p-2 font-semibold">ถึง</th>
                            <th className="p-2 font-semibold">เหตุผล</th>
                            <th className="p-2 font-semibold text-right">การดำเนินการ</th>
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
                                    <td className="p-2">{booking.startDate.toLocaleDateString('th-TH')}</td>
                                    <td className="p-2">{booking.endDate.toLocaleDateString('th-TH')}</td>
                                    <td className="p-2 max-w-xs">
                                        <p className="truncate" title={booking.reason}>
                                            {booking.reason}
                                        </p>
                                    </td>
                                    <td className="p-2 flex justify-end gap-2">
                                        <button onClick={() => handleApprove(booking.id)} className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors" title="อนุมัติ">
                                            <CheckIcon className="h-5 w-5"/>
                                        </button>
                                        <button onClick={() => handleReject(booking.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors" title="ปฏิเสธ">
                                            <XIcon className="h-5 w-5"/>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const ManageComputers: React.FC = () => {
    const { computers, deleteComputer } = useApp();
    const [editingComputer, setEditingComputer] = useState<Computer | null>(null);

    const handleDelete = (computerId: string) => {
        if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบคอมพิวเตอร์เครื่องนี้? การดำเนินการนี้จะลบการจองทั้งหมดที่เกี่ยวข้องด้วย')) {
            deleteComputer(computerId);
        }
    };
    
    if (computers.length === 0) {
        return (
             <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg text-center text-slate-500">
                <h3 className="text-xl font-bold text-slate-800 mb-2">จัดการคอมพิวเตอร์</h3>
                <p>ยังไม่มีคอมพิวเตอร์ในระบบ กรุณาเพิ่มคอมพิวเตอร์</p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold text-slate-800 mb-4">จัดการคอมพิวเตอร์ ({computers.length})</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50">
                            <tr className="border-b">
                                <th className="p-2 font-semibold">รูปภาพ</th>
                                <th className="p-2 font-semibold">รหัสทรัพย์สิน</th>
                                <th className="p-2 font-semibold">ชื่อ</th>
                                <th className="p-2 font-semibold">ปี</th>
                                <th className="p-2 font-semibold text-right">การดำเนินการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {computers.map(computer => (
                                <tr key={computer.id} className="border-b hover:bg-slate-50">
                                    <td className="p-2">
                                        <img src={computer.imageUrl} alt={computer.name} className="h-10 w-16 object-cover rounded"/>
                                    </td>
                                    <td className="p-2 font-mono text-xs">{computer.assetNumber}</td>
                                    <td className="p-2">{computer.name}</td>
                                    <td className="p-2">{computer.purchaseYear}</td>
                                    <td className="p-2 flex justify-end items-center gap-2 h-14">
                                        <button onClick={() => setEditingComputer(computer)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors" title="แก้ไข">
                                            <PencilIcon className="h-5 w-5"/>
                                        </button>
                                        <button onClick={() => handleDelete(computer.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors" title="ลบ">
                                            <TrashIcon className="h-5 w-5"/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <Modal isOpen={!!editingComputer} onClose={() => setEditingComputer(null)}>
                <ComputerForm computerToEdit={editingComputer} onClose={() => setEditingComputer(null)} />
            </Modal>
        </>
    );
};


const AdminView: React.FC = () => {
    const { importData } = useApp();
    const [isAddUserModalOpen, setAddUserModalOpen] = useState(false);
    const [isAddComputerModalOpen, setAddComputerModalOpen] = useState(false);
    
    // NOTE: Import/Export is disabled when using a central database.
    const handleImportExportDisabled = () => {
        alert("ฟังก์ชันนำเข้า/ส่งออกข้อมูลไม่สามารถใช้งานได้เมื่อเชื่อมต่อกับฐานข้อมูลกลาง");
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-3xl font-bold text-slate-900">แดชบอร์ดผู้ดูแลระบบ</h2>
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => setAddUserModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition">
                        <UserIcon className="h-5 w-5" />
                        เพิ่มผู้ใช้
                    </button>
                    <button onClick={() => setAddComputerModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-700 transition">
                        <ComputerIcon className="h-5 w-5" />
                        เพิ่มคอมพิวเตอร์
                    </button>
                     <button onClick={handleImportExportDisabled} className="flex items-center gap-2 px-4 py-2 bg-slate-400 text-white rounded-md shadow cursor-not-allowed" title="ฟังก์ชันนี้ถูกปิดใช้งานเมื่อใช้ฐานข้อมูลกลาง">
                        <UploadIcon className="h-5 w-5" />
                        นำเข้าข้อมูล
                    </button>
                    <button onClick={handleImportExportDisabled} className="flex items-center gap-2 px-4 py-2 bg-slate-400 text-white rounded-md shadow cursor-not-allowed" title="ฟังก์ชันนี้ถูกปิดใช้งานเมื่อใช้ฐานข้อมูลกลาง">
                        <DownloadIcon className="h-5 w-5" />
                        ส่งออกข้อมูล
                    </button>
                </div>
            </div>

            <PendingBookings />
            <ManageComputers />
            
            <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">ปฏิทินการจองที่ยืนยันแล้ว</h2>
                <BookingCalendar />
            </div>

            <Modal isOpen={isAddUserModalOpen} onClose={() => setAddUserModalOpen(false)}>
                <AddUserForm onClose={() => setAddUserModalOpen(false)} />
            </Modal>
            <Modal isOpen={isAddComputerModalOpen} onClose={() => setAddComputerModalOpen(false)}>
                <ComputerForm onClose={() => setAddComputerModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default AdminView;
