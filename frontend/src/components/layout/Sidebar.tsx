import React from 'react';
import { LuFolder, LuStar, LuClock, LuX } from 'react-icons/lu';
import NewMenu from '../../components/drive/NewMenu';
import { useLocation, useNavigate } from 'react-router-dom';

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ visible, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const menuItems = [
    { icon: LuFolder, name: 'Home', path: '/dashboard' },
    { icon: LuStar, name: 'Starred', path: '/dashboard/starred' },
    { icon: LuClock, name: 'Recent', path: '/dashboard/recent' },
  ];

  return (
    <>
      {/* Overlay and mobile sidebar */}
      <div className={`md:hidden`}>
        <div
          className={`fixed inset-0 bg-black bg-opacity-40 z-30 transition-opacity duration-300 ${
            visible ? '' : 'pointer-events-none opacity-0'
          }`}
          onClick={onClose}
          aria-label="Sidebar overlay"
        />
        <aside
          className={`
            fixed z-40 top-0 left-0 h-full w-64 bg-google-gray-100 p-2 flex flex-col transition-transform duration-300
            ${visible ? 'translate-x-0' : '-translate-x-full'}
            md:hidden
          `}
          aria-label="Sidebar"
        >
          {/* Close button for mobile */}
          <div className="flex justify-end mb-2">
            <button onClick={onClose} className="p-2 rounded hover:bg-gray-200">
              <LuX className="w-6 h-6" />
            </button>
          </div>
          <div className="p-2 mb-4">
            <NewMenu />
          </div>
          <nav className="flex-1">
            <ul>
              {menuItems.map((item, index) => (
                <li key={index}>
                  <button
                    type="button"
                    onClick={() => {
                      navigate(item.path);
                      onClose();
                    }}
                    className={`flex items-center gap-4 px-4 py-2 rounded-full text-sm font-medium w-full text-left
                      ${
                        location.pathname === item.path
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <div className="p-4">
            <div className="text-sm text-gray-700">
              <p>3.7 GB of 15 GB used</p>
              <div className="w-full bg-gray-300 rounded-full h-1 mt-2">
                <div className="bg-blue-600 h-1 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
            <button className="w-full mt-4 text-sm border border-gray-400 rounded-full py-2 hover:bg-gray-200 text-gray-800">
              Get more storage
            </button>
          </div>
        </aside>
      </div>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:bg-google-gray-100 md:p-2 md:h-full">
        <div className="p-2 mb-4">
          <NewMenu />
        </div>
        <nav className="flex-1">
          <ul>
            {menuItems.map((item, index) => (
              <li key={index}>
                <button
                  type="button"
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-4 px-4 py-2 rounded-full text-sm font-medium w-full text-left
                    ${
                      location.pathname === item.path
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4">
          <div className="text-sm text-gray-700">
            <p>3.7 GB of 15 GB used</p>
            <div className="w-full bg-gray-300 rounded-full h-1 mt-2">
              <div className="bg-blue-600 h-1 rounded-full" style={{ width: '25%' }}></div>
            </div>
          </div>
          <button className="w-full mt-4 text-sm border border-gray-400 rounded-full py-2 hover:bg-gray-200 text-gray-800">
            Get more storage
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
