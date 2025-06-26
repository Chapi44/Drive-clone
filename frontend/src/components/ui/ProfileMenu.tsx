import React, { useRef, useEffect, useState } from 'react';
import { LuX, LuCamera, LuPlus, LuLogOut, LuCloud } from 'react-icons/lu';
import { getMe } from '../../services/authService';

interface ProfileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UserData {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ isOpen, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No token found');
        return;
      }
      setLoading(true);
      setError(null);
      getMe(token)
        .then((data) => {
          setUser(data);
        })
        .catch((err) => {
          setError(err.message || 'Failed to fetch user');
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="absolute top-14 right-4 w-96 bg-white rounded-3xl shadow-lg border border-gray-200 z-20 p-6 flex items-center justify-center">
        <span>Loading...</span>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="absolute top-14 right-4 w-96 bg-white rounded-3xl shadow-lg border border-gray-200 z-20 p-6 flex items-center justify-center">
        <span className="text-red-500">{error || 'No user data'}</span>
      </div>
    );
  }

  const avatarLetter = user.firstName ? user.firstName[0].toUpperCase() : '?';
  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <div 
      ref={menuRef}
      className="absolute top-14 right-4 w-96 bg-white rounded-3xl shadow-lg border border-gray-200 z-50 p-6"
    >
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-gray-700">{user.email}</span>
        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
          <LuX className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <div className="flex flex-col items-center text-center">
        <div className="relative mb-2">
          <div className="w-24 h-24 bg-google-gray-500 rounded-full flex items-center justify-center text-white text-4xl font-bold">
            {avatarLetter}
          </div>
          <button className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow border">
            <LuCamera className="w-5 h-5 text-gray-700" />
          </button>
        </div>
        <h2 className="text-2xl mt-2">Hi, {fullName}!</h2>
        <button className="mt-4 px-6 py-2 border border-gray-300 rounded-full text-blue-600 hover:bg-blue-50 text-sm font-medium">
          Manage your Google Account
        </button>
      </div>

      <div className="my-6 flex gap-4">
        <button className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-full hover:bg-gray-50">
          <LuPlus className="w-5 h-5" />
          <span className="text-sm font-medium">Add account</span>
        </button>
        <button
          className="flex-1 flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-full hover:bg-gray-50"
          onClick={() => {
            localStorage.clear();
            onClose();
            window.location.href = '/auth/login';
          }}
        >
          <LuLogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Sign out</span>
        </button>
      </div>

      <button className="w-full flex items-center justify-center gap-3 py-3 border border-gray-300 rounded-full hover:bg-gray-50 mb-6">
        <LuCloud className="w-5 h-5 text-blue-500" />
        <span className="text-sm">0% of 15 GB used</span>
      </button>

      <div className="text-center text-xs text-gray-500">
        <a href="#" className="hover:underline">Privacy policy</a>
        <span className="mx-2">&bull;</span>
        <a href="#" className="hover:underline">Terms of Service</a>
      </div>
    </div>
  );
};

export default ProfileMenu; 