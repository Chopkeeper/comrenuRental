import React from 'react';
import type { Computer } from '../types/types';

interface ComputerCardProps {
    computer: Computer;
    onBook: () => void;
}

const ComputerCard: React.FC<ComputerCardProps> = ({ computer, onBook }) => {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 flex flex-col">
            <img src={computer.imageUrl} alt={computer.name} className="w-full h-48 object-cover" />
            <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-bold">{computer.name}</h3>
                <p className="text-sm text-slate-500">รหัส: {computer.assetNumber} ({computer.purchaseYear})</p>
                <p className="text-sm text-slate-600 mt-2 flex-grow">{computer.description}</p>
                <button 
                    onClick={onBook}
                    className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
                >
                    จองเลย
                </button>
            </div>
        </div>
    );
};

export default ComputerCard;