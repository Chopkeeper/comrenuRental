import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import type { Booking } from '../types/types';
import Modal from './Modal';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';

const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
};

const BookingDetailsModal: React.FC<{ booking: Booking; onClose: () => void; }> = ({ booking, onClose }) => {
    const { currentUser, findComputerById, findUserById, updateBooking, deleteBooking } = useApp();
    const [isEditing, setIsEditing] = useState(false);
    const [startDate, setStartDate] = useState(formatDateForInput(booking.startDate));
    const [endDate, setEndDate] = useState(formatDateForInput(booking.endDate));
    const [reason, setReason] = useState(booking.reason || '');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const computer = findComputerById(booking.computerId);
    const user = findUserById(booking.userId);
    const canManage = currentUser?.role === 'admin' || currentUser?.id === booking.userId;

    const handleDelete = () => {
        if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบการจองนี้?')) {
            deleteBooking(booking.id);
            onClose();
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start > end) {
            setError('วันที่สิ้นสุดต้องอยู่หลังวันที่เริ่มต้น');
            return;
        }

        if (!reason.trim()) {
            setError('กรุณาระบุเหตุผลในการจอง');
            return;
        }

        setError('');
        setIsSubmitting(true);
        const success = await updateBooking(booking.id, { startDate: start, endDate: end, reason: reason.trim() });
        setIsSubmitting(false);

        if (success) {
            setIsEditing(false);
        } else {
            setError('เกิดข้อขัดแย้งในการจอง กรุณาเลือกวันอื่น');
        }
    };

    return (
        <Modal isOpen={true} onClose={onClose}>
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">รายละเอียดการจอง</h3>
                
                {!isEditing ? (
                    <div className="space-y-3 text-slate-700">
                        <p><span className="font-semibold">คอมพิวเตอร์:</span> {computer?.name}</p>
                        <p><span className="font-semibold">ผู้ใช้:</span> {user?.name}</p>
                        <p><span className="font-semibold">จาก:</span> {new Date(booking.startDate).toLocaleDateString('th-TH')}</p>
                        <p><span className="font-semibold">ถึง:</span> {new Date(booking.endDate).toLocaleDateString('th-TH')}</p>
                        <div className="pt-2">
                            <p className="font-semibold">เหตุผล:</p>
                            <p className="text-sm italic bg-slate-50 p-2 rounded-md whitespace-pre-wrap">{booking.reason}</p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleUpdate} className="space-y-4">
                         {error && <p className="text-red-500 text-sm">{error}</p>}
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">วันที่เริ่มต้น</label>
                            <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                        </div>
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">วันที่สิ้นสุด</label>
                            <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
                        </div>
                        <div>
                            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">เหตุผลในการจอง</label>
                            <textarea 
                                id="reason" 
                                value={reason} 
                                onChange={e => setReason(e.target.value)} 
                                rows={3}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" 
                                required 
                            />
                        </div>
                         <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">ยกเลิก</button>
                            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
                                {isSubmitting ? 'กำลังตรวจสอบ...' : 'บันทึกการเปลี่ยนแปลง'}
                            </button>
                        </div>
                    </form>
                )}


                <div className="flex justify-end gap-2 pt-4 border-t">
                    {canManage && !isEditing && (
                        <>
                            <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 font-semibold">
                                <TrashIcon className="h-5 w-5"/>ลบ
                            </button>
                            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 font-semibold">
                                <PencilIcon className="h-5 w-5"/>แก้ไข
                            </button>
                        </>
                    )}
                     <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">ปิด</button>
                </div>
            </div>
        </Modal>
    );
};

export default BookingDetailsModal;