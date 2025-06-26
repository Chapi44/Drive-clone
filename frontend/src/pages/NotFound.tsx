import React from 'react';
import { Link } from 'react-router-dom';
import driveLogo from '../assets/pngwing.com.png';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50">
      <img src={driveLogo} alt="Drive Logo" className="h-12 mb-4" />
      <h1 className="text-5xl font-bold text-blue-600 mb-2">404</h1>
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Page Not Found</h2>
      <p className="text-gray-500 mb-8 text-center max-w-md">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/dashboard"
        className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition"
      >
        Go to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
