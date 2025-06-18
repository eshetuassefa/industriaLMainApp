import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, PencilSquareIcon, CalendarDaysIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { getAppointments, createAppointment, getForwardedPatient } from '../../services/provider.service';

const statusStyles = {
  SCHEDULED: 'bg-gray-100 text-gray-700',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const appointmentTypes = [
  { value: 'CONSULTATION', label: 'Initial Consultation' },
  { value: 'FOLLOW_UP', label: 'Follow-up' },
  { value: 'EMERGENCY', label: 'Emergency' },
  { value: 'ROUTINE_CHECK', label: 'Routine Check' }
];

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [forwardedPatients, setForwardedPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    patientId: '',
    date: '',
    time: '',
    type: '',
    duration: 30, // Default duration in minutes
    notes: '',
    status: 'SCHEDULED'
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const doctorId = localStorage.getItem('doctorId');
      
      if (!doctorId) {
        throw new Error('Doctor ID not found. Please log in again.');
      }

      // Fetch both appointments and patients
      const [appointmentsResponse, patientsResponse] = await Promise.all([
        getAppointments(),
        getForwardedPatient('ad3e1e84-fd19-45e7-bd09-37669094d642', doctorId)
      ]);

      setAppointments(appointmentsResponse.data || []);
      setForwardedPatients([patientsResponse.data]);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewAppointment = (appointmentId) => {
    navigate(`/provider/appointment/${appointmentId}`);
  };

  const handleCreateAppointment = () => {
    setShowModal(true);
  };

  const handleSubmitAppointment = async (e) => {
    e.preventDefault();
    try {
      const appointmentData = {
        ...newAppointment,
        date: new Date(`${newAppointment.date}T${newAppointment.time}`).toISOString(),
        duration: parseInt(newAppointment.duration, 10) // Ensure duration is a number
      };
      
      await createAppointment(appointmentData);
      setShowModal(false);
      setNewAppointment({
        patientId: '',
        date: '',
        time: '',
        type: '',
        duration: 30,
        notes: '',
        status: 'SCHEDULED'
      });
      fetchData(); // Refresh both appointments and patients
    } catch (err) {
      console.error('Error creating appointment:', err);
      setError(err.message || 'Failed to create appointment');
    }
  };

  const filteredAppointments = appointments.filter(appt => 
    appt.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    appt.type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading appointments...</p>
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
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-8">Upcoming Appointments</h1>
        
        {/* Recent Appointments Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Recent Appointments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {appointments
              .filter(appt => {
                const appointmentDate = new Date(appt.date);
                const today = new Date();
                const diffTime = Math.abs(today - appointmentDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= 7; // Show appointments from the last 7 days
              })
              .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by most recent first
              .slice(0, 6) // Show only 6 most recent appointments
              .map((appt) => (
                <div key={appt.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {appt.patient?.person ? 
                          `${appt.patient.person.firstName} ${appt.patient.person.middleName || ''} ${appt.patient.person.lastName}` :
                          'Unknown Patient'
                        }
                      </h3>
                      <p className="text-sm text-gray-500">{appt.type}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[appt.status]}`}>
                      {appt.status}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <CalendarDaysIcon className="w-4 h-4 mr-1" />
                    {new Date(appt.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="mt-3 flex justify-end">
                    <button 
                      onClick={() => handleViewAppointment(appt.id)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Search and Actions */}
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search appointments..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300 text-sm w-full"
            />
            <CalendarDaysIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 active:scale-95 transition font-medium">
            <CalendarDaysIcon className="w-5 h-5" /> View Calendar
          </button>
            <button 
              onClick={handleCreateAppointment}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 active:scale-95 transition font-medium"
            >
            <PlusIcon className="w-5 h-5" /> New Appointment
          </button>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-lg shadow p-6">
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
                {filteredAppointments.map((appt) => (
                  <tr key={appt.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold">
                      {appt.patient?.person ? 
                        `${appt.patient.person.firstName} ${appt.patient.person.middleName || ''} ${appt.patient.person.lastName}` :
                        'Unknown Patient'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(appt.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(appt.date).toLocaleTimeString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{appt.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyles[appt.status]}`}>
                        {appt.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                      <button 
                        onClick={() => handleViewAppointment(appt.id)}
                        className="text-gray-600 hover:text-indigo-700 active:scale-95 transition-transform" 
                        title="View"
                      >
                        <EyeIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* New Appointment Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl transform transition-all shadow-2xl relative">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Create New Appointment</h2>
                <p className="text-sm text-gray-500 mt-1">Schedule a new appointment for your patient</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitAppointment} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Patient Selection */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Patient</label>
                  <select
                    value={newAppointment.patientId}
                    onChange={(e) => setNewAppointment({...newAppointment, patientId: e.target.value})}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
                    required
                  >
                    <option value="">Choose a patient...</option>
                    {forwardedPatients.map((patient) => {
                      const patientInfo = patient.patient;
                      return (
                        <option key={patientInfo.id} value={patientInfo.id}>
                          {`${patientInfo.person.firstName} ${patientInfo.person.middleName || ''} ${patientInfo.person.lastName}`}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Date and Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={newAppointment.date}
                      onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
                      required
                    />
                    <CalendarDaysIcon className="w-5 h-5 text-gray-400 absolute right-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <div className="relative">
                    <input
                      type="time"
                      value={newAppointment.time}
                      onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
                      required
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400 absolute right-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>

                {/* Duration and Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (minutes)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={newAppointment.duration}
                      onChange={(e) => setNewAppointment({...newAppointment, duration: parseInt(e.target.value, 10)})}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
                      min="15"
                      step="15"
                      required
                    />
                    <span className="absolute right-3 top-2.5 text-gray-400 text-sm">min</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Type</label>
                  <select
                    value={newAppointment.type}
                    onChange={(e) => setNewAppointment({...newAppointment, type: e.target.value})}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
                    required
                  >
                    <option value="">Select type...</option>
                    {appointmentTypes.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={newAppointment.notes}
                    onChange={(e) => setNewAppointment({...newAppointment, notes: e.target.value})}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50"
                    rows="3"
                    placeholder="Add any additional notes or instructions..."
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Create Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments; 