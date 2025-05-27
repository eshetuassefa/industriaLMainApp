import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  EyeIcon,
  LinkIcon,
  BeakerIcon,
  Squares2X2Icon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';

const patients = [
  {
    name: 'Abebe Kebede',
    age: 45,
    gender: 'M',
    diagnosis: 'Hypertension',
    lastVisit: '2023-06-15',
    status: 'Stable',
  },
  {
    name: 'Tigist Hailu',
    age: 32,
    gender: 'F',
    diagnosis: 'Pregnancy',
    lastVisit: '2023-06-18',
    status: 'Stable',
  },
  {
    name: 'Dawit Bekele',
    age: 28,
    gender: 'M',
    diagnosis: 'Malaria',
    lastVisit: '2023-06-20',
    status: 'Improving',
  },
  {
    name: 'Hiwot Tesfaye',
    age: 65,
    gender: 'F',
    diagnosis: 'Diabetes',
    lastVisit: '2023-06-12',
    status: 'Stable',
  },
  {
    name: 'Solomon Tadesse',
    age: 8,
    gender: 'M',
    diagnosis: 'Pneumonia',
    lastVisit: '2023-06-21',
    status: 'Critical',
  },
  {
    name: 'Meron Alemu',
    age: 52,
    gender: 'F',
    diagnosis: 'Arthritis',
    lastVisit: '2023-06-10',
    status: 'Stable',
  },
];

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

const tabs = [
  { name: 'Recent Patients', key: 'recent' },
  { name: 'Upcoming Appointments', key: 'appointments' },
];

const statusStyles = {
  Stable: 'bg-gray-100 text-gray-700',
  Improving: 'bg-black text-white',
  Critical: 'bg-red-500 text-white',
  Scheduled: 'bg-gray-100 text-gray-700',
};

const Patients = () => {
  const [activeTab, setActiveTab] = useState('recent');
  const navigate = useNavigate();

  const handleViewRecord = (patientId) => {
    navigate(`/provider/medical-record/${patientId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Tabs */}
        <div className="flex mb-4 bg-gray-100 rounded-lg overflow-hidden">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2 text-center text-sm font-medium transition-colors duration-150 ${
                activeTab === tab.key
                  ? 'bg-white text-black shadow'
                  : 'text-gray-500 hover:text-black'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Search and View All */}
        <div className="flex items-center justify-end mb-2 gap-2">
          <div className="relative w-full max-w-xs">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={activeTab === 'recent' ? 'Search patients...' : 'Search appointments...'}
              className="pl-10 pr-2 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 text-sm w-full"
            />
          </div>
          <button className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 active:scale-95 transition font-medium">View All</button>
        </div>

        {/* Card/Table */}
        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'recent' ? (
            <>
              <h2 className="font-semibold mb-4">Recent Patients</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age/Gender</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diagnosis</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Visit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {patients.map((patient, idx) => (
                      <tr key={idx}>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold">{patient.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{patient.age}/{patient.gender}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{patient.diagnosis}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{patient.lastVisit}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyles[patient.status]}`}>{patient.status}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                          <button className="text-gray-600 hover:text-black active:scale-95 transition-transform" title="Link">
                            <LinkIcon className="w-5 h-5" />
                          </button>
                          <button className="text-gray-600 hover:text-black active:scale-95 transition-transform" title="Lab">
                            <BeakerIcon className="w-5 h-5" />
                          </button>
                          <button className="text-gray-600 hover:text-black active:scale-95 transition-transform" title="Other">
                            <Squares2X2Icon className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleViewRecord(idx + 1)}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <EyeIcon className="w-4 h-4 mr-1" />
                            Visit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              <h2 className="font-semibold mb-4">Upcoming Appointments</h2>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Patients; 