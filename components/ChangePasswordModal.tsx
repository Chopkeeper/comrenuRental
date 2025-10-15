
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
            setError("New passwords do not match.");
            return;
        }
        if (!currentUser) {
            setError("No user is logged in.");
            return;
        }

        const isSuccess = changePassword(currentUser.id, oldPassword, newPassword);
        if (isSuccess) {
            setSuccess("Password changed successfully!");
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setTimeout(() => {
                onClose();
                setSuccess('');
            }, 2000);
        } else {
            setError("Incorrect old password.");
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
                <h3 className="text-lg font-medium leading-6 text-gray-900">Change Password</h3>
                {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded-md">{error}</p>}
                {success && <p className="text-green-600 text-sm bg-green-50 p-2 rounded-md">{success}</p>}
                <div>
                    <label htmlFor="oldPassword"className="block text-sm font-medium text-slate-700">Old Password</label>
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
                    <label htmlFor="newPassword"className="block text-sm font-medium text-slate-700">New Password</label>
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
                    <label htmlFor="confirmPassword"className="block text-sm font-medium text-slate-700">Confirm New Password</label>
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
                    <button type="button" onClick={handleClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Update Password</button>
                </div>
            </form>
        </Modal>
    );
};

export default ChangePasswordModal;
