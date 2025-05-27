import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LabResults() {
  const navigate = useNavigate();

  // Placeholder data structures for demonstration
  const arrivedResults = [
    { id: 1, patientName: 'John Doe', testName: 'Blood Count', date: '2023-10-26', patientId: 'pat-001' },
    { id: 2, patientName: 'Jane Smith', testName: 'Cholesterol', date: '2023-10-25', patientId: 'pat-002' },
  ];

  const pendingResults = [
    { id: 3, patientName: 'Peter Jones', testName: 'Urinalysis', date: '2023-10-26', patientId: 'pat-003' },
  ];

  const completedResultsHistory = [
    { id: 4, patientName: 'Mary Brown', testName: 'X-ray', date: '2023-10-20', patientId: 'pat-004' },
    { id: 5, patientName: 'David Green', testName: 'MRI', date: '2023-10-18', patientId: 'pat-005' },
  ];

  const handleResultClick = (resultId, patientId) => {
    // Navigate to the lab result details page
    navigate(`/provider/lab-results/${resultId}?patientId=${patientId}`);
  };

  // TODO: Implement search functionality to filter results

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Lab Results</h1>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search for patient or lab result..."
          className="w-full p-2 border border-gray-300 rounded-md"
          // TODO: Add onChange handler for search filtering
        />
      </div>

      {/* Arrived Lab Results */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Arrived Results</h2>
        <div className="bg-white p-4 rounded-md shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {arrivedResults.map(result => (
                <tr key={result.id} onClick={() => handleResultClick(result.id, result.patientId)} className="cursor-pointer hover:bg-gray-100">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{result.patientName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.testName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* TODO: Fetch and display actual arrived lab results */}
        </div>
      </section>

      {/* Pending Lab Results */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Pending Results</h2>
        <div className="bg-white p-4 rounded-md shadow overflow-x-auto">
           <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingResults.map(result => (
                <tr key={result.id} className="cursor-pointer hover:bg-gray-100">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{result.patientName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.testName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* TODO: Fetch and display actual pending lab results */}
        </div>
      </section>

      {/* Previously Completed Lab Results */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Completed Results History</h2>
        <div className="bg-white p-4 rounded-md shadow overflow-x-auto">
           <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {completedResultsHistory.map(result => (
                <tr key={result.id} onClick={() => handleResultClick(result.id, result.patientId)} className="cursor-pointer hover:bg-gray-100">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{result.patientName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.testName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* TODO: Fetch and display actual completed lab results */}
        </div>
      </section>

    </div>
  );
}

export default LabResults; 