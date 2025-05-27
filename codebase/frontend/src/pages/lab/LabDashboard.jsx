import React, { useState } from 'react';
import { DocumentTextIcon, ClockIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

// Mock data
const mockLabData = {
  summary: {
    pendingTests: 2,
    inProgress: 2,
    completedToday: 5,
    urgentTests: 3,
  },
  testRequests: [
    {
      id: 'TR001',
      patient: 'Abebe Kebede',
      test: 'Complete Blood Count',
      requestedBy: 'Dr. Yohannes Alemu',
      urgency: 'Routine',
      status: 'Pending',
      actions: 'Process',
    },
    {
      id: 'TR002',
      patient: 'Tigist Hailu',
      test: 'Blood Chemistry',
      requestedBy: 'Dr. Yohannes Alemu',
      urgency: 'Urgent',
      status: 'In Progress',
      actions: 'Add Result',
    },
    {
      id: 'TR003',
      patient: 'Dawit Bekele',
      test: 'Malaria Test',
      requestedBy: 'Dr. Selam Haile',
      urgency: 'Urgent',
      status: 'Pending',
      actions: 'Process',
    },
    {
      id: 'TR004',
      patient: 'Hiwot Tesfaye',
      test: 'Lipid Profile',
      requestedBy: 'Dr. Yohannes Alemu',
      urgency: 'Routine',
      status: 'Completed',
      actions: '', // Completed might not have an action button
    },
    {
      id: 'TR005',
      patient: 'Solomon Tadesse',
      test: 'Urinalysis',
      requestedBy: 'Dr. Selam Haile',
      urgency: 'Emergency',
      status: 'In Progress',
      actions: 'Add Result',
    },
  ],
};

const LabDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const filteredRequests = mockLabData.testRequests.filter(request =>
    request.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.test.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.requestedBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Main Content */}
      <h1 className="text-3xl font-bold mb-8">Laboratory Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div
          className="bg-white p-6 rounded-lg shadow transition-transform hover:scale-105 cursor-pointer"
          onClick={() => navigate('/lab/pending-tests')}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Pending Tests</h3>
            <ClockIcon className="h-6 w-6 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold">{mockLabData.summary.pendingTests}</p>
          <p className="text-sm text-gray-500">+1 from yesterday</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow transition-transform hover:scale-105 cursor-pointer"
          onClick={() => navigate('/lab/in-progress-tests')}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">In Progress</h3>
            <DocumentTextIcon className="h-6 w-6 text-blue-500" />
          </div>
          <p className="text-3xl font-bold">{mockLabData.summary.inProgress}</p>
          <p className="text-sm text-gray-500">-1 from yesterday</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow transition-transform hover:scale-105 cursor-pointer"
          onClick={() => navigate('/lab/completed-tests')}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Completed Today</h3>
            <CheckCircleIcon className="h-6 w-6 text-green-500" />
          </div>
          <p className="text-3xl font-bold">{mockLabData.summary.completedToday}</p>
          <p className="text-sm text-gray-500">+2 from yesterday</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow transition-transform hover:scale-105 cursor-pointer"
          onClick={() => navigate('/lab/urgent-tests')}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Urgent Tests</h3>
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
          </div>
          <p className="text-3xl font-bold">{mockLabData.summary.urgentTests}</p>
          <p className="text-sm text-gray-500">Requires attention</p>
        </div>
      </div>

      {/* Test Requests */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Test Requests</h2>
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Search tests..."
              className="px-4 py-2 border rounded-lg mr-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {/* Add Recently Completed button */}
            <button className="px-4 py-2 bg-gray-200 rounded-lg">Recently Completed</button>
          </div>
        </div>

        {/* Test Requests Table */}
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested By</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRequests.map((request) => (
              <tr key={request.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{request.patient}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.test}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.requestedBy}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    request.urgency === 'Urgent' ? 'bg-yellow-100 text-yellow-800' :
                    request.urgency === 'Emergency' ? 'bg-red-100 text-red-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {request.urgency}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    request.status === 'Pending' ? 'bg-gray-200 text-gray-800' :
                    request.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {request.actions && (
                    <button
                      className="text-blue-600 hover:text-blue-900"
                      onClick={() => {
                        if (request.actions === 'Add Result' || request.actions === 'Process') {
                          navigate(`/lab/results/${request.id}`);
                        }
                      }}
                    >
                      {request.actions}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default LabDashboard; 