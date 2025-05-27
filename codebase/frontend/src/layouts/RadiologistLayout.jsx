import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  CalendarDaysIcon,
  ClockIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/radiologist/dashboard', icon: ChartBarIcon },
  { name: 'Pending Scans', href: '/radiologist/pending-scans', icon: ClockIcon },
  { name: 'In progress Scans', href: '/radiologist/in-progress-scans', icon: ClockIcon },
  { name: 'Completed today', href: '/radiologist/completed-scans', icon: DocumentTextIcon },
  { name: 'Urgent Scans', href: '/radiologist/urgent-scans', icon: DocumentTextIcon },
  { name: 'Settings', href: '/radiologist/settings', icon: CogIcon },
];

const RadiologistLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-6 fixed h-screen top-0 left-0">
        <h2 className="text-2xl font-bold mb-6">Ethiopia e-Health</h2>
        <nav>
          <ul>
            {location.pathname.startsWith('/radiologist/results/') ? (
              <li className="mb-4">
                <a
                  href="#"
                  onClick={() => navigate(-1)}
                  className="flex items-center text-gray-300 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                  </svg>
                  Go back
                </a>
              </li>
            ) : (
              navigation.map((item) => (
                <li key={item.name} className="mb-4">
                  <a
                    href="#"
                    onClick={() => navigate(item.href)}
                    className={`flex items-center hover:text-white ${isActive(item.href) ? 'text-white font-bold' : 'text-gray-300'}`}
                  >
                    <item.icon className="h-5 w-5 mr-2" />
                    {item.name}
                  </a>
                </li>
              ))
            )}
          </ul>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto ml-64">
        <Outlet /> {/* This is where the nested route components will render */}
      </div>
    </div>
  );
};

export default RadiologistLayout; 