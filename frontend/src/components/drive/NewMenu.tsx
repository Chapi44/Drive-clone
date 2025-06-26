import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { HiOutlineFolderPlus, HiOutlineArrowUpTray } from 'react-icons/hi2';
import { LuPlus } from 'react-icons/lu';
import Modal from '../ui/Modal';
import { createFolderandFile } from '../../services/fileService';

const NewMenu: React.FC = () => {
  const location = useLocation();
  const params = useParams<{ folderId: string }>();
  const parentFolder = location.pathname.startsWith('/dashboard/folder/') ? params.folderId : undefined;

  const [open, setOpen] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folderName, setFolderName] = useState('Untitled folder');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreateFolder = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token is missing');

      const payload = {
        name: folderName,
        itemType: 'folder' as const,
        ...(parentFolder && { parentFolder }),
      };

      await createFolderandFile(payload, token);
      setShowFolderModal(false);
      setFolderName('Untitled folder');

      // 🔄 Refresh the current page after creating a folder
      window.location.reload();
    } catch (err: unknown) {
      if (typeof err === 'object' && err && 'message' in err) {
        setError((err as { message?: string }).message || 'Failed to create folder');
      } else {
        setError('Failed to create folder');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token is missing');
      return;
    }

    try {
      const fileArray = Array.from(files);
      const payload = {
        name: fileArray[0]?.name || '',
        itemType: 'file' as const,
        files: fileArray,
        ...(parentFolder && { parentFolder }),
      };

      await createFolderandFile(payload, token);

      // 🔄 Refresh the current page after file upload
      window.location.reload();
    } catch (err: unknown) {
      if (typeof err === 'object' && err && 'message' in err) {
        setError((err as { message?: string }).message || 'File upload failed');
      } else {
        setError('File upload failed');
      }
    }
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium shadow hover:bg-blue-700 focus:outline-none"
        onClick={() => setOpen(!open)}
      >
        <LuPlus className="w-6 h-6" />
        <span>New</span>
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-64 bg-white border rounded shadow-lg z-50">
          <div
            className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => {
              setOpen(false);
              setShowFolderModal(true);
            }}
          >
            <div className="flex items-center gap-2">
              <HiOutlineFolderPlus className="w-5 h-5" />
              <span>New folder</span>
            </div>
            <span className="text-xs text-gray-400">Alt+C then F</span>
          </div>
          <div
            className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex items-center gap-2">
              <HiOutlineArrowUpTray className="w-5 h-5" />
              <span>File upload</span>
            </div>
            <span className="text-xs text-gray-400">Alt+C then U</span>
          </div>
        </div>
      )}

      <input
        type="file"
        multiple
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileUpload}
      />

      <Modal isOpen={showFolderModal} onClose={() => setShowFolderModal(false)}>
        <h2 className="text-2xl font-normal mb-6">New folder</h2>
        <input
          className="w-full border-2 border-blue-400 rounded-lg px-4 py-3 text-lg outline-none mb-8"
          value={folderName}
          autoFocus
          onChange={(e) => setFolderName(e.target.value)}
        />
        {error && <div className="text-red-500 mb-4 text-sm">{error}</div>}
        <div className="flex justify-end gap-8">
          <button
            className="text-blue-600 font-medium hover:underline"
            onClick={() => setShowFolderModal(false)}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="text-blue-600 font-medium hover:underline"
            onClick={handleCreateFolder}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default NewMenu;
