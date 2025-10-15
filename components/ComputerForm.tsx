import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { generateComputerDescription } from '../services/geminiService';
import type { Computer } from '../types/types';

interface ComputerFormProps {
    onClose: () => void;
    computerToEdit?: Computer | null;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};


const ComputerForm: React.FC<ComputerFormProps> = ({ onClose, computerToEdit }) => {
    const [assetNumber, setAssetNumber] = useState('');
    const [name, setName] = useState('');
    const [purchaseYear, setPurchaseYear] = useState(new Date().getFullYear());
    const [description, setDescription] = useState('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const { addComputer, updateComputer } = useApp();

    const isEditing = !!computerToEdit;

    useEffect(() => {
        if (isEditing) {
            setAssetNumber(computerToEdit.assetNumber);
            setName(computerToEdit.name);
            setPurchaseYear(computerToEdit.purchaseYear);
            setDescription(computerToEdit.description);
            setImagePreview(computerToEdit.imageUrl);
        } else {
            // Reset form for adding new
            setAssetNumber('');
            setName('');
            setPurchaseYear(new Date().getFullYear());
            setDescription('');
            setImagePreview(null);
        }
    }, [computerToEdit, isEditing]);


    const handleGenerateDescription = async () => {
        if(!name || !purchaseYear) {
            alert("กรุณากรอกชื่อและปีที่ซื้อก่อน");
            return;
        }
        setIsGenerating(true);
        try {
            const desc = await generateComputerDescription(name, purchaseYear);
            setDescription(desc);
        } catch (error) {
            console.error(error);
            setDescription("เกิดข้อผิดพลาดในการสร้างคำอธิบาย");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const base64 = await fileToBase64(file);
            setImagePreview(base64);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!imagePreview) {
            alert('กรุณาอัปโหลดรูปภาพสำหรับคอมพิวเตอร์');
            return;
        }
        if (assetNumber.trim() && name.trim() && description.trim()) {
            const computerData = { 
                assetNumber, 
                name, 
                purchaseYear, 
                imageUrl: imagePreview,
                description 
            };
            
            if (isEditing) {
                updateComputer(computerToEdit.id, computerData);
            } else {
                addComputer(computerData);
            }
            onClose();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <h3 className="text-lg font-medium leading-6 text-gray-900">{isEditing ? 'แก้ไขข้อมูลคอมพิวเตอร์' : 'เพิ่มคอมพิวเตอร์ใหม่'}</h3>
            <div>
                <label htmlFor="assetNumber" className="block text-sm font-medium text-gray-700">รหัสทรัพย์สิน</label>
                <input type="text" id="assetNumber" value={assetNumber} onChange={(e) => setAssetNumber(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
            </div>
            <div>
                <label htmlFor="computerName" className="block text-sm font-medium text-gray-700">ชื่อคอมพิวเตอร์</label>
                <input type="text" id="computerName" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">รูปภาพ</label>
                <div className="mt-1 flex items-center gap-4">
                    {imagePreview && <img src={imagePreview} alt="Preview" className="h-16 w-24 object-cover rounded shadow-sm"/>}
                    <div className="flex-grow">
                        <input 
                            type="file" 
                            id="computerImage" 
                            accept="image/png, image/jpeg, image/webp"
                            onChange={handleImageChange}
                            className="block w-full text-sm text-slate-500
                                       file:mr-4 file:py-2 file:px-4
                                       file:rounded-full file:border-0
                                       file:text-sm file:font-semibold
                                       file:bg-indigo-50 file:text-indigo-700
                                       hover:file:bg-indigo-100"
                        />
                    </div>
                </div>
            </div>
            <div>
                <label htmlFor="purchaseYear" className="block text-sm font-medium text-gray-700">ปีที่ซื้อ</label>
                <input type="number" id="purchaseYear" value={purchaseYear} onChange={(e) => setPurchaseYear(parseInt(e.target.value))} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required />
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">คำอธิบาย</label>
                <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required></textarea>
                 <button type="button" onClick={handleGenerateDescription} disabled={isGenerating} className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isGenerating ? 'กำลังสร้าง...' : '✨ สร้างอัตโนมัติด้วย AI'}
                </button>
            </div>
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">ยกเลิก</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">{isEditing ? 'บันทึกการเปลี่ยนแปลง' : 'เพิ่มคอมพิวเตอร์'}</button>
            </div>
        </form>
    );
};

export default ComputerForm;