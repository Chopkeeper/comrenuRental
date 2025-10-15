
import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import Modal from './Modal';

const ChangePasswordModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const { currentUser, changePassword } = useApp();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError("รหัสผ่านใหม่ไม่ตรงกัน");
            return;
        }
        if (!currentUser) {
            setError("ไม่มีผู้ใช้เข้าสู่ระบบ");
            return;
        }

        const isSuccess = changePassword(currentUser.id, oldPassword, newPassword);
        if (isSuccess) {
            setSuccess("เปลี่ยนรหัสผ่านสำเร็จ!");
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => {
                onClose();
                setSuccess('');
            }, 2000);
        } else {
            setError("รหัสผ่านเก่าไม่ถูกต้อง");
        }
    };
    
    const handleClose = () => {
        setError('');
        setSuccess('');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900">เปลี่ยนรหัสผ่าน</h3>
                {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded-md">{error}</p>}
                {success && <p className="text-green-600 text-sm bg-green-50 p-2 rounded-md">{success}</p>}
                <div>
                    <label htmlFor="oldPassword"className="block text-sm font-medium text-slate-700">รหัสผ่านเก่า</label>
                    <input
                        type="password"
                        id="oldPassword"
                        value={oldPassword}
                        onChange={e => setOldPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                    />
                </div>
                 <div>
                    <label htmlFor="newPassword"className="block text-sm font-medium text-slate-700">รหัสผ่านใหม่</label>
                    <input
                        type="password"
                        id="newPassword"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                    />
                </div>
                 <div>
                    <label htmlFor="confirmPassword"className="block text-sm font-medium text-slate-700">ยืนยันรหัสผ่านใหม่</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <button type="button" onClick={handleClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">ยกเลิก</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">อัปเดตรหัสผ่าน</button>
                </div>
            </form>
        </Modal>
    );
};

export default ChangePasswordModal;