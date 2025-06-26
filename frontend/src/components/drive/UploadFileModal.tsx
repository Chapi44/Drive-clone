import React from 'react';
import { useDropzone } from 'react-dropzone';
import { createFolderandFile } from '../../services/fileService';
import uploadIllustration from '../../assets/upload-illustration.png';

interface UploadEmptyStateUploadAreaProps {
  onUpload: () => void;
  parentFolder?: string;
} 

const UploadEmptyStateUploadArea: React.FC<UploadEmptyStateUploadAreaProps> = ({
  onUpload,
  parentFolder,
}) => {
  const [files, setFiles] = React.useState<File[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onDrop = React.useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 5) {
      setError('You can only upload up to 5 files at a time.');
      setFiles([]);
    } else {
      setError(null);
      setFiles(acceptedFiles);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const handleUpload = async () => {
    if (files.length > 5) {
      setError('You can only upload up to 5 files at a time.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Unauthorized');

      await createFolderandFile(
        {
          itemType: 'file',
          files,
          parentFolder,
          name: ''
        },
        token
      );

      setFiles([]);
      onUpload(); // refresh folder view
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-[60vh]">
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 mb-6 transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
        }`}
        style={{ minHeight: 320, minWidth: 400 }}
      >
        <input {...getInputProps()} />
        <img
          src={uploadIllustration}
          alt="Upload Illustration"
          className="w-48 h-48 mb-4"
        />
        <p className="text-xl font-medium mb-2">Drop files here</p>
        <p className="text-base text-gray-500 mb-2">
          or use the <span className="text-blue-600 font-medium underline cursor-pointer">'New'</span> button.
        </p>
        <button
          type="button"
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700"
          onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
          disabled={files.length >= 5}
        >
          Select files
        </button>
      </div>

      {files.length > 0 && (
        <div className="mb-4">
          <h3 className="font-medium mb-2">Selected files:</h3>
          <ul className="list-disc pl-6 text-sm">
            {files.map((file) => (
              <li key={file.name}>
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}

      {files.length > 0 && (
        <div className="flex justify-center gap-8">
          <button
            className="text-blue-600 font-medium hover:underline"
            onClick={() => setFiles([])}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="text-blue-600 font-medium hover:underline"
            onClick={handleUpload}
            disabled={files.length === 0 || loading || files.length > 5}
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      )}
    </div>
  );
};

export default UploadEmptyStateUploadArea;
