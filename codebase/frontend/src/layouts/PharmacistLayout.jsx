import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  ArchiveBoxIcon, // Example icon for inventory
  ClipboardDocumentListIcon, // Example icon for prescriptions
  UserGroupIcon, // Example icon for patients
  BellIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/pharmacist', icon: ArchiveBoxIcon }, // Assuming dashboard is the index
  { name: 'Inventory', href: '/pharmacist/inventory', icon: ArchiveBoxIcon },
  { name: 'Prescriptions', href: '/pharmacist/prescriptions', icon: ClipboardDocumentListIcon },
  { name: 'Patients', href: '/pharmacist/patients', icon: UserGroupIcon },
];

const PharmacistLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    // Add pharmacist-specific notifications here if needed
    {
      id: 1,
      type: 'new_prescription',
      message: 'New prescription received for John Doe',
      time: '10 minutes ago',
      read: false,
    },
    {
      id: 2,
      type: 'low_stock',
      message: 'Item Paracetamol is running low',
      time: '1 day ago',
      read: true,
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

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
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || (item.href === '/pharmacist' && location.pathname === '/pharmacist'); // Handle root path
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
            })}
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

export default PharmacistLayout; 