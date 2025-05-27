import React, { useState } from 'react';
import { PencilSquareIcon, TrashIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

const hospitalData = [
  {
    name: 'Black Lion Hospital',
    region: 'Addis Ababa',
    type: 'Public',
    beds: 800,
    staff: 1200,
    status: 'Active',
  },
  {
    name: 'St. Paul Hospital',
    region: 'Addis Ababa',
    type: 'Public',
    beds: 600,
    staff: 900,
    status: 'Active',
  },
  {
    name: 'Yekatit 12 Hospital',
    region: 'Addis Ababa',
    type: 'Public',
    beds: 400,
    staff: 600,
    status: 'Active',
  },
];

const regionOptions = [
  'Addis Ababa',
  'Oromia',
  'Amhara',
  'SNNPR',
  'Tigray',
];

const typeOptions = [
  'Public',
  'Private',
  'NGO',
];

const Hospitals = () => {
  const [hospitals] = useState(hospitalData);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    region: '',
    type: '',
    beds: '',
    staff: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOpen = () => setShowModal(true);
  const handleClose = () => {
    setShowModal(false);
    setForm({ name: '', region: '', type: '', beds: '', staff: '' });
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

      {/* Hospitals Table */}
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
            {hospitals.map((hospital, idx) => (
              <tr key={idx}>
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
            <h3 className="text-xl font-semibold mb-1">Add Hospital</h3>
            <p className="text-gray-500 text-sm mb-6">Register a new hospital in the system.</p>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Hospital Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                  placeholder="Enter hospital name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Region</label>
                <select
                  name="region"
                  value={form.region}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                >
                  <option value="">Select region</option>
                  {regionOptions.map((region, idx) => (
                    <option key={idx} value={region}>{region}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                >
                  <option value="">Select type</option>
                  {typeOptions.map((type, idx) => (
                    <option key={idx} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Beds</label>
                  <input
                    type="number"
                    name="beds"
                    value={form.beds}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                    placeholder="Number of beds"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Staff</label>
                  <input
                    type="number"
                    name="staff"
                    value={form.staff}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                    placeholder="Number of staff"
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
                  Add Hospital
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