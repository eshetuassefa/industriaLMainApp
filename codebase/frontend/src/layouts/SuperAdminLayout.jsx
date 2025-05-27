import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ChartBarIcon,
  BuildingOffice2Icon,
  UsersIcon,
  ChartPieIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/superadmin', icon: ChartBarIcon },
  { name: 'Hospitals', href: '/superadmin/hospitals', icon: BuildingOffice2Icon },
  { name: 'Admins', href: '/superadmin/admins', icon: UsersIcon },
  { name: 'Regional Data', href: '/superadmin/regional-data', icon: ChartPieIcon },
  { name: 'Reports', href: '/superadmin/reports', icon: DocumentTextIcon },
  { name: 'System Settings', href: '/superadmin/settings', icon: Cog6ToothIcon },
];

const SuperAdminLayout = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gray-800 shadow-lg text-white">
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-white">Ethiopia e-Health</h1>
        </div>

        {/* Navigation */}
        <nav className="px-4 mt-6">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-2 py-2 mt-2 rounded-lg ${
                  isActive
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <item.icon className="w-6 h-6 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="pl-64">
        {/* Header */}
        <header className="h-16 bg-white shadow-sm">
          <div className="flex items-center justify-end h-full px-6">
            <div className="flex items-center">
              <span className="mr-2 text-sm text-gray-600">Super Admin</span>
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main>{children}</main>
      </div>
    </div>
  );
};

export default SuperAdminLayout; 