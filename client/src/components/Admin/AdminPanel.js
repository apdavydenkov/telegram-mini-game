import React from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import AdminEquipmentList from './AdminEquipmentList';
import AdminEquipmentForm from './AdminEquipmentForm';

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
          <Route path="equipment" element={<AdminEquipmentList />} />
          <Route path="equipment/new" element={<AdminEquipmentForm />} />
          <Route path="equipment/edit/:id" element={<AdminEquipmentForm />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminPanel;