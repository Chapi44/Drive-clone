import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {  LuFile, LuX } from 'react-icons/lu';

const UploadForm: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.png', '.gif', '.svg'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
    },
  });

  const removeFile = (fileToRemove: File) => {
    setFiles(prevFiles => prevFiles.filter(file => file !== fileToRemove));
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Upload Files</h2>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors duration-300
        ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'}`}
      >
        <input {...getInputProps()} />
        {/* <LuUploadCloud className="mx-auto h-12 w-12 text-gray-400" /> */}
        {isDragActive ? (
          <p className="mt-2 text-blue-600">Drop the files here ...</p>
        ) : (
          <p className="mt-2 text-gray-600 dark:text-gray-300">Drag & drop files here, or click to select files</p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Supports: Images, PDF, TXT</p>
      </div>
      {files.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-gray-700 dark:text-gray-200">Selected files:</h3>
          <ul className="mt-2 space-y-2">
            {files.map((file, i) => (
              <li key={i} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded-md">
                <div className="flex items-center gap-3">
                  <LuFile className="w-5 h-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{file.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">({(file.size / 1024).toFixed(2)} KB)</span>
                </div>
                <button onClick={() => removeFile(file)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                  <LuX className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => console.log('Uploading files:', files)}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-300 disabled:bg-gray-400"
              disabled={files.length === 0}
            >
              Upload
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadForm;
