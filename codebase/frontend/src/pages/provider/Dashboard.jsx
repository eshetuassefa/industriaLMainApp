import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDaysIcon,
  UserGroupIcon,
  BeakerIcon,
  HeartIcon,
  BellIcon,
  MagnifyingGlassIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { getDashboardStats } from '../../services/provider.service';

const MetricCard = ({ icon: Icon, title, value, sub, loading }) => (
  <div className="bg-white p-6 rounded-lg shadow flex items-center justify-between">
    <div>
      <p className="text-gray-500 text-sm">{title}</p>
      <h3 className="text-2xl font-bold mt-2">
        {loading ? (
          <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
        ) : (
          value
        )}
      </h3>
      <p className="text-sm text-gray-600 mt-1">
        {loading ? (
          <div className="animate-pulse bg-gray-200 h-4 w-24 rounded"></div>
        ) : (
          sub
        )}
      </p>
    </div>
    <Icon className="h-12 w-12 text-gray-400" />
  </div>
);

const DoctorDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await getDashboardStats();
      setDashboardData(response.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPatient = (patientId) => {
    navigate(`/provider/medical-record/${patientId}`);
  };

  const handleViewAppointment = (appointmentId) => {
    navigate(`/provider/appointments`);
  };

  const handleViewLabResults = () => {
    navigate(`/provider/lab-results`);
  };

  const handleViewCriticalCases = () => {
    navigate(`/provider/patients`);
  };

  const filteredRecentPatients = dashboardData?.recentPatients?.filter(record => {
    const patientName = `${record.patient.person.firstName} ${record.patient.person.lastName}`.toLowerCase();
    return patientName.includes(searchQuery.toLowerCase());
  }) || [];

  const filteredUpcomingAppointments = dashboardData?.upcomingAppointments?.filter(appointment => {
    const patientName = `${appointment.patient.person.firstName} ${appointment.patient.person.lastName}`.toLowerCase();
    return patientName.includes(searchQuery.toLowerCase());
  }) || [];

  const metrics = [
    {
      title: "Today's Appointments",
      value: dashboardData?.todayAppointments?.total || 0,
      sub: `${dashboardData?.todayAppointments?.remaining || 0} remaining`,
      icon: CalendarDaysIcon,
      onClick: handleViewAppointment,
    },
    {
      title: 'Active Patients',
      value: dashboardData?.activePatients?.total || 0,
      sub: `+${dashboardData?.activePatients?.newThisWeek || 0} this week`,
      icon: UserGroupIcon,
      onClick: () => navigate('/provider/patients'),
    },
    {
      title: 'Pending Lab Results',
      value: dashboardData?.pendingLabResults?.total || 0,
      sub: `${dashboardData?.pendingLabResults?.urgent || 0} urgent`,
      icon: BeakerIcon,
      onClick: handleViewLabResults,
    },
    {
      title: 'Critical Cases',
      value: dashboardData?.criticalCases?.total || 0,
      sub: 'Requires attention',
      icon: HeartIcon,
      onClick: handleViewCriticalCases,
    },
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-8">Doctor Dashboard</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">Error: {error}</p>
            <button 
              onClick={fetchDashboardData}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-8">Doctor Dashboard</h1>
        <h2 className="text-2xl font-extrabold mb-8">Welcome, Dr. Yohannes</h2>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric) => (
            <div key={metric.title} onClick={metric.onClick} className="cursor-pointer">
              <MetricCard 
                {...metric} 
                loading={loading}
              />
            </div>
          ))}
        </div>

        {/* Patient Vital Signs Trends */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h3 className="text-lg font-semibold mb-2">Patient Vital Signs Trends</h3>
          <p className="text-sm text-gray-500 mb-4">Average readings for monitored patients</p>
          <div className="h-64 flex items-center justify-center text-gray-400 border rounded-lg">
            {loading ? (
              <div className="animate-pulse bg-gray-200 h-48 w-full rounded"></div>
            ) : (
              <span>LineChart - date</span>
            )}
          </div>
        </div>

        {/* Recent Patients & Upcoming Appointments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">Recent Patients</h4>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-2 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-2 py-1 border rounded focus:outline-none focus:ring focus:border-blue-300 text-sm"
                  />
                </div>
                <button 
                  onClick={() => navigate('/provider/patients')}
                  className="ml-2 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 active:scale-95 text-sm font-medium transition"
                >
                  View All
                </button>
              </div>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse bg-gray-200 h-12 rounded"></div>
                ))}
              </div>
            ) : filteredRecentPatients.length > 0 ? (
              <div className="space-y-3">
                {filteredRecentPatients.map((record) => (
                  <div 
                    key={record.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewPatient(record.patient.id)}
                  >
                    <div>
                      <p className="font-medium">
                        {record.patient.person.firstName} {record.patient.person.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(record.visitDate).toLocaleDateString()}
                      </p>
                    </div>
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent patients found</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold">Upcoming Appointments</h4>
              <button 
                onClick={() => navigate('/provider/appointments')}
                className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 active:scale-95 text-sm font-medium transition"
              >
                View All
              </button>
            </div>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse bg-gray-200 h-12 rounded"></div>
                ))}
              </div>
            ) : filteredUpcomingAppointments.length > 0 ? (
              <div className="space-y-3">
                {filteredUpcomingAppointments.map((appointment) => (
                  <div 
                    key={appointment.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewAppointment(appointment.id)}
                  >
                    <div>
                      <p className="font-medium">
                        {appointment.patient.person.firstName} {appointment.patient.person.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(appointment.date).toLocaleDateString()} at {new Date(appointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No upcoming appointments</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard; 