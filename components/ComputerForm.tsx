import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { generateComputerDescription } from '../services/geminiService';
import type { Computer } from '../types';

interface ComputerFormProps {
    onClose: () => void;
    computerToEdit?: Computer | null;
}

const ComputerForm: React.FC<ComputerFormProps> = ({ onClose, computerToEdit }) => {
    const [assetNumber, setAssetNumber] = useState('');
    const [name, setName] = useState('');
    const [purchaseYear, setPurchaseYear] = useState(new Date().getFullYear());
    const [description, setDescription] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const { addComputer, updateComputer } = useApp();

    const isEditing = !!computerToEdit;

    useEffect(() => {
        if (isEditing) {
            setAssetNumber(computerToEdit.assetNumber);
            setName(computerToEdit.name);
            setPurchaseYear(computerToEdit.purchaseYear);
            setDescription(computerToEdit.description);
        } else {
            // Reset form for adding new
            setAssetNumber('');
            setName('');
            setPurchaseYear(new Date().getFullYear());
            setDescription('');
        }
    }, [computerToEdit, isEditing]);


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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (assetNumber.trim() && name.trim() && description.trim()) {
            const computerData = { 
                assetNumber, 
                name, 
                purchaseYear, 
                // Don't update image URL on edit unless we add that feature
                imageUrl: computerToEdit?.imageUrl || `https://picsum.photos/seed/${assetNumber}/400/300`, 
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
             <h3 className="text-lg font-medium leading-6 text-gray-900">{isEditing ? 'Edit Computer' : 'Add New Computer'}</h3>
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
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" required></textarea>
                 <button type="button" onClick={handleGenerateDescription} disabled={isGenerating} className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isGenerating ? 'Generating...' : '✨ Auto-generate with AI'}
                </button>
            </div>
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">{isEditing ? 'Save Changes' : 'Add Computer'}</button>
            </div>
        </form>
    );
};

export default ComputerForm;
