import React from 'react';
import { useNavigate } from 'react-router-dom';

// Mock data - replace with API call later and filter by status
const mockCompletedPatients = [
  {
    id: 'TR004',
    patient: 'Hiwot Tesfaye',
    test: 'Lipid Profile',
    requestedBy: 'Dr. Yohannes Alemu',
    urgency: 'Routine',
  },
];

const CompletedPatientsList = () => {
  const navigate = useNavigate();

  const handlePatientClick = (testId) => {
    // For completed tests, maybe navigate to a details view instead of a form?
    // Assuming for now it goes to the form page for consistency, but this might need adjustment.
    navigate(`/lab/results/${testId}`);
  };

  return (
    <>
      {/* Main Content */}
      <h1 className="text-3xl font-bold mb-8">Patients with Completed Tests Today</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested By</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockCompletedPatients.map((patient) => (
              <tr
                key={patient.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handlePatientClick(patient.id)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{patient.patient}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.test}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.requestedBy}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    patient.urgency === 'Urgent' ? 'bg-yellow-100 text-yellow-800' :
                    patient.urgency === 'Emergency' ? 'bg-red-100 text-red-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {patient.urgency}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default CompletedPatientsList; 