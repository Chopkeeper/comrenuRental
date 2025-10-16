import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import type { User } from '../types/types';
import { positions, departments, employeeTypes } from '../utils/formData';

interface EditUserFormProps {
    onClose: () => void;
    userToEdit: User;
}

const EditUserForm: React.FC<EditUserFormProps> = ({ onClose, userToEdit }) => {
    const { updateUser } = useApp();
    const [name, setName] = useState(userToEdit.name);
    const [position, setPosition] = useState(userToEdit.position || '');
    const [department, setDepartment] = useState(userToEdit.department || '');
    const [employeeType, setEmployeeType] = useState(userToEdit.employeeType || '');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setName(userToEdit.name);
        setPosition(userToEdit.position || '');
        setDepartment(userToEdit.department || '');
        setEmployeeType(userToEdit.employeeType || '');
    }, [userToEdit]);
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const success = await updateUser(userToEdit.id, { name, position, department, employeeType });
        setIsLoading(false);
        if (success) {
            onClose();
        } else {
            alert('Failed to update user.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">แก้ไขผู้ใช้: {userToEdit.name}</h3>
            <div>
                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700">ชื่อ-นามสกุล:</label>
                <input id="edit-name" type="text" value={name} onChange={e => setName(e.target.value)} required className="mt-1 w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
                <label htmlFor="edit-position" className="block text-sm font-medium text-gray-700">ตำแหน่ง:</label>
                <select id="edit-position" value={position} onChange={e => setPosition(e.target.value)} required className="mt-1 w-full px-3 py-2 border rounded-md bg-white">
                    <option value="">-- กรุณาเลือกตำแหน่ง --</option>
                    {positions.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="edit-employeeType" className="block text-sm font-medium text-gray-700">ประเภทเจ้าหน้าที่:</label>
                <select id="edit-employeeType" value={employeeType} onChange={e => setEmployeeType(e.target.value)} required className="mt-1 w-full px-3 py-2 border rounded-md bg-white">
                    <option value="">-- กรุณาเลือกประเภท --</option>
                    {employeeTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="edit-department" className="block text-sm font-medium text-gray-700">หน่วยงาน/แผนก:</label>
                <select id="edit-department" value={department} onChange={e => setDepartment(e.target.value)} required className="mt-1 w-full px-3 py-2 border rounded-md bg-white">
                    <option value="">-- กรุณาเลือกหน่วยงาน --</option>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">ยกเลิก</button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400">
                    {isLoading ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
                </button>
            </div>
        </form>
    );
};

export default EditUserForm;