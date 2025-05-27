import React from 'react';
import { EyeIcon, PencilSquareIcon, CalendarDaysIcon, PlusIcon } from '@heroicons/react/24/outline';

const appointments = [
  {
    patient: 'Abebe Kebede',
    date: '2023-06-25',
    time: '09:00 AM',
    type: 'Follow-up',
    status: 'Scheduled',
  },
  {
    patient: 'Tigist Hailu',
    date: '2023-06-25',
    time: '10:30 AM',
    type: 'Prenatal Check',
    status: 'Scheduled',
  },
  {
    patient: 'Hiwot Tesfaye',
    date: '2023-06-25',
    time: '02:00 PM',
    type: 'Diabetes Management',
    status: 'Scheduled',
  },
  {
    patient: 'Solomon Tadesse',
    date: '2023-06-26',
    time: '11:15 AM',
    type: 'Urgent Care',
    status: 'Scheduled',
  },
  {
    patient: 'Meron Alemu',
    date: '2023-06-26',
    time: '03:30 PM',
    type: 'Follow-up',
    status: 'Scheduled',
  },
  {
    patient: 'New Patient',
    date: '2023-06-27',
    time: '09:45 AM',
    type: 'Initial Consultation',
    status: 'Scheduled',
  },
];

const statusStyles = {
  Scheduled: 'bg-gray-100 text-gray-700',
};

const Appointments = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-8">Upcoming Appointments</h1>
        <div className="flex justify-end gap-2 mb-4">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 active:scale-95 transition font-medium">
            <CalendarDaysIcon className="w-5 h-5" /> View Calendar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 active:scale-95 transition font-medium">
            <PlusIcon className="w-5 h-5" /> New Appointment
          </button>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((appt, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold">{appt.patient}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{appt.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{appt.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{appt.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyles[appt.status]}`}>{appt.status}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                      <button className="text-gray-600 hover:text-black active:scale-95 transition-transform" title="Edit">
                        <PencilSquareIcon className="w-5 h-5" />
                      </button>
                      <button className="text-gray-600 hover:text-indigo-700 active:scale-95 transition-transform" title="View">
                        <EyeIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments; 