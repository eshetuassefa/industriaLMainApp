import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  CalendarDaysIcon,
  UserGroupIcon,
  BeakerIcon,
  HeartIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  BellIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/provider', icon: CalendarDaysIcon },
  { name: 'Patients', href: '/provider/patients', icon: UserGroupIcon },
  { name: 'Appointments', href: '/provider/appointments', icon: CalendarDaysIcon },
  { name: 'Medical Records', href: '/provider/medical-records', icon: HeartIcon },
  { name: 'Prescriptions', href: '/provider/prescriptions', icon: ClipboardDocumentListIcon },
  { name: 'Lab Results', href: '/provider/lab-results', icon: BeakerIcon },
  { name: 'Radiology', href: '/provider/radiology', icon: DocumentTextIcon },
];

const ProviderLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    {
      id: 1,
      type: 'new_patient',
      message: 'New patient Abebe Kebede assigned to you',
      time: '5 minutes ago',
      read: false,
    },
    {
      id: 2,
      type: 'appointment',
      message: 'New appointment scheduled with Tigist Hailu',
      time: '1 hour ago',
      read: false,
    },
    {
      id: 3,
      type: 'new_patient',
      message: 'New patient Solomon Tadesse assigned to you',
      time: '2 hours ago',
      read: true,
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Check if the current path matches the medical record detail page pattern
  const isMedicalRecordPage = location.pathname.startsWith('/provider/medical-record/') && location.pathname.split('/').length === 4;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gray-800 shadow-lg text-white">
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-gray-700">
          <h1 className="text-xl font-bold text-white">Ethiopia e-Health</h1>
        </div>

        {/* Navigation */}
        <nav className="px-4 mt-6">
          <ul>
            {isMedicalRecordPage ? (
              // "Go back" link for medical record entry page
              <li className="mb-4">
                <a
                  href="#"
                  onClick={() => navigate(-1)}
                  className="flex items-center px-2 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                  </svg>
                  Go back
                </a>
              </li>
            ) : (
              // Standard Navigation Links for other provider pages
              navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.name} className="mb-4">
                    <Link
                      to={item.href}
                      className={`flex items-center px-2 py-2 rounded-lg ${
                        isActive
                          ? 'bg-gray-700 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <item.icon className="w-6 h-6 mr-3" />
                      {item.name}
                    </Link>
                  </li>
                );
              })
            )}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        {/* Header */}
        <header className="h-16 bg-white shadow-sm">
          <div className="flex items-center justify-end h-full px-6">
            <div className="flex items-center gap-4">
              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  <BellIcon className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                        >
                          <p className="text-sm text-gray-900">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-2 border-t border-gray-200">
                      <button className="text-sm text-gray-600 hover:text-gray-900">
                        Mark all as read
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div className="flex items-center">
                <span className="mr-2 text-sm text-gray-600">Doctor</span>
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main>{children}</main>
      </div>
    </div>
  );
};

export default ProviderLayout; 