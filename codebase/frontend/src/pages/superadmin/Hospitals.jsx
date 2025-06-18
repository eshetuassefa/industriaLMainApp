import React, { useState, useEffect } from 'react';
import { PencilSquareIcon, TrashIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import superadminService from '../../services/superadmin.service';

// Hardcoded regions from seed data
const regions = [
  { id: 1, name: "Tigray Region" },
  { id: 2, name: "Afar Region" },
  { id: 3, name: "Amhara Region" },
  { id: 4, name: "Oromia Region" },
  { id: 5, name: "Somali Region" },
  { id: 6, name: "Benishangul-Gumuz Region" },
  { id: 7, name: "Southern Nations, Nationalities and Peoples Region (SNNPR)" },
  { id: 8, name: "Gambela Region" },
  { id: 9, name: "Harari Region" },
  { id: 10, name: "Addis Ababa City Administration" },
  { id: 11, name: "Dire Dawa City Administration" },
  { id: 12, name: "Sidama Region" },
  { id: 13, name: "South West Ethiopia Peoples' Region" },
  { id: 14, name: "South Ethiopia Region" },
];

const Hospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [form, setForm] = useState({
    name: '',
    code: '',
    regionId: '',
    city: '',
    zone: '',
  });
  const [adminForm, setAdminForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const response = await superadminService.getAllHospitals();
      if (response.success) {
        setHospitals(response.data);
      } else {
        setError(response.error.message);
      }
    } catch (err) {
      setError('Failed to fetch hospitals');
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdminChange = (e) => {
    setAdminForm({ ...adminForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const hospitalData = {
        ...form,
        regionId: parseInt(form.regionId),
      };
      const response = await superadminService.createHospital(hospitalData);
      if (response.success) {
        const newHospital = response.data;
        setHospitals(prevHospitals => [...prevHospitals, newHospital]);
        setSelectedHospital(newHospital);
        handleClose();
        setShowAdminModal(true);
      } else {
        setError(response.error.message);
      }
    } catch (err) {
      setError('Failed to create hospital');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const adminData = {
        ...adminForm,
        hospitalId: selectedHospital.id,
      };
      const response = await superadminService.createHospitalAdmin(adminData);
      if (response.success) {
        handleCloseAdmin();
        fetchHospitals(); // Refresh the list to show the new admin
      } else {
        setError(response.error.message);
      }
    } catch (err) {
      setError('Failed to create admin');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => setShowModal(true);
  const handleClose = () => {
    setShowModal(false);
    setForm({
      name: '',
      code: '',
      regionId: '',
      city: '',
      zone: '',
    });
    setError(null);
  };

  const handleCloseAdmin = () => {
    setShowAdminModal(false);
    setAdminForm({
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      password: '',
    });
    setSelectedHospital(null);
    setError(null);
  };

  return (
    <div className="p-6">
      {/* Table Title and Add Button */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Registered Hospitals</h2>
        <button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 active:scale-95 transition-transform" onClick={handleOpen}>
          <PlusIcon className="w-5 h-5" /> Add Hospital
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Hospitals Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hospital Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Region</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">City</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {hospitals.map((hospital) => {
              const admin = hospital.users?.[0]; // Get the first admin
              return (
                <tr key={hospital.id}>
                <td className="px-6 py-4 whitespace-nowrap">{hospital.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{hospital.code}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{hospital.region?.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{hospital.city}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{hospital.zone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {admin ? `${admin.person?.firstName} ${admin.person?.lastName}` : '-'}
                  </td>
                <td className="px-6 py-4 whitespace-nowrap">
                    {admin?.person?.phoneNumber || '-'}
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
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Hospital Creation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8 relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={handleClose}
              aria-label="Close"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-semibold mb-1">Add Hospital</h3>
            <p className="text-gray-500 text-sm mb-6">Register a new hospital in the system.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Hospital Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                  placeholder="Enter hospital name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Hospital Code</label>
                <input
                  type="text"
                  name="code"
                  value={form.code}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                  placeholder="Enter hospital code"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Region</label>
                <select
                  name="regionId"
                  value={form.regionId}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                  required
                >
                  <option value="">Select region</option>
                  {regions.map((region) => (
                    <option key={region.id} value={region.id}>
                      {region.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                  placeholder="Enter city"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Zone</label>
                <input
                  type="text"
                  name="zone"
                  value={form.zone}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                  placeholder="Enter zone"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 rounded border border-gray-300 text-gray-700 bg-white hover:bg-gray-200 active:scale-95 transition-transform"
                  onClick={handleClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-black text-white hover:bg-gray-800 active:scale-95 transition-transform"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Add Hospital'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Creation Modal */}
      {showAdminModal && selectedHospital && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-8 relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={handleCloseAdmin}
              aria-label="Close"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-semibold mb-1">Add Hospital Administrator</h3>
            <p className="text-gray-500 text-sm mb-6">
              Create an administrator for {selectedHospital?.name || 'the hospital'}
            </p>
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={adminForm.firstName}
                    onChange={handleAdminChange}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={adminForm.lastName}
                    onChange={handleAdminChange}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={adminForm.email}
                  onChange={handleAdminChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                  placeholder="admin@hospital.gov.et"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={adminForm.phoneNumber}
                  onChange={handleAdminChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                  placeholder="+251..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={adminForm.password}
                  onChange={handleAdminChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                  placeholder="Enter password"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 rounded border border-gray-300 text-gray-700 bg-white hover:bg-gray-200 active:scale-95 transition-transform"
                  onClick={handleCloseAdmin}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-black text-white hover:bg-gray-800 active:scale-95 transition-transform"
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Add Administrator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hospitals; 