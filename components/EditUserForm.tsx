
import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import type { User } from '../types/types';

interface EditUserFormProps {
    onClose: () => void;
    userToEdit: User | null;
}

const EditUserForm: React.FC<EditUserFormProps> = ({ onClose, userToEdit }) => {
    const { /* updateUser */ } = useApp(); // Assuming updateUser exists in AppContext
    const [name, setName] = useState('');
    const [role, setRole] = useState<'admin' | 'user'>('user');
    
    useEffect(() => {
        if (userToEdit) {
            setName(userToEdit.name);
            setRole(userToEdit.role);
        }
    }, [userToEdit]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (userToEdit && name.trim()) {
            // updateUser(userToEdit.id, { name: name.trim(), role });
            console.log('Update user functionality not fully implemented in context yet.');
            onClose();
        }
    };
    
    if (!userToEdit) return null;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Edit User: {userToEdit.name}</h3>
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
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as 'admin' | 'user')}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
            </div>
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Save Changes</button>
            </div>
        </form>
    );
};

export default EditUserForm;
