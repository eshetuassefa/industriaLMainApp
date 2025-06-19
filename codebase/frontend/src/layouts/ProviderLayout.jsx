import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet, matchPath } from 'react-router-dom';
import {
  CalendarDaysIcon,
  UserGroupIcon,
  BeakerIcon,
  HeartIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  BellIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/provider/dashboard', icon: CalendarDaysIcon },
  { name: 'Patients', href: '/provider/patients', icon: UserGroupIcon },
  { name: 'Appointments', href: '/provider/appointments', icon: CalendarDaysIcon },
];

const recordSubNav = [
  { name: 'Prescriptions', path: 'prescriptions', icon: ClipboardDocumentListIcon },
  { name: 'Lab Tests', path: 'lab-tests', icon: BeakerIcon },
  { name: 'Radiology Requests', path: 'radiology-requests', icon: DocumentTextIcon },
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

  // Match /provider/medical-record/:patientId and its subpages
  const match = matchPath('/provider/medical-record/:patientId/*', location.pathname);
  const isMedicalRecordContext = Boolean(match);
  const patientId = match ? match.params.patientId : null;

  return (
    <div className="bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gray-800 shadow-lg text-white">
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-gray-700">
          <h1 className="text-xl font-bold text-white">Ethiopia e-Health</h1>
        </div>

        {/* Navigation */}
        <nav className="px-4 mt-6">
          <ul>
            {isMedicalRecordContext ? (
              <>
                {/* "Go back" link for medical record entry page */}
                <li className="mb-4">
                  <a
                    href="#"
                    onClick={() => navigate(-1)}
                    className="flex items-center px-2 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    <ArrowLeftIcon className="w-6 h-6 mr-3" />
                    Go back
                  </a>
                </li>
                {/* Sub-navigation for medical record */}
                {recordSubNav.map((item) => {
                  const subPath = `/provider/medical-record/${patientId}/${item.path}`;
                  const isActive = location.pathname === subPath;
                  return (
                    <li key={item.name} className="mb-4">
                      <Link
                        to={subPath}
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
                })}
              </>
            ) : (
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
      <div className="pl-64 flex-1" style={{ overflowX: 'hidden' }}>
        

        {/* Page Content */}
        <main style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflowY: 'auto' }}><Outlet /></main>
      </div>
    </div>
  );
};

export default ProviderLayout; 