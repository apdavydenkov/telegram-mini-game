import React from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import AdminGameItemList from './AdminGameItemList';
import AdminGameItemForm from './AdminGameItemForm';

const AdminPanel = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4">
          <h1 className="text-xl font-semibold text-gray-800">Admin Panel</h1>
        </div>
        <nav className="mt-4">
          <Link to="/admin/gameItem" className="block py-2 px-4 text-gray-600 hover:bg-gray-200 transition-colors">
            Game Items
          </Link>
          {/* Add more menu items as needed */}
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <Routes>
          <Route path="gameItem" element={<AdminGameItemList />} />
          <Route path="gameItem/new" element={<AdminGameItemForm />} />
          <Route path="gameItem/edit/:id" element={<AdminGameItemForm />} />
        </Routes>
      </main>
    </div>
  );
};

export default AdminPanel;