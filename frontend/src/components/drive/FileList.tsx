import React from 'react';
import FileListItem from './FileListItem';
import { type FileCardProps } from './FileCard';

interface FileListProps {
  files: FileCardProps[];
}

const FileList: React.FC<FileListProps> = ({ files }) => {
  if (files.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">This folder is empty.</p>
      </div>
    );
  }

  return (
    <table className="min-w-full divide-y divide-google-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Name
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Reason suggested
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Owner
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Location
          </th>
          <th scope="col" className="relative px-6 py-3">
            <span className="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {files.map((file, index) => (
          <FileListItem key={index} {...file} />
        ))}
      </tbody>
    </table>
  );
};

export default FileList; 