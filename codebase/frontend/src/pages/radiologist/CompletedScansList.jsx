import React from 'react';
import { useNavigate } from 'react-router-dom';

// Mock data - replace with API call later
const mockCompletedScans = [
  {
    id: 'R003',
    patient: 'Hiwot Tesfaye',
    scanType: 'Lipid Profile', // Placeholder, should be a scan type
    requestedBy: 'Dr. Yohannes Alemu',
    urgency: 'Routine',
  },
  // Add more mock completed scan data as needed
];

const CompletedScansList = () => {
  const navigate = useNavigate();

  // For completed scans, maybe navigate to a details view instead of a result entry form?
  // Assuming for now it goes to a details page, we can change this later.
  const handleScanClick = (scanId) => {
    // Assuming a different route for completed scan details
    // navigate(`/radiologist/completed-scan-details/${scanId}`);
    // For now, just logging the click
    console.log('Clicked on completed scan:', scanId);
     navigate(`/radiologist/results/${scanId}`); // Navigate to the result entry page for now for consistency
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Completed Scans</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scan Type</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested By</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
              {/* No action needed for completed scans in this view */}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockCompletedScans.map((scan) => (
              <tr
                key={scan.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleScanClick(scan.id)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{scan.patient}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{scan.scanType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{scan.requestedBy}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    scan.urgency === 'Urgent' ? 'bg-yellow-100 text-yellow-800' :
                    scan.urgency === 'Emergency' ? 'bg-red-100 text-red-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {scan.urgency}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompletedScansList; 