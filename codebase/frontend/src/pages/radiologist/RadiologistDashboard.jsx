import React, { useState } from 'react';
import {
  ClockIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon, // Used for Dashboard icon in layout, maybe keep for consistency or remove?
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  MagnifyingGlassIcon, // Assuming a search icon might be needed
  PlusIcon, // Assuming a plus icon might be needed for actions like 'Schedule Scan'
  // Icons for Scan Types Distribution (using placeholders for now)
  BeakerIcon, // Placeholder for X-Ray?
  CubeIcon, // Placeholder for Ultrasound?
  ComputerDesktopIcon, // Placeholder for CT Scan?
  AcademicCapIcon, // Placeholder for MRI?
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const mockDashboardData = {
  summary: {
    pendingScans: 3,
    inProgress: 2,
    completedToday: 4,
    emergencyScans: 1,
  },
  scanTypes: [
    { type: 'X-Rays', count: 8, icon: BeakerIcon, color: 'blue' }, // Using placeholder icons and colors
    { type: 'Ultrasounds', count: 5, icon: CubeIcon, color: 'green' },
    { type: 'CT Scans', count: 3, icon: ComputerDesktopIcon, color: 'orange' },
    { type: 'MRIs', count: 2, icon: AcademicCapIcon, color: 'purple' },
  ],
  equipmentStatus: [
    { name: 'X-Ray Machine 1', status: 'Operational', color: 'green' },
    { name: 'X-Ray Machine 2', status: 'Operational', color: 'green' },
    { name: 'Ultrasound Machine', status: 'Operational', color: 'green' },
    { name: 'CT Scanner', status: 'Maintenance at 6PM', color: 'orange' },
    { name: 'MRI Machine', status: 'Operational', color: 'green' },
  ],
  radiologyRequests: [
    { id: 'R001', patient: 'Abebe Kebede', scanType: 'Chest X-Ray', requestedBy: 'Dr. Yohannes Alemu', urgency: 'Routine', status: 'Pending', actions: 'Perform Scan' },
    // Add other mock data based on the image or typical radiology workflow
  ],
};

const RadiologistDashboard = () => {
  const [activeTab, setActiveTab] = useState('pendingInProgress'); // State for tabs
  const [searchTerm, setSearchTerm] = useState(''); // State for search input
  const navigate = useNavigate();

  // Filter requests based on active tab and search term (basic filtering for now)
  const filteredRequests = mockDashboardData.radiologyRequests.filter(request => {
    const matchesSearch = request.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          request.scanType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          request.requestedBy.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === 'pendingInProgress') {
      return matchesSearch && (request.status === 'Pending' || request.status === 'In Progress');
    } else if (activeTab === 'scheduled') {
      // No scheduled data in mock, implement filtering if added
      return false; // Or implement filtering logic
    } else if (activeTab === 'recentlyCompleted') {
       // No recently completed data in mock, implement filtering if added
       return false; // Or implement filtering logic
    }
    return matchesSearch; // Default or for a combined view
  });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Radiologist Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Pending Scans Card */}
        <div
          className="bg-white p-6 rounded-lg shadow transition-transform hover:scale-105 cursor-pointer"
          onClick={() => navigate('/radiologist/pending-scans')}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Pending Scans</h3>
            <ClockIcon className="h-6 w-6 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold">{mockDashboardData.summary.pendingScans}</p>
          <p className="text-sm text-gray-500">+1 from yesterday</p>
        </div>

        {/* In Progress Card */}
        <div
          className="bg-white p-6 rounded-lg shadow transition-transform hover:scale-105 cursor-pointer"
          onClick={() => navigate('/radiologist/in-progress-scans')}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">In Progress</h3>
            <DocumentTextIcon className="h-6 w-6 text-blue-500" />
          </div>
          <p className="text-3xl font-bold">{mockDashboardData.summary.inProgress}</p>
          <p className="text-sm text-gray-500">-1 from yesterday</p>
        </div>

        {/* Completed Today Card */}
        <div
          className="bg-white p-6 rounded-lg shadow transition-transform hover:scale-105 cursor-pointer"
          onClick={() => navigate('/radiologist/completed-scans')}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Completed Today</h3>
            <CheckCircleIcon className="h-6 w-6 text-green-500" />
          </div>
          <p className="text-3xl font-bold">{mockDashboardData.summary.completedToday}</p>
          <p className="text-sm text-gray-500">+2 from yesterday</p>
        </div>

        {/* Emergency Scans Card */}
        <div
          className="bg-white p-6 rounded-lg shadow transition-transform hover:scale-105 cursor-pointer"
          onClick={() => navigate('/radiologist/urgent-scans')}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Emergency Scans</h3>
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
          </div>
          <p className="text-3xl font-bold">{mockDashboardData.summary.emergencyScans}</p>
          <p className="text-sm text-gray-500">Requires immediate attention</p>
        </div>
      </div>

      {/* Scan Types Distribution and Equipment Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Scan Types Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Scan Types Distribution</h2>
          <p className="text-sm text-gray-500 mb-4">Today's workload by scan type</p>
          <div className="grid grid-cols-2 gap-4">
            {mockDashboardData.scanTypes.map((scanType, index) => (
              <div key={index} className="flex items-center">
                <div className={`p-3 rounded-full bg-${scanType.color}-100 mr-3`}>
                  <scanType.icon className={`h-6 w-6 text-${scanType.color}-500`} />
                </div>
                <div>
                  <p className="text-lg font-semibold">{scanType.type}</p>
                  <p className="text-sm text-gray-600">{scanType.count}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Equipment Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Equipment Status</h2>
          <p className="text-sm text-gray-500 mb-4">Current status of radiology equipment</p>
          <ul>
            {mockDashboardData.equipmentStatus.map((equipment, index) => (
              <li key={index} className="flex items-center mb-2">
                <span className={`h-2 w-2 rounded-full bg-${equipment.color}-500 mr-2`}></span>
                <p className="text-gray-700">{equipment.name} - <span className={`font-semibold text-${equipment.color}-700`}>{equipment.status}</span></p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Radiology Requests Table */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Radiology Requests</h2>
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Search requests..."
              className="px-4 py-2 border rounded-l-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="px-4 py-2 bg-blue-600 text-white rounded-r-lg flex items-center">
              <PlusIcon className="h-5 w-5 mr-1" />
              Schedule Scan
            </button>
          </div>
        </div>

        {/* Tabs for requests */}
        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-8">
            <button
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'pendingInProgress' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('pendingInProgress')}
            >
              Pending & In Progress
            </button>
            <button
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'scheduled' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('scheduled')}
            >
              Scheduled Scans
            </button>
            <button
              className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'recentlyCompleted' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              onClick={() => setActiveTab('recentlyCompleted')}
            >
              Recently Completed
            </button>
          </nav>
        </div>

        {/* Radiology Requests Table Content */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scan Type</th>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.scanType}</td>
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
                      <button className="text-blue-600 hover:text-blue-900">
                        {request.actions}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RadiologistDashboard; 