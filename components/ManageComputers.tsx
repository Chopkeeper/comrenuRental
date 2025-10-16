import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import type { Computer } from '../types/types';
import Modal from './Modal';
import ComputerForm from './ComputerForm';
import { ComputerIcon } from './icons/ComputerIcon';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';

const ManageComputers: React.FC = () => {
    const { computers, deleteComputer } = useApp();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [computerToEdit, setComputerToEdit] = useState<Computer | null>(null);

    const openFormForEdit = (computer: Computer) => {
        setComputerToEdit(computer);
        setIsFormOpen(true);
    };
    
    const openFormForAdd = () => {
        setComputerToEdit(null);
        setIsFormOpen(true);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบคอมพิวเตอร์เครื่องนี้และข้อมูลการจองทั้งหมดที่เกี่ยวข้อง?')) {
            deleteComputer(id);
        }
    };
    
    return (
        <>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <h3 className="text-xl font-bold text-slate-800">จัดการคอมพิวเตอร์ ({computers.length})</h3>
                     <button onClick={openFormForAdd} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 transition">
                        <ComputerIcon className="h-5 w-5" />
                        เพิ่มคอมพิวเตอร์ใหม่
                    </button>
                </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50">
                            <tr className="border-b">
                                <th className="p-2 font-semibold">รูปภาพ</th>
                                <th className="p-2 font-semibold">ชื่อ</th>
                                <th className="p-2 font-semibold">รหัสทรัพย์สิน</th>
                                <th className="p-2 font-semibold">ปีที่ซื้อ</th>
                                <th className="p-2 font-semibold text-right">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {computers.map(computer => (
                                <tr key={computer.id} className="border-b hover:bg-slate-50">
                                    <td className="p-2"><img src={computer.imageUrl} alt={computer.name} className="h-10 w-16 object-cover rounded"/></td>
                                    <td className="p-2 font-medium">{computer.name}</td>
                                    <td className="p-2">{computer.assetNumber}</td>
                                    <td className="p-2">{computer.purchaseYear}</td>
                                    <td className="p-2 text-right flex justify-end items-center gap-1 h-full">
                                        <button onClick={() => openFormForEdit(computer)} className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-200 rounded-md transition" title={`แก้ไข ${computer.name}`}><PencilIcon/></button>
                                        <button onClick={() => handleDelete(computer.id)} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-200 rounded-md transition" title={`ลบ ${computer.name}`}><TrashIcon/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
            </div>

            <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)}>
                <ComputerForm 
                    onClose={() => setIsFormOpen(false)} 
                    computerToEdit={computerToEdit} 
                />
            </Modal>
        </>
    );
};

export default ManageComputers;
