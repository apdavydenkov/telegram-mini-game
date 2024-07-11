import React from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import EquipmentList from './EquipmentList';
import EquipmentForm from './EquipmentForm';

const AdminPanel = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <nav className="mb-4">
        <ul className="flex space-x-4">
          <li>
            <Link to="/admin/equipment" className="text-blue-500 hover:text-blue-700">
              Equipment
            </Link>
          </li>
          {/* Add more admin links here as needed */}
        </ul>
      </nav>
      <Routes>
        <Route path="equipment" element={<EquipmentList />} />
        <Route path="equipment/new" element={<EquipmentForm />} />
        <Route path="equipment/edit/:id" element={<EquipmentForm />} />
      </Routes>
    </div>
  );
};

export default AdminPanel;