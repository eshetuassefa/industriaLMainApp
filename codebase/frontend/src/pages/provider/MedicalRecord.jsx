import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ClockIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { getForwardedPatient, addMedicalRecord } from '../../services/provider.service';

const labTests = [
  { id: "cbc", name: "Complete Blood Count (CBC)" },
  { id: "urine", name: "Urinalysis" },
  { id: "lipid", name: "Lipid Panel" },
  { id: "metabolic", name: "Comprehensive Metabolic Panel" },
  { id: "thyroid", name: "Thyroid Function Tests" },
  { id: "hiv", name: "HIV Test" },
  { id: "hepatitis", name: "Hepatitis Panel" },
];

const radiologyTests = [
  { id: "xray", name: "X-Ray" },
  { id: "mri", name: "MRI" },
  { id: "ct", name: "CT Scan" },
  { id: "ultrasound", name: "Ultrasound" },
  { id: "mammogram", name: "Mammogram" },
];

const medications = [
  { id: "amoxicillin", name: "Amoxicillin" },
  { id: "paracetamol", name: "Paracetamol" },
  { id: "ibuprofen", name: "Ibuprofen" },
  { id: "omeprazole", name: "Omeprazole" },
  { id: "metformin", name: "Metformin" },
  { id: "atorvastatin", name: "Atorvastatin" },
  { id: "lisinopril", name: "Lisinopril" },
  { id: "metoprolol", name: "Metoprolol" },
];

const MedicalRecord = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [patientData, setPatientData] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [formData, setFormData] = useState({
    chiefComplaint: "",
    historyOfPresentIllness: "",
    vitalSigns: {
      bloodPressure: "",
      heartRate: "",
      respiratoryRate: "",
      temperature: "",
    },
    physicalExamination: "",
    diagnosis: {
      conditions: "",
      status: "provisional",
    },
    labTests: [],
    labTestsUrgency: "normal",
    radiologyRequests: [],
    radiologyReason: "",
    prescriptions: [],
    adviceAndFollowUp: "",
    recordStatus: "draft",
  });

  useEffect(() => {
    fetchForwardedPatient();
  }, [patientId]);

  const fetchForwardedPatient = async () => {
    try {
      setLoading(true);
      const doctorId = localStorage.getItem('doctorId');
      const response = await getForwardedPatient(patientId, doctorId);
      setPatientData(response.data);
      // You might want to fetch medical history here as well
    } catch (err) {
      setError(err.message || 'Failed to fetch patient data');
    } finally {
      setLoading(false);
    }
  };

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [expandedRadiologyReportId, setExpandedRadiologyReportId] =
    useState(null);
  const [showFullImage, setShowFullImage] = useState(false); // State for full image viewer
  const [selectedResultForImage, setSelectedResultForImage] = useState(null); // State for image data

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVitalSignsChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      vitalSigns: {
        ...prev.vitalSigns,
        [name]: value,
      },
    }));
  };

  const handleLabTestChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      labTests: checked
        ? [...prev.labTests, value]
        : prev.labTests.filter((test) => test !== value),
    }));
  };

  const handleLabTestsUrgencyChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      labTestsUrgency: e.target.value,
    }));
  };

  const handleRadiologyChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      radiologyRequests: checked
        ? [...prev.radiologyRequests, value]
        : prev.radiologyRequests.filter((test) => test !== value),
    }));
  };

  const handleRadiologyReasonChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      radiologyReason: e.target.value,
    }));
  };

  const handlePrescriptionAdd = () => {
    setFormData((prev) => ({
      ...prev,
      prescriptions: [
        ...prev.prescriptions,
        { medication: "", dosage: "", frequency: "", duration: "" },
      ],
    }));
  };

  const handlePrescriptionChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      prescriptions: prev.prescriptions.map((prescription, i) =>
        i === index ? { ...prescription, [field]: value } : prescription
      ),
    }));
  };

  const handlePrescriptionRemove = (index) => {
    setFormData((prev) => ({
      ...prev,
      prescriptions: prev.prescriptions.filter((_, i) => i !== index),
    }));
  };

  const handleViewHistory = () => {
    setShowHistory(!showHistory);
  };

  const handleOrderSelectedLabTests = () => {
    // TODO: Implement lab order API call for all selected tests
    const selectedTests = formData.labTests.map((test) => ({
      testId: test,
      urgency: formData.labTestsUrgency,
    }));
    console.log("Ordering lab tests:", selectedTests);
    // Show success message or handle response
  };

  const handleOrderPrescription = (prescription) => {
    // TODO: Implement prescription order API call
    console.log("Ordering prescription:", prescription);
    // Show success message or handle response
  };

  const handleOrderRadiology = () => {
    // TODO: Implement radiology order API call
    const selectedTests = formData.radiologyRequests.map((test) => ({
      testId: test,
      reason: formData.radiologyReason,
    }));
    console.log("Ordering radiology tests:", selectedTests);
    // Show success message or handle response
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Format the data according to the API specification
      const recordData = {
        patientId: patientId,
        visitDate: new Date().toISOString(),
        diagnosis: formData.diagnosis.conditions,
        chiefComplaint: formData.chiefComplaint,
        bloodPressure: formData.vitalSigns.bloodPressure,
        heartRate: parseInt(formData.vitalSigns.heartRate) || 0,
        temperature: parseFloat(formData.vitalSigns.temperature) || 0,
        physicalExamination: formData.physicalExamination,
        notes: formData.adviceAndFollowUp,
        labResults: formData.labTests.map(test => ({
          testName: test,
          testDate: new Date().toISOString(),
          resultValue: '', // These will be filled by lab
          unit: '',
          referenceRange: ''
        })),
        prescriptions: formData.prescriptions.map(prescription => ({
          drug: prescription.medication,
          dosage: prescription.dosage,
          frequency: prescription.frequency,
          duration: prescription.duration,
          instructions: '' // Optional field
        })),
        radiologyReports: formData.radiologyRequests.map(test => ({
          imagingType: test,
          reportText: formData.radiologyReason,
          bodyPart: '', // To be filled by radiology
          reportDate: new Date().toISOString()
        }))
      };

      const response = await addMedicalRecord(recordData);
      
      // Show success message
      alert('Medical record saved successfully!');
      
      // Reset form or navigate away
      setFormData({
        chiefComplaint: '',
        historyOfPresentIllness: '',
        vitalSigns: {
          bloodPressure: '',
          heartRate: '',
          respiratoryRate: '',
          temperature: '',
        },
        physicalExamination: '',
        diagnosis: {
          conditions: '',
          status: 'provisional',
        },
        labTests: [],
        labTestsUrgency: 'normal',
        radiologyRequests: [],
        radiologyReason: '',
        prescriptions: [],
        adviceAndFollowUp: '',
        recordStatus: 'draft',
      });
      
    } catch (error) {
      console.error('Error saving medical record:', error);
      alert(error.message || 'Failed to save medical record. Please try again.');
    }
  };

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setShowDetailedView(true);
    setShowHistory(false);
    setExpandedRadiologyReportId(null);
    setShowFullImage(false); // Reset image viewer state
    setSelectedResultForImage(null); // Reset image data state
  };

  const handleBackToCurrent = () => {
    setShowDetailedView(false);
    setSelectedRecord(null);
    setExpandedRadiologyReportId(null);
    setShowFullImage(false); // Reset image viewer state
    setSelectedResultForImage(null); // Reset image data state
  };

  const handleViewOlderRecord = (currentRecordId) => {
    const currentIndex = medicalHistory.findIndex(
      (record) => record.id === currentRecordId
    );
    if (currentIndex < medicalHistory.length - 1) {
      setSelectedRecord(medicalHistory[currentIndex + 1]);
      setExpandedRadiologyReportId(null);
      setShowFullImage(false); // Reset image viewer state
      setSelectedResultForImage(null); // Reset image data state
    }
  };

  const handleViewNewerRecord = (currentRecordId) => {
    const currentIndex = medicalHistory.findIndex(
      (record) => record.id === currentRecordId
    );
    if (currentIndex > 0) {
      setSelectedRecord(medicalHistory[currentIndex - 1]);
      setExpandedRadiologyReportId(null);
      setShowFullImage(false); // Reset image viewer state
      setSelectedResultForImage(null); // Reset image data state
    }
  };

  // Toggle full radiology report visibility
  const toggleRadiologyReport = (reportId) => {
    setExpandedRadiologyReportId((prevId) =>
      prevId === reportId ? null : reportId
    );
  };

  // Handle opening full image viewer
  const handleViewFullImage = (imageUrl) => {
    setSelectedResultForImage({ imageUrl }); // Pass image URL to state
    setShowFullImage(true);
  };

  // Handle closing full image viewer
  const handleCloseFullImage = () => {
    setShowFullImage(false);
    setSelectedResultForImage(null); // Clear image data state
  };

  // ImageViewer Component (copied from RadiologyResults.jsx)
  const ImageViewer = ({ imageUrl, onClose }) => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
        <div className="relative max-w-7xl max-h-[90vh]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patient data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Medical Record Entry</h1>
          <button
            onClick={handleViewHistory}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ClockIcon className="w-5 h-5 mr-2" />
            View Previous Medical History
          </button>
        </div>

        {/* Patient Information Card */}
        {patientInfo && (
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Patient Information</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{patientInfo.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Age/Gender</p>
              <p className="font-medium">
                {patientInfo.age} / {patientInfo.gender}
              </p>
            </div>
              
            <div>
              <p className="text-sm text-gray-500">Blood Type</p>
              <p className="font-medium">{patientInfo.bloodType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Last Visit</p>
              <p className="font-medium">{patientInfo.lastVisit}</p>
            </div>
          </div>
        </div>
        )}

        {/* Medical History Modal */}
        {showHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] overflow-y-auto p-8 relative">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Medical History</h2>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                {medicalHistory.map((record) => (
                  <div
                    key={record.id}
                    onClick={() => handleViewRecord(record)}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{record.date}</p>
                        <p className="text-gray-600">
                          Chief Complaint: {record.chiefComplaint}
                        </p>
                        <p className="text-gray-600">
                          Diagnosis: {record.diagnosis}
                        </p>
                        <p className="text-gray-500 text-sm mt-1">
                          Recorded by: {record.recordedBy.name} -{" "}
                          {record.recordedBy.hospital}
                        </p>
                      </div>
                      <span className="px-2 py-1 text-sm rounded-full bg-green-100 text-green-800">
                        {record.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Detailed Record View */}
        {showDetailedView && selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] overflow-y-auto p-8 relative">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  Medical Record Details
                </h2>
                <button
                  onClick={handleBackToCurrent}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Patient Information (from Medical Record) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Date</p>
                    <p className="font-medium">{selectedRecord.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Recorded By</p>
                    <p className="font-medium">
                      {selectedRecord.recordedBy.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedRecord.recordedBy.hospital}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Chief Complaint</h3>
                  <p>{selectedRecord.chiefComplaint}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">
                    History of Present Illness
                  </h3>
                  <p>{selectedRecord.historyOfPresentIllness}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Vital Signs</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Blood Pressure</p>
                      <p>{selectedRecord.vitalSigns.bloodPressure}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Heart Rate</p>
                      <p>{selectedRecord.vitalSigns.heartRate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Respiratory Rate</p>
                      <p>{selectedRecord.vitalSigns.respiratoryRate}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Temperature</p>
                      <p>{selectedRecord.vitalSigns.temperature}°C</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Physical Examination</h3>
                  <p>{selectedRecord.physicalExamination}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Diagnosis</h3>
                  <p>{selectedRecord.diagnosis}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Medications</h3>
                  <div className="space-y-2">
                    {selectedRecord.medications.map((med, index) => (
                      <div key={index} className="border rounded p-2">
                        <p className="font-medium">{med.name}</p>
                        <p className="text-sm text-gray-600">
                          {med.dosage} - {med.frequency} for {med.duration}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Ordered Lab Tests</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecord.labTests.map((test, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {test}
                      </span>
                    ))}
                    {/* Lab Results for this record */}
                    {selectedRecord.labResults &&
                      selectedRecord.labResults.length > 0 && (
                        <div className="mt-6">
                          <h4 className="text-lg font-semibold mb-2">
                            Lab Results
                          </h4>
                          {selectedRecord.labReportedBy && (
                            <p className="text-sm text-gray-600 mb-2">
                              Reported by: {selectedRecord.labReportedBy}
                            </p>
                          )}
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-400 mt-4 border border-gray-400">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Test Name
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Result
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Unit
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Flag
                                  </th>
                                  <th className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    Reference Range
                                  </th>
                                  <th className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    Remark
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-400">
                                {selectedRecord.labResults.map(
                                  (item, index) => (
                                    <tr key={index}>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {item.testName}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {item.result}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.unit}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.flag}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.referenceRange}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.remark}
                                      </td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                {/* Radiology Tests */}
                <div>
                  <h3 className="font-semibold mb-2">Radiology Tests</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRecord.radiologyTests.map((test, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                      >
                        {test}
                      </span>
                    ))}
                  </div>

                  {/* Radiology Results for this record */}
                  {selectedRecord.radiologyResultDetails &&
                    selectedRecord.radiologyResultDetails.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-lg font-semibold mb-2">
                          Radiology Results
                        </h4>
                        <div className="space-y-4">
                          {selectedRecord.radiologyResultDetails.map((item) => (
                            <div
                              key={item.id}
                              className="border rounded-lg p-3"
                            >
                              {/* Summary View */}
                              <div className="flex justify-between items-center">
                                <p className="font-medium">
                                  {item.imagingModality} - {item.examDate}
                                </p>
                                <button
                                  onClick={() => toggleRadiologyReport(item.id)}
                                  className="text-sm text-blue-600 hover:underline focus:outline-none"
                                >
                                  {expandedRadiologyReportId === item.id
                                    ? "Hide Full Report"
                                    : "Show Full Report"}
                                </button>
                              </div>
                              <p className="text-gray-700 text-sm mt-1">
                                Impression: {item.impression}
                              </p>

                              {/* Full Report Details (Conditionally Rendered) */}
                              {expandedRadiologyReportId === item.id &&
                                item.report && (
                                  <div className="mt-4 space-y-4 border-t pt-4">
                                    {/* Patient Information (within Radiology Result context) */}
                                    {item.patientInfo && (
                                      <div>
                                        <h5 className="font-semibold mb-1">
                                          Patient Info (for this scan)
                                        </h5>
                                        <p className="text-sm text-gray-700">
                                          Name: {item.patientInfo.name}, ID:{" "}
                                          {item.patientInfo.patientId}
                                        </p>
                                      </div>
                                    )}

                                    {/* Exam Details */}
                                    <div>
                                      <h5 className="font-semibold mb-1">
                                        Exam Details
                                      </h5>
                                      <p className="text-sm text-gray-700">
                                        Date & Time: {item.examDate} at{" "}
                                        {item.examTime}
                                      </p>
                                      <p className="text-sm text-gray-700">
                                        Modality: {item.imagingModality}
                                      </p>
                                      {item.reportingRadiologist && (
                                        <p className="text-sm text-gray-700">
                                          Radiologist:{" "}
                                          {item.reportingRadiologist}
                                        </p>
                                      )}
                                      {item.dicomImageId && (
                                        <p className="text-sm text-gray-700">
                                          DICOM ID: {item.dicomImageId}
                                        </p>
                                      )}
                                    </div>

                                    {/* Image Section */}
                                    {item.imageUrl && (
                                      <div className="border-t pt-4 mt-4">
                                        <h5 className="font-semibold mb-2">
                                          Radiology Image
                                        </h5>
                                        <div className="relative aspect-square max-w-xs mx-auto bg-gray-100 rounded-lg overflow-hidden">
                                          <img
                                            src={item.imageUrl}
                                            alt={`${item.imagingModality} Image`}
                                            className="w-full h-full object-contain cursor-pointer"
                                            onClick={() =>
                                              handleViewFullImage(item.imageUrl)
                                            }
                                          />
                                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                                            <button
                                              onClick={() =>
                                                handleViewFullImage(
                                                  item.imageUrl
                                                )
                                              }
                                              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100"
                                            >
                                              <PhotoIcon className="w-5 h-5" />
                                              View Full Image
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {/* Report Narrative */}
                                    <div>
                                      <h5 className="font-semibold mb-1">
                                        Narrative
                                      </h5>
                                      <p className="text-gray-700 whitespace-pre-line">
                                        {item.report.narrative}
                                      </p>
                                    </div>

                                    {/* Report Impression (already shown in summary, but include for completeness in full view) */}
                                    <div>
                                      <h5 className="font-semibold mb-1">
                                        Impression
                                      </h5>
                                      <p className="text-gray-700">
                                        {item.report.impression}
                                      </p>
                                    </div>

                                    {item.report.measurements &&
                                      item.report.measurements.length > 0 && (
                                        <div>
                                          <h5 className="font-semibold mb-1">
                                            Measurements
                                          </h5>
                                          <ul className="list-disc list-inside space-y-1 text-gray-700">
                                            {item.report.measurements.map(
                                              (measurement, idx) => (
                                                <li key={idx}>
                                                  {measurement.label}:{" "}
                                                  {measurement.value}
                                                </li>
                                              )
                                            )}
                                          </ul>
                                        </div>
                                      )}

                                    {item.report.annotations &&
                                      item.report.annotations.length > 0 && (
                                        <div>
                                          <h5 className="font-semibold mb-1">
                                            Annotations
                                          </h5>
                                          <ul className="list-disc list-inside space-y-1 text-gray-700">
                                            {item.report.annotations.map(
                                              (annotation, idx) => (
                                                <li key={idx}>{annotation}</li>
                                              )
                                            )}
                                          </ul>
                                        </div>
                                      )}
                                  </div>
                                )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Advice and Follow-up</h3>
                  <p>{selectedRecord.adviceAndFollowUp}</p>
                </div>

                <div className="flex justify-between pt-4 border-t">
                  <button
                    onClick={() => handleViewOlderRecord(selectedRecord.id)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    disabled={
                      medicalHistory.findIndex(
                        (r) => r.id === selectedRecord.id
                      ) ===
                      medicalHistory.length - 1
                    }
                  >
                    View Older Record
                  </button>
                  <button
                    onClick={() => handleViewNewerRecord(selectedRecord.id)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    disabled={
                      medicalHistory.findIndex(
                        (r) => r.id === selectedRecord.id
                      ) === 0
                    }
                  >
                    View Newer Record
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Chief Complaint */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Chief Complaint</h2>
            <textarea
              name="chiefComplaint"
              value={formData.chiefComplaint}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              placeholder="Enter patient's chief complaint in their own words..."
              required
            />
          </div>

          {/* History of Present Illness */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              History of Present Illness
            </h2>
            <textarea
              name="historyOfPresentIllness"
              value={formData.historyOfPresentIllness}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="4"
              placeholder="Enter detailed background about the current problem (Onset, duration, location, severity, pattern, etc.)..."
              required
            />
          </div>

          {/* Vital Signs and Physical Examination */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              Vital Signs & Physical Examination
            </h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Blood Pressure
                </label>
                <input
                  type="text"
                  name="bloodPressure"
                  value={formData.vitalSigns.bloodPressure}
                  onChange={handleVitalSignsChange}
                  className="mt-1 block w-full p-2 border rounded-md"
                  placeholder="e.g., 120/80"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Heart Rate
                </label>
                <input
                  type="text"
                  name="heartRate"
                  value={formData.vitalSigns.heartRate}
                  onChange={handleVitalSignsChange}
                  className="mt-1 block w-full p-2 border rounded-md"
                  placeholder="bpm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Respiratory Rate
                </label>
                <input
                  type="text"
                  name="respiratoryRate"
                  value={formData.vitalSigns.respiratoryRate}
                  onChange={handleVitalSignsChange}
                  className="mt-1 block w-full p-2 border rounded-md"
                  placeholder="breaths/min"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Temperature
                </label>
                <input
                  type="text"
                  name="temperature"
                  value={formData.vitalSigns.temperature}
                  onChange={handleVitalSignsChange}
                  className="mt-1 block w-full p-2 border rounded-md"
                  placeholder="°C"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                Physical Examination
              </label>
              <textarea
                name="physicalExamination"
                value={formData.physicalExamination}
                onChange={handleInputChange}
                className="mt-1 block w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows="4"
                placeholder="Enter physical examination findings..."
                required
              />
            </div>
          </div>

          {/* Diagnosis */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Diagnosis</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Conditions
                </label>
                <textarea
                  name="conditions"
                  value={formData.diagnosis.conditions}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Enter diagnosis (ICD-10 code optional)..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.diagnosis.status}
                  onChange={handleInputChange}
                  className="mt-1 block w-full p-2 border rounded-md"
                >
                  <option value="provisional">Provisional</option>
                  <option value="confirmed">Confirmed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lab Tests with Single Order Button and Urgency */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Lab Tests</h2>
            <div className="space-y-2 mb-4">
              {labTests.map((test) => (
                <div key={test.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={test.id}
                    value={test.id}
                    onChange={handleLabTestChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={test.id}
                    className="ml-2 block text-sm text-gray-900"
                  >
                    {test.name}
                  </label>
                </div>
              ))}
            </div>
            {formData.labTests.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">
                      Urgency Level:
                    </label>
                    <select
                      value={formData.labTestsUrgency}
                      onChange={handleLabTestsUrgencyChange}
                      className="p-2 border rounded-md"
                    >
                      <option value="normal">Normal</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={handleOrderSelectedLabTests}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Order Selected Tests
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Radiology Requests with Order Button */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Radiology Requests</h2>
            <div className="space-y-2 mb-4">
              {radiologyTests.map((test) => (
                <div key={test.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={test.id}
                    value={test.id}
                    onChange={handleRadiologyChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={test.id}
                    className="ml-2 block text-sm text-gray-900"
                  >
                    {test.name}
                  </label>
                </div>
              ))}
            </div>
            {formData.radiologyRequests.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Clinical Justification
                    </label>
                    <textarea
                      value={formData.radiologyReason}
                      onChange={handleRadiologyReasonChange}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      placeholder="Enter reason for radiology request..."
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleOrderRadiology}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Order Imaging
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Prescriptions with Order Button */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Prescriptions</h2>
              <button
                type="button"
                onClick={handlePrescriptionAdd}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Medication
              </button>
            </div>
            <div className="space-y-4">
              {formData.prescriptions.map((prescription, index) => {
                const isComplete =
                  prescription.medication &&
                  prescription.dosage &&
                  prescription.frequency &&
                  prescription.duration;

                return (
                  <div key={index} className="border p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-medium">Medication {index + 1}</h3>
                      <div className="flex items-center gap-2">
                        {isComplete && (
                          <button
                            type="button"
                            onClick={() =>
                              handleOrderPrescription(prescription)
                            }
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                          >
                            Order Prescription
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handlePrescriptionRemove(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Medication
                        </label>
                        <select
                          value={prescription.medication}
                          onChange={(e) =>
                            handlePrescriptionChange(
                              index,
                              "medication",
                              e.target.value
                            )
                          }
                          className="mt-1 block w-full p-2 border rounded-md"
                          required
                        >
                          <option value="">Select medication</option>
                          {medications.map((med) => (
                            <option key={med.id} value={med.id}>
                              {med.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Dosage
                        </label>
                        <input
                          type="text"
                          value={prescription.dosage}
                          onChange={(e) =>
                            handlePrescriptionChange(
                              index,
                              "dosage",
                              e.target.value
                            )
                          }
                          className="mt-1 block w-full p-2 border rounded-md"
                          placeholder="e.g., 500mg"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Frequency
                        </label>
                        <input
                          type="text"
                          value={prescription.frequency}
                          onChange={(e) =>
                            handlePrescriptionChange(
                              index,
                              "frequency",
                              e.target.value
                            )
                          }
                          className="mt-1 block w-full p-2 border rounded-md"
                          placeholder="e.g., Twice daily"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Duration
                        </label>
                        <input
                          type="text"
                          value={prescription.duration}
                          onChange={(e) =>
                            handlePrescriptionChange(
                              index,
                              "duration",
                              e.target.value
                            )
                          }
                          className="mt-1 block w-full p-2 border rounded-md"
                          placeholder="e.g., 7 days"
                          required
                        />
                      </div>
                    </div>
                    {!isComplete && (
                      <p className="mt-2 text-sm text-gray-500">
                        Please fill out all fields to order this prescription
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Advice & Follow-Up */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Advice & Follow-Up</h2>
            <textarea
              name="adviceAndFollowUp"
              value={formData.adviceAndFollowUp}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="4"
              placeholder="Enter doctor's advice (rest, diet, monitoring) and follow-up instructions..."
              required
            />
          </div>

          {/* Save Options */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Save Record</h2>
            <div className="flex gap-4">
              <button
                type="submit"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    recordStatus: "completed",
                  }))
                }
                className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Save as Completed
              </button>
              <button
                type="submit"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, recordStatus: "draft" }))
                }
                className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Save as Draft
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Full Image Viewer */}
      {showFullImage && selectedResultForImage && (
        <ImageViewer
          imageUrl={selectedResultForImage.imageUrl}
          onClose={handleCloseFullImage}
        />
      )}
    </div>
  );
};

export default MedicalRecord;
