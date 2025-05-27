import React, { useState } from 'react';
import { PencilSquareIcon, TrashIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

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

const hospitalOptions = [
  'Tikur Anbessa Specialized Hospital',
  "St. Paul's Hospital",
  'Gondar University Hospital',
  'Jimma University Medical Center',
  'Hawassa Referral Hospital',
];

const Admins = () => {
  const [admins] = useState(adminData);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    hospital: '',
    email: '',
    phone: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOpen = () => setShowModal(true);
  const handleClose = () => {
    setShowModal(false);
    setForm({ name: '', hospital: '', email: '', phone: '' });
  };

  return (
    <div className="p-6">
      {/* Table Title and Add Button */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Hospital Administrators</h2>
        <button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 active:scale-95 transition-transform" onClick={handleOpen}>
          <PlusIcon className="w-5 h-5" /> Add Admin
        </button>
      </div>

      {/* Admins Table */}
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

      {/* Modal Popup */}
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
            <h3 className="text-xl font-semibold mb-1">Add Hospital Administrator</h3>
            <p className="text-gray-500 text-sm mb-6">Assign an administrator to manage a hospital in the system.</p>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                  placeholder="Enter administrator's name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Hospital</label>
                <select
                  name="hospital"
                  value={form.hospital}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                >
                  <option value="">Select hospital</option>
                  {hospitalOptions.map((hosp, idx) => (
                    <option key={idx} value={hosp}>{hosp}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                    placeholder="admin@hospital.gov.et"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                    placeholder="+251..."
                  />
                </div>
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
                >
                  Add Administrator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admins; 