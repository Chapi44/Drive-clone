import React, { useEffect, useState } from 'react';
import { 
  LuSearch, 
  LuCircleHelp, 
  LuSettings, 
  LuLayoutGrid, 
  LuSlidersHorizontal,
  LuCircleCheck
} from 'react-icons/lu';
import DriveLogo from '../../assets/pngwing.com.png';
import ProfileMenu from '../ui/ProfileMenu';
import { getMe } from '../../services/authService';

interface HeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (value: string) => void;
}

interface UserData {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
}

const Header: React.FC<HeaderProps> = ({ searchValue, onSearchChange, onSearchSubmit }) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    getMe(token)
      .then(data => setUser(data))
      .catch(() => setUser(null));
  }, []);

  const avatarLetter = user?.firstName ? user.firstName[0].toUpperCase() : '?';
  const userEmail = user?.email || '';

  return (
    <>
      <header className="flex items-center justify-between px-6 h-16 bg-google-gray-100 border-b border-google-gray-300 relative z-10">
        <div className="flex items-center gap-2">
          <img src={DriveLogo} alt="Drive Logo" className="w-10 h-10" />
          <span className="text-google-gray-800 text-2xl font-light">Drive</span>
        </div>

        <div className="flex-1 max-w-3xl ml-16">
          <div className="relative">
            <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-google-gray-700 cursor-pointer" onClick={() => onSearchSubmit(searchValue)} />
            <input
              type="text"
              placeholder="Search in Drive"
              className="w-full bg-google-gray-200/75 rounded-full py-2.5 pl-12 pr-14 focus:outline-none focus:ring-2 focus:ring-google-blue focus:bg-white"
              value={searchValue}
              onChange={e => onSearchChange(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') onSearchSubmit(searchValue);
              }}
            />
            <LuSlidersHorizontal className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-google-gray-700" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-google-gray-200">
              <LuCircleCheck className="w-6 h-6 text-google-gray-700" />
          </button>
          <button className="p-2 rounded-full hover:bg-google-gray-200">
            <LuCircleHelp className="w-6 h-6 text-google-gray-700" />
          </button>
          <button className="p-2 rounded-full hover:bg-google-gray-200">
            <LuSettings className="w-6 h-6 text-google-gray-700" />
          </button>
          <button className="p-2 rounded-full hover:bg-google-gray-200">
            <LuLayoutGrid className="w-6 h-6 text-google-gray-700" />
          </button>
          <button
            onClick={() => setIsProfileMenuOpen(prev => !prev)}
            className="p-2 rounded-full bg-google-gray-500 text-white w-9 h-9 flex items-center justify-center"
            title={userEmail}
          >
            <span className="text-md font-bold">{avatarLetter}</span>
          </button>
        </div>
      </header>
      <ProfileMenu 
        isOpen={isProfileMenuOpen}
        onClose={() => setIsProfileMenuOpen(false)}
      />
    </>
  );
};

export default Header;
