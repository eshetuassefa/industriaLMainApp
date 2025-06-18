import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  UsersIcon,
  BuildingOfficeIcon,
  DocumentChartBarIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import authService from '../services/auth.service';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: UsersIcon }, // Placeholder icons
  { name: 'Manage Users', href: '/admin/users', icon: BuildingOfficeIcon },
  { name: 'System Logs', href: '/admin/logs', icon: DocumentChartBarIcon },
  // Add other admin navigation items here
];

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications] = useState([
    // Add admin-specific notifications here if needed
    {
      id: 1,
      type: 'new_user_request',
      message: 'New user registration request pending',
      time: '15 minutes ago',
      read: false,
    },
    {
      id: 2,
      type: 'system_alert',
      message: 'High system load detected',
      time: '2 hours ago',
      read: true,
    },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getInitials = (name) => {
    if (!name) return "A";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const user = {
    name: localStorage.getItem("userName") || "Admin",
    role: localStorage.getItem("userRole") || "ADMIN",
    avatar: localStorage.getItem("userAvatar") || null,
  };

  return (
    <div className="bg-gray-100">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gray-800 shadow-lg text-white">
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-gray-700">
          <h1 className="text-xl font-bold text-white">Ethiopia e-Health (Admin)</h1>
        </div>

        {/* Navigation */}
        <nav className="px-4 mt-6">
          <ul>
            {navigation.map((item) => {
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

export default AdminLayout; 