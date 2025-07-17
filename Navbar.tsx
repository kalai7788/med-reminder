// src/components/Navbar.tsx
import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [user] = useAuthState(auth);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = '/login';
  };

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">M</div>
        <span className="text-xl font-bold text-gray-800">MediTrack</span>
      </div>

      <div className="hidden md:flex space-x-6">
        <Link
          to="/caretaker"
          className="px-4 py-1 bg-blue-500 text-white hover:bg-blue-600 rounded transition"
        >
          Caretaker View
        </Link>
        <Link
          to="/patient"
          className="px-4 py-1 bg-green-500 text-white hover:bg-green-600 rounded transition"
        >
          Patient View
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">Welcome, {user?.email}</span>
        <button
          onClick={handleLogout}
          className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;