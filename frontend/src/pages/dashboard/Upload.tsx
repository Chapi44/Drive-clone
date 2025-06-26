import React from 'react';
import UploadForm from '../../components/forms/UploadForm';

const UploadPage: React.FC = () => {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Upload Files
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Add new files to your drive.
          </p>
        </header>
        <main>
          <UploadForm />
        </main>
      </div>
    </div>
  );
};

export default UploadPage;
