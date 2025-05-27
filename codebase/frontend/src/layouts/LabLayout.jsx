import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { DocumentTextIcon, ClockIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const LabLayout = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get the current location

  // Helper function to determine if a link is active
  const isActive = (path) => location.pathname === path;

  // Check if the current path is the Lab Result Form page
  const isResultFormPage = location.pathname.startsWith('/lab/results/');

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-6">
        <h2 className="text-2xl font-bold mb-6">Ethiopia e-Health</h2>
        <nav>
          <ul>
            <li className="mb-4">
              <a
                href="#"
                onClick={() => navigate('/lab/dashboard')}
                className={`flex items-center hover:text-white ${isActive('/lab/dashboard') ? 'text-white font-bold' : 'text-gray-300'}`}
              >
                 {/* Assuming you want a Home icon or similar for dashboard */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.71-8.71a.75.75 0 011.06 0L21.75 12m-4.5 9a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zm-13.5 0a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zm11.18-9.75L9.53 3.22a.75.75 0 00-1.06 0L1.16 10.78a.75.75 0 001.06 1.06L3 11.06v9.19a.75.75 0 00.75.75h3.192c.055 0 .108-.014.16-.042a2.25 2.25 0 011.468-1.902 4.473 4.473 0 00.82-.563c.168-.133.33-.265.488-.397.493-.397 1.053-.64 1.653-.75A.75.75 0 0112 15c.188 0 .375.023.556.067.6.11 1.16.353 1.653.75.158.132.32.264.487.397a4.473 4.473 0 00.82.563c.052.028.105.042.16.042H20.25a.75.75 0 00.75-.75v-9.19l.814.814a.75.75 0 001.06-1.06L12.53 3.22a.75.75 0 00-1.06 0L10.5 4.944V2.25A.75.75 0 009.75 1.5h-3A.75.75 0 006 2.25v1.944l-.814.814a.75.75 0 000 1.06z" />
                </svg>
                Dashboard
              </a>
            </li>
            {!isResultFormPage && (
              <>
                {/* Add other lab-specific navigation links here if needed */}
                 <li className="mb-4">
                  <a
                    href="#"
                    onClick={() => navigate('/lab/pending-tests')}
                    className={`flex items-center hover:text-white ${isActive('/lab/pending-tests') ? 'text-white font-bold' : 'text-gray-300'}`}
                  >
                    <ClockIcon className="h-5 w-5 mr-2" />
                    Pending Tests
                  </a>
                </li>
                 <li className="mb-4">
                  <a
                    href="#"
                    onClick={() => navigate('/lab/in-progress-tests')}
                    className={`flex items-center hover:text-white ${isActive('/lab/in-progress-tests') ? 'text-white font-bold' : 'text-gray-300'}`}
                  >
                    <DocumentTextIcon className="h-5 w-5 mr-2" />
                    In Progress Tests
                  </a>
                </li>
                 <li className="mb-4">
                  <a
                    href="#"
                    onClick={() => navigate('/lab/completed-tests')}
                    className={`flex items-center hover:text-white ${isActive('/lab/completed-tests') ? 'text-white font-bold' : 'text-gray-300'}`}
                  >
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Completed Tests
                  </a>
                </li>
                 <li className="mb-4">
                  <a
                    href="#"
                    onClick={() => navigate('/lab/urgent-tests')}
                    className={`flex items-center hover:text-white ${isActive('/lab/urgent-tests') ? 'text-white font-bold' : 'text-gray-300'}`}
                  >
                    <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                    Urgent Tests
                  </a>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8">
        <Outlet /> {/* This is where the nested route components will render */}
      </div>
    </div>
  );
};

export default LabLayout; 