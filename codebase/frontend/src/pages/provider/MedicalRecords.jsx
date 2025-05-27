import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const MedicalRecords = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for assigned patients - in real app, this would come from an API
  const assignedPatients = [
    {
      id: 'P12345',
      name: 'Abebe Kebede',
      age: 45,
      gender: 'Male',
      lastVisit: '2023-06-15',
      nextAppointment: '2023-07-20',
    },
    {
      id: 'P12346',
      name: 'Tigist Hailu',
      age: 32,
      gender: 'Female',
      lastVisit: '2023-06-10',
      nextAppointment: '2023-07-15',
    },
    {
      id: 'P12347',
      name: 'Solomon Tadesse',
      age: 28,
      gender: 'Male',
      lastVisit: '2023-06-05',
      nextAppointment: '2023-07-10',
    },
  ];

  const filteredPatients = assignedPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePatientClick = (patientId) => {
    navigate(`/provider/medical-record/${patientId}`);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Medical Records</h1>
        <p className="mt-1 text-sm text-gray-600">
          Search and view medical records of your assigned patients
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Search by patient name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Patients List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredPatients.map((patient) => (
            <li key={patient.id}>
              <button
                onClick={() => handlePatientClick(patient.id)}
                className="block w-full hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition duration-150 ease-in-out"
              >
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 font-medium">
                            {patient.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {patient.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {patient.id} • {patient.age} years • {patient.gender}
                        </div>
                      </div>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <div className="text-sm text-gray-500">
                        <div>Last Visit: {patient.lastVisit}</div>
                        <div>Next Appointment: {patient.nextAppointment}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No patients found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default MedicalRecords; 