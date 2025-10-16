import React from 'react';
import { useApp } from '../contexts/AppContext';
import { exportToCsv } from '../utils/export';
import { DownloadIcon } from './icons/DownloadIcon';

const BookingHistory: React.FC = () => {
    const { bookings, findUserById, findComputerById } = useApp();

    const sortedBookings = [...bookings].sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

    const handleExport = () => {
        const dataToExport = sortedBookings.map(booking => {
            const user = findUserById(booking.userId);
            const computer = findComputerById(booking.computerId);
            return {
                'ID_การจอง': booking.id,
                'ผู้ใช้': user?.name || 'N/A',
                'คอมพิวเตอร์': computer?.name || 'N/A',
                'รหัสทรัพย์สิน': computer?.assetNumber || 'N/A',
                'วันที่เริ่มต้น': booking.startDate.toLocaleDateString('th-TH'),
                'วันที่สิ้นสุด': booking.endDate.toLocaleDateString('th-TH'),
                'สถานะ': booking.status === 'confirmed' ? 'ยืนยันแล้ว' : 'รอดำเนินการ',
                'เหตุผล': booking.reason,
            };
        });

        if (dataToExport.length > 0) {
            exportToCsv(`booking_history_${new Date().toISOString().slice(0, 10)}.csv`, dataToExport);
        } else {
            alert('ไม่มีข้อมูลการจองที่จะส่งออก');
        }
    };
    
    const statusText: { [key: string]: string } = {
        pending: 'รอดำเนินการ',
        confirmed: 'ยืนยันแล้ว',
    };

    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h3 className="text-xl font-bold text-slate-800">ประวัติการจองทั้งหมด ({bookings.length})</h3>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-md shadow hover:bg-teal-700 transition disabled:bg-teal-300 disabled:cursor-not-allowed"
                    disabled={bookings.length === 0}
                >
                    <DownloadIcon className="h-5 w-5" />
                    ส่งออกเป็น CSV
                </button>
            </div>
            
            {sortedBookings.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                    <p>ยังไม่มีประวัติการจองในระบบ</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50">
                            <tr className="border-b">
                                <th className="p-2 font-semibold">ผู้ใช้</th>
                                <th className="p-2 font-semibold">คอมพิวเตอร์</th>
                                <th className="p-2 font-semibold">จาก</th>
                                <th className="p-2 font-semibold">ถึง</th>
                                <th className="p-2 font-semibold">สถานะ</th>
                                <th className="p-2 font-semibold">เหตุผล</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedBookings.map(booking => {
                                const user = findUserById(booking.userId);
                                const computer = findComputerById(booking.computerId);
                                return (
                                    <tr key={booking.id} className="border-b hover:bg-slate-50">
                                        <td className="p-2">{user?.name || '-'}</td>
                                        <td className="p-2">{computer?.name || '-'}</td>
                                        <td className="p-2">{booking.startDate.toLocaleDateString('th-TH')}</td>
                                        <td className="p-2">{booking.endDate.toLocaleDateString('th-TH')}</td>
                                        <td className="p-2">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                                                booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {statusText[booking.status]}
                                            </span>
                                        </td>
                                        <td className="p-2 max-w-xs">
                                            <p className="truncate" title={booking.reason}>
                                                {booking.reason}
                                            </p>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default BookingHistory;