import React, { useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BuildingOffice2Icon, UsersIcon, UserGroupIcon, SignalIcon, PencilSquareIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

// Sample data for charts
const healthTrendsData = [
  { month: 'Jan', cases: 4000 },
  { month: 'Feb', cases: 3000 },
  { month: 'Mar', cases: 2000 },
  { month: 'Apr', cases: 2780 },
  { month: 'May', cases: 1890 },
  { month: 'Jun', cases: 2390 },
];

const regionUsageData = [
  { region: 'Addis Ababa', records: 3000 },
  { region: 'Oromia', records: 2500 },
  { region: 'Amhara', records: 2000 },
  { region: 'SNNPR', records: 1500 },
  { region: 'Tigray', records: 1000 },
];

const hospitals = [
  { name: 'Black Lion Hospital', region: 'Addis Ababa', type: 'Public', beds: 800, staff: 1200, status: 'Active' },
  { name: 'St. Paul Hospital', region: 'Addis Ababa', type: 'Public', beds: 600, staff: 900, status: 'Active' },
  { name: 'Yekatit 12 Hospital', region: 'Addis Ababa', type: 'Public', beds: 400, staff: 600, status: 'Active' },
];

const adminData = [
  {
    name: 'Abebe Bekele',
    hospital: 'Tikur Anbessa Specialized Hospital',
    email: 'abebe.bekele@example.com',
    phone: '+251911234567',
    status: 'Active',
  },
  {
    name: 'Tigist Haile',
    hospital: "St. Paul's Hospital",
    email: 'tigist.haile@example.com',
    phone: '+251922345678',
    status: 'Active',
  },
  {
    name: 'Dawit Tadesse',
    hospital: 'Gondar University Hospital',
    email: 'dawit.tadesse@example.com',
    phone: '+251933456789',
    status: 'Active',
  },
  {
    name: 'Hiwot Mekonnen',
    hospital: 'Jimma University Medical Center',
    email: 'hiwot.mekonnen@example.com',
    phone: '+251944567890',
    status: 'Active',
  },
  {
    name: 'Solomon Tesfaye',
    hospital: 'Hawassa Referral Hospital',
    email: 'solomon.tesfaye@example.com',
    phone: '+251955678901',
    status: 'Active',
  },
];

const tabs = [
  { name: 'Hospitals', key: 'hospitals' },
  { name: 'Hospital Admins', key: 'admins' },
  { name: 'System Reports', key: 'reports' },
];

const MetricCard = ({ icon: Icon, title, value, change, period }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h3 className="text-2xl font-bold mt-2">{value}</h3>
        <p className="text-sm text-gray-600 mt-1">{change} {period}</p>
      </div>
      <Icon className="h-12 w-12 text-gray-400" />
    </div>
  </div>
);

function AdminsTable({ admins }) {
  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {admins.map((admin, idx) => (
            <tr key={idx}>
              <td className="px-6 py-4 whitespace-nowrap font-semibold">{admin.name}</td>
              <td className="px-6 py-4 whitespace-nowrap">{admin.hospital}</td>
              <td className="px-6 py-4 whitespace-nowrap">{admin.email}</td>
              <td className="px-6 py-4 whitespace-nowrap">{admin.phone}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-black text-white">{admin.status}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                <button className="text-gray-600 hover:text-black active:scale-95 transition-transform">
                  <PencilSquareIcon className="w-5 h-5" />
                </button>
                <button className="text-gray-600 hover:text-red-700 active:scale-95 transition-transform">
                  <TrashIcon className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('hospitals');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-8">Super Admin Dashboard</h1>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={BuildingOffice2Icon}
            title="Total Hospitals"
            value="128"
            change="+3"
            period="from last month"
          />
          <MetricCard
            icon={UsersIcon}
            title="Registered Patients"
            value="1.2M"
            change="+15%"
            period="from last quarter"
          />
          <MetricCard
            icon={UserGroupIcon}
            title="Active Healthcare Workers"
            value="24,331"
            change="+342"
            period="from last month"
          />
          <MetricCard
            icon={SignalIcon}
            title="System Uptime"
            value="99.8%"
            change="Last 30 days"
            period=""
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Health Trends Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">National Health Trends</h2>
            <p className="text-sm text-gray-500 mb-4">Top reported conditions across all hospitals</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={healthTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="cases" stroke="#8884d8" fill="#8884d8" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Region Usage Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-2">System Usage by Region</h2>
            <p className="text-sm text-gray-500 mb-4">Patient records and registrations</p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={regionUsageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="region" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="records" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Tabs for Hospitals/Admins/Reports */}
        <div className="mb-6 flex">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 text-center py-2 rounded-t-lg text-sm font-medium border-b-2 transition-colors duration-150 ${
                activeTab === tab.key
                  ? 'bg-gray-50 border-gray-300 text-black'
                  : 'bg-gray-100 border-transparent text-gray-500 hover:text-black'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'hospitals' && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Registered Hospitals</h2>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beds</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {hospitals.map((hospital, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">{hospital.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{hospital.region}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{hospital.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{hospital.beds}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{hospital.staff}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {hospital.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button className="text-indigo-600 hover:text-indigo-800 active:scale-95 transition-transform">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'admins' && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Hospital Administrators</h2>
            <AdminsTable admins={adminData} />
          </div>
        )}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            <h2 className="text-lg font-semibold mb-2">System Reports</h2>
            <p>Report generation and export functionality coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 