import React from 'react';
import {
  CalendarDaysIcon,
  UserGroupIcon,
  BeakerIcon,
  HeartIcon,
  BellIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

const metrics = [
  {
    title: "Today's Appointments",
    value: 6,
    sub: '3 remaining',
    icon: CalendarDaysIcon,
  },
  {
    title: 'Active Patients',
    value: 42,
    sub: '+3 this week',
    icon: UserGroupIcon,
  },
  {
    title: 'Pending Lab Results',
    value: 7,
    sub: '2 urgent',
    icon: BeakerIcon,
  },
  {
    title: 'Critical Cases',
    value: 1,
    sub: 'Requires attention',
    icon: HeartIcon,
  },
];

const MetricCard = ({ icon: Icon, title, value, sub }) => (
  <div className="bg-white p-6 rounded-lg shadow flex items-center justify-between">
    <div>
      <p className="text-gray-500 text-sm">{title}</p>
      <h3 className="text-2xl font-bold mt-2">{value}</h3>
      <p className="text-sm text-gray-600 mt-1">{sub}</p>
    </div>
    <Icon className="h-12 w-12 text-gray-400" />
  </div>
);

const DoctorDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-8">Doctor Dashboard</h1>
        <h2 className="text-2xl font-extrabold mb-8">Welcome, Dr. Yohannes</h2>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric) => (
            <MetricCard key={metric.title} {...metric} />
          ))}
        </div>

        {/* Patient Vital Signs Trends */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h3 className="text-lg font-semibold mb-2">Patient Vital Signs Trends</h3>
          <p className="text-sm text-gray-500 mb-4">Average readings for monitored patients</p>
          <div className="h-64 flex items-center justify-center text-gray-400 border rounded-lg">
            LineChart - date
          </div>
        </div>

        {/* Recent Patients & Upcoming Appointments */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">Recent Patients</h4>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-2 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search patients..."
                    className="pl-8 pr-2 py-1 border rounded focus:outline-none focus:ring focus:border-blue-300 text-sm"
                  />
                </div>
                <button className="ml-2 px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 active:scale-95 text-sm font-medium transition">View All</button>
              </div>
            </div>
            <div className="text-gray-400 text-sm">Recent Patients</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">Upcoming Appointments</h4>
            </div>
            <div className="text-gray-400 text-sm">Upcoming Appointments</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard; 