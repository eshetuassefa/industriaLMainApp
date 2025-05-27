import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { DocumentTextIcon, ClockIcon, CheckCircleIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

// Mock data for demonstration
const mockRadiologyResults = {
  arrived: [
    {
      id: 'RAD001',
      patientInfo: {
        name: 'Abebe Kebede',
        age: 45,
        gender: 'Male',
        patientId: 'P12345',
      },
      examDate: '2024-03-15',
      examTime: '14:30',
      reportingRadiologist: 'Dr. Yohannes Teklu',
      imagingModality: 'CT Scan',
      dicomImageId: 'DICOM_CT_20240315_1430_001',
      imageUrl: 'https://example.com/dicom/CT_20240315_1430_001.jpg', // Mock image URL
      report: {
        narrative: 'CT scan of the chest demonstrates a 3.5 cm mass in the right lower lobe with irregular margins. There is associated ground glass opacity in the surrounding parenchyma. No mediastinal or hilar lymphadenopathy is identified. The heart size is normal. No pleural effusion is present.',
        impression: 'Right lower lobe mass, suspicious for primary lung neoplasm. Recommend follow-up CT in 3 months.',
        measurements: [
          { label: 'Mass Size', value: '3.5 cm' },
          { label: 'Location', value: 'Right lower lobe' },
          { label: 'Density', value: 'Soft tissue density' }
        ],
        annotations: [
          'Irregular margins',
          'Ground glass opacity',
          'No lymphadenopathy'
        ]
      },
      status: 'arrived',
      timestamp: '2024-03-15T15:30:00'
    }
  ],
  pending: [
    {
      id: 'RAD002',
      patientInfo: {
        name: 'Kebede Alemu',
        age: 32,
        gender: 'Male',
        patientId: 'P12346',
      },
      examDate: '2024-03-15',
      examTime: '15:00',
      imagingModality: 'MRI',
      status: 'pending',
      timestamp: '2024-03-15T15:00:00'
    }
  ],
  completed: [
    {
      id: 'RAD003',
      patientInfo: {
        name: 'Tigist Haile',
        age: 28,
        gender: 'Female',
        patientId: 'P12347',
      },
      examDate: '2024-03-14',
      examTime: '10:00',
      reportingRadiologist: 'Dr. Yohannes Teklu',
      imagingModality: 'X-Ray',
      dicomImageId: 'DICOM_XR_20240314_1000_001',
      imageUrl: 'https://example.com/dicom/XR_20240314_1000_001.jpg', // Mock image URL
      report: {
        narrative: 'PA and lateral chest radiographs demonstrate clear lung fields bilaterally. No active disease process is identified. The heart size is normal. No pleural effusion or pneumothorax is present.',
        impression: 'Normal chest radiograph.',
        measurements: [],
        annotations: ['Clear lung fields', 'Normal heart size']
      },
      status: 'completed',
      timestamp: '2024-03-14T11:00:00'
    }
  ]
};

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

const RadiologyResults = () => {
  const [selectedResult, setSelectedResult] = useState(null);
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const navigate = useNavigate();

  const handleViewResult = (result) => {
    setSelectedResult(result);
    setShowDetailedView(true);
  };

  const handleCloseDetailedView = () => {
    setShowDetailedView(false);
    setSelectedResult(null);
    setShowFullImage(false);
  };

  const ResultCard = ({ result }) => {
    const getStatusIcon = () => {
      switch (result.status) {
        case 'arrived':
          return <DocumentTextIcon className="h-6 w-6 text-blue-500" />;
        case 'pending':
          return <ClockIcon className="h-6 w-6 text-yellow-500" />;
        case 'completed':
          return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
        default:
          return null;
      }
    };

    const handleClick = () => {
      if (result.status !== 'pending') {
        handleViewResult(result);
      }
    };

    return (
      <div
        onClick={handleClick}
        className={`bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow ${result.status !== 'pending' ? 'cursor-pointer' : ''}`}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{result.patientInfo.name}</h3>
            <p className="text-gray-600">ID: {result.patientInfo.patientId}</p>
            <p className="text-gray-600">{result.imagingModality}</p>
            <p className="text-sm text-gray-500">
              {result.examDate} at {result.examTime}
            </p>
          </div>
          {getStatusIcon()}
        </div>
      </div>
    );
  };

  const ImageViewer = ({ imageUrl, onClose }) => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
        <div className="relative max-w-7xl max-h-[90vh]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={imageUrl}
            alt="Radiology Image"
            className="max-w-full max-h-[90vh] object-contain"
          />
        </div>
      </div>
    );
  };

  const DetailedResultView = ({ result, navigate, patientId }) => {
    if (!result) return null;

    const handleBackToMedicalRecord = () => {
      navigate(`/provider/medical-record/${patientId}`);
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] overflow-y-auto p-8 relative">
          <div className="flex justify-end items-center mb-4">
            <button
              onClick={handleBackToMedicalRecord}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-2"
            >
              Back to Medical Record
            </button>
            <button
              onClick={handleCloseDetailedView}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-6 mt-4">
            <div className="border-b pb-4">
              <h2 className="text-2xl font-bold mb-4">Patient Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{result.patientInfo.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Age/Gender</p>
                  <p className="font-medium">{result.patientInfo.age} / {result.patientInfo.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Patient ID</p>
                  <p className="font-medium">{result.patientInfo.patientId}</p>
                </div>
              </div>
            </div>

            <div className="border-b pb-4">
              <h2 className="text-xl font-semibold mb-4">Exam Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Exam Date & Time</p>
                  <p className="font-medium">{result.examDate} at {result.examTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Reporting Radiologist</p>
                  <p className="font-medium">{result.reportingRadiologist}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Imaging Modality</p>
                  <p className="font-medium">{result.imagingModality}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">DICOM Image ID</p>
                  <p className="font-medium">{result.dicomImageId}</p>
                </div>
              </div>
            </div>

            {result.imageUrl && (
              <div className="border-b pb-4">
                <h2 className="text-xl font-semibold mb-4">Radiology Image</h2>
                <div className="relative aspect-square max-w-2xl mx-auto bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={result.imageUrl}
                    alt={`${result.imagingModality} Image`}
                    className="w-full h-full object-contain cursor-pointer"
                    onClick={() => setShowFullImage(true)}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setShowFullImage(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100"
                    >
                      <PhotoIcon className="w-5 h-5" />
                      View Full Image
                    </button>
                  </div>
                </div>
              </div>
            )}

            {result.report && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2">Radiologist's Report</h2>
                  <p className="text-gray-700 whitespace-pre-line">{result.report.narrative}</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2">Impression</h2>
                  <p className="text-gray-700">{result.report.impression}</p>
                </div>

                {result.report.measurements && result.report.measurements.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Measurements</h2>
                    <div className="grid grid-cols-2 gap-4">
                      {result.report.measurements.map((measurement, index) => (
                        <div key={index}>
                          <p className="text-sm text-gray-500">{measurement.label}</p>
                          <p className="font-medium">{measurement.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.report.annotations && result.report.annotations.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Annotations</h2>
                    <ul className="list-disc list-inside space-y-1">
                      {result.report.annotations.map((annotation, index) => (
                        <li key={index} className="text-gray-700">{annotation}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Radiology Results</h1>

        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white text-blue-700 shadow font-bold'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white font-bold'
                )
              }
            >
              Arrived ({mockRadiologyResults.arrived.length})
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white text-blue-700 shadow font-bold'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white font-bold'
                )
              }
            >
              Pending ({mockRadiologyResults.pending.length})
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white text-blue-700 shadow font-bold'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white font-bold'
                )
              }
            >
              Completed ({mockRadiologyResults.completed.length})
            </Tab>
          </Tab.List>
          <Tab.Panels className="mt-6">
            <Tab.Panel>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockRadiologyResults.arrived.map((result) => (
                  <ResultCard key={result.id} result={result} />
                ))}
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockRadiologyResults.pending.map((result) => (
                  <ResultCard key={result.id} result={result} />
                ))}
              </div>
            </Tab.Panel>
            <Tab.Panel>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockRadiologyResults.completed.map((result) => (
                  <ResultCard key={result.id} result={result} />
                ))}
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>

        {showDetailedView && selectedResult && (
          <DetailedResultView
            result={selectedResult}
            navigate={navigate}
            patientId={selectedResult.patientInfo.patientId}
          />
        )}
        {showFullImage && selectedResult?.imageUrl && (
          <ImageViewer
            imageUrl={selectedResult.imageUrl}
            onClose={() => setShowFullImage(false)}
          />
        )}
      </div>
    </div>
  );
};

export default RadiologyResults; 