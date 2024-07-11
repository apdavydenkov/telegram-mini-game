import React from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import EquipmentList from './EquipmentList';
import EquipmentForm from './EquipmentForm';

const AdminPanel = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h1 className="text-xl font-semibold text-gray-800">Admin Panel</h1>
        </div>
        <nav className="mt-4">
          <Link to="/admin/equipment" className="block py-2 px-4 text-gray-600 hover:bg-gray-200 transition-colors">
            Equipment
          </Link>
          {/* Add more menu items as needed */}
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <Routes>
          <Route path="equipment" element={<EquipmentList />} />
          <Route path="equipment/new" element={<EquipmentForm />} />
          <Route path="equipment/edit/:id" element={<EquipmentForm />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminPanel;