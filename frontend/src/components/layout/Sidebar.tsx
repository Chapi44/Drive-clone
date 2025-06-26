import React from 'react';
import { 
  LuFolder,  LuStar, LuClock,  
} from 'react-icons/lu';
import NewMenu from '../../components/drive/NewMenu';
import { useLocation, useNavigate } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const menuItems = [
    { icon: LuFolder, name: 'Home', path: '/dashboard' },
    { icon: LuStar, name: 'Starred', path: '/dashboard/starred' },
    { icon: LuClock, name: 'Recent', path: '/dashboard/recent' },


  ];

  return (
    <aside className="w-64 bg-google-gray-100 p-2 flex flex-col">
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
                ${location.pathname === item.path
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
  );
};

export default Sidebar;
