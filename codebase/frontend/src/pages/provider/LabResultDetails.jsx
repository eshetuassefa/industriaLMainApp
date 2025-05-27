import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

function LabResultDetails() {
  const { resultId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [resultDetails, setResultDetails] = useState(null);

  // Extract patientId from query parameters
  const queryParams = new URLSearchParams(location.search);
  const patientId = queryParams.get('patientId');

  useEffect(() => {
    // TODO: Fetch lab result details based on resultId
    // TODO: Fetch patient personal information based on patientId
    // For now, using placeholder data combining both
    setResultDetails({
      id: resultId,
      patientId: patientId, // Include patientId in details
      patientName: 'John Doe', // Placeholder
      testName: 'Blood Count', // Placeholder
      date: '2023-10-26', // Placeholder
      // Placeholder patient personal information
      patientInfo: {
        age: 45,
        gender: 'Male',
        contact: 'johndoe@example.com',
        // Add other relevant patient details
      },
      // Add more detailed result information here
      details: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi.',
      labResultsTable: [
        { testName: 'TSH', result: '1.35', unit: 'ulU/ml', flag: 'Normal', referenceRange: '0.3-4.5', remark: '' },
        { testName: 'FT4', result: '5.86', unit: 'ng/dl', flag: 'Low', referenceRange: '0.9-1.75', remark: '' },
        { testName: 'FT3', result: '1.54', unit: 'Pg/dl', flag: 'Critical', referenceRange: '2-4.2', remark: '' },
        { testName: 'Folate', result: '21.9', unit: 'ng/ml', flag: 'High', referenceRange: '5.21-24.0', remark: '' },
        { testName: 'iCa', result: '0.24', unit: 'mmol/l', flag: 'Normal', referenceRange: '1.1-1.35', remark: '' },
        { testName: 'TCa', result: '0.50', unit: 'mmol/l', flag: 'Normal', referenceRange: '2.2-2.7', remark: '' },
        { testName: 'Rheumatoid factor', result: 'Non-reactive', unit: '', flag: '', referenceRange: '', remark: '' },
      ],
      reportedBy: 'Habtamu Alemu', // Placeholder for who reported the result
    });
  }, [resultId, patientId]); // Add patientId to dependency array

  const handleViewMedicalRecord = () => {
    if (patientId) {
      navigate(`/provider/medical-record/${patientId}`);
    } else {
      // Handle case where patientId is not available (should not happen with current navigation)
      console.error('Patient ID not found for this lab result.');
    }
  };

  if (!resultDetails) {
    return <div>Loading lab result details...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Lab Result Details</h1>

      {/* Patient Personal Information */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Patient Information</h2>
        <div className="bg-white p-4 rounded-md shadow">
          <p><strong>Name:</strong> {resultDetails.patientName}</p>
          {resultDetails.patientInfo && (
            <>
              <p><strong>Age:</strong> {resultDetails.patientInfo.age}</p>
              <p><strong>Gender:</strong> {resultDetails.patientInfo.gender}</p>
              <p><strong>Contact:</strong> {resultDetails.patientInfo.contact}</p>
              {/* TODO: Display other patient details */}
            </>
          )}
          {/* TODO: Fetch and display actual patient information */}
        </div>
      </section>

      {/* Lab Result Information */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Lab Result Information</h2>
         <div className="bg-white p-4 rounded-md shadow">
          <h3 className="text-lg font-semibold mb-2">{resultDetails.testName}</h3>
          <p className="text-gray-600 mb-2">Date: {resultDetails.date}</p>
          {resultDetails.reportedBy && (
            <p className="text-gray-600 mb-2">Reported by: {resultDetails.reportedBy}</p>
          )}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Details:</h3>
            
            {/* TODO: Display more detailed lab result information here */}
            {resultDetails.labResultsTable && (            
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 mt-4 border border-gray-400">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Flag</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference Range</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remark</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-400">
                    {resultDetails.labResultsTable.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.testName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.result}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.unit}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.flag}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.referenceRange}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.remark}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <button
            onClick={handleViewMedicalRecord}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            View Patient Medical Record
          </button>
        </div>
      </section>

    </div>
  );
}

export default LabResultDetails; 