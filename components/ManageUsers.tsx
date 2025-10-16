import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import type { User } from '../types/types';
import Modal from './Modal';
import EditUserForm from './EditUserForm';
import { PencilIcon } from './icons/PencilIcon';
import { KeyIcon } from './icons/KeyIcon';
import { TrashIcon } from './icons/TrashIcon';

const ManageUsers: React.FC = () => {
    const { currentUser, users } = useApp();
    const [userToEdit, setUserToEdit] = useState<User | null>(null);

    // Filter out the current admin from the list to prevent self-editing certain properties
    const otherUsers = users.filter(u => u.id !== currentUser?.id);

    return (
        <>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
                 <h3 className="text-xl font-bold text-slate-800 mb-4">จัดการผู้ใช้ ({users.length})</h3>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50">
                            <tr className="border-b">
                                <th className="p-2 font-semibold">ชื่อ-นามสกุล</th>
                                <th className="p-2 font-semibold">ตำแหน่ง</th>
                                <th className="p-2 font-semibold">หน่วยงาน</th>
                                <th className="p-2 font-semibold">บทบาท</th>
                                <th className="p-2 font-semibold text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Current Admin always on top */}
                            {currentUser && (
                                <tr key={currentUser.id} className="border-b bg-indigo-50">
                                    <td className="p-2 font-semibold text-indigo-800">{currentUser.name} (คุณ)</td>
                                    <td className="p-2 text-indigo-700">{currentUser.position || '-'}</td>
                                    <td className="p-2 text-indigo-700">{currentUser.department || '-'}</td>
                                    <td className="p-2">
                                        <span className="px-2 py-1 text-xs font-bold rounded-full bg-green-200 text-green-800 capitalize">{currentUser.role}</span>
                                    </td>
                                    <td className="p-2 text-right">
                                        <button onClick={() => setUserToEdit(currentUser)} className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-200 rounded-md transition" title="แก้ไขข้อมูลของคุณ"><PencilIcon/></button>
                                    </td>
                                </tr>
                            )}
                            {otherUsers.map(user => (
                                <tr key={user.id} className="border-b hover:bg-slate-50">
                                    <td className="p-2">{user.name}</td>
                                    <td className="p-2">{user.position || '-'}</td>
                                    <td className="p-2">{user.department || '-'}</td>
                                    <td className="p-2">
                                         <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                                            user.role === 'admin' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-2 text-right flex justify-end items-center gap-1">
                                        <button onClick={() => setUserToEdit(user)} className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-200 rounded-md transition" title={`แก้ไข ${user.name}`}><PencilIcon/></button>
                                        {/* Add other actions like reset password or change role here */}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            </div>
            <Modal isOpen={!!userToEdit} onClose={() => setUserToEdit(null)}>
                {userToEdit && <EditUserForm userToEdit={userToEdit} onClose={() => setUserToEdit(null)} />}
            </Modal>
        </>
    );
};

export default ManageUsers;
