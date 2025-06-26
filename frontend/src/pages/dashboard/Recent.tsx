import React, { useEffect, useState } from 'react';
import EmptyStatePage from './EmptyStatePage';
import recentIllustration from '../../assets/drive-recent-illustration.png';
import { getFiles } from '../../services/fileService';
import FileCard, { type FileCardProps } from '../../components/drive/FileCard';
import FileList from '../../components/drive/FileList';
import Sidebar from '../../components/layout/Sidebar'; // Add Sidebar
import Header from '../../components/layout/Header';   // Add Header
import { LuList, LuLayoutGrid } from 'react-icons/lu'; // For icons
import Modal from '../../components/ui/Modal';
import { toggleFileStarred, toggleFolderStarred, renameFile, renameFolder, deleteFile, deleteFolder } from '../../services/fileService';

interface FileApiResponse {
  _id: string;
  name: string;
  mimetype?: string;
  size?: number;
  updatedAt?: string;
  owner?: string;
  starred?: boolean;
  itemType: 'file' | 'folder';
  createdAt?: string;
  url?: string;
  parentFolder?: string | null;
}

type FileCardWithId = FileCardProps & { _id?: string };

const mapMimetypeToType = (mimetype?: string): FileCardProps['type'] => {
  if (!mimetype) return 'unknown';
  if (mimetype.includes('image')) return 'image';
  if (mimetype.includes('pdf')) return 'pdf';
  if (mimetype.includes('spreadsheet') || mimetype.includes('excel')) return 'spreadsheet';
  if (mimetype.includes('presentation')) return 'presentation';
  if (mimetype.includes('document') || mimetype.includes('word')) return 'document';
  if (mimetype.includes('video')) return 'video';
  return 'unknown';
};

const RecentPage: React.FC = () => {
  const [files, setFiles] = useState<FileCardWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [searchKey, setSearchKey] = useState('');
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [modalTarget, setModalTarget] = useState<FileCardWithId | null>(null);
  const [newName, setNewName] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRecentFiles = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const data = await getFiles({ recentDays: 7, searchKey }, token);
      const apiFiles: FileApiResponse[] = Array.isArray(data.data) ? data.data : [];
      const mappedFiles: FileCardWithId[] = apiFiles.map((item: FileApiResponse) => ({
        _id: item._id,
        name: item.name,
        type: item.itemType === 'folder' ? 'folder' : mapMimetypeToType(item.mimetype),
        size: item.size ? `${(item.size / 1024).toFixed(1)} KB` : 'N/A',
        lastModified: item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : '',
        owner: item.owner || 'me',
        isStarred: item.starred || false,
        createdAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '',
        url: item.url,
      }));
      setFiles(mappedFiles);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentFiles();
  }, [searchKey]);

  const handleStar = async (item: FileCardWithId) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      if (item.type === 'folder') {
        await toggleFolderStarred(item._id!, token);
      } else {
        await toggleFileStarred(item._id!, token);
      }
      const wasStarred = item.isStarred;
      setFiles(prev => prev.map(f => f._id === item._id ? { ...f, isStarred: !f.isStarred } : f));
      if (wasStarred) {
        fetchRecentFiles();
      }
    } catch {/* Optionally handle error */}
  };

  const handleEdit = (item: FileCardWithId) => {
    setModalTarget(item);
    setNewName(item.name);
    setRenameModalOpen(true);
  };

  const handleRename = async () => {
    if (!modalTarget) return;
    setActionLoading(true);
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      if (modalTarget.type === 'folder') {
        await renameFolder(modalTarget._id!, newName, token);
      } else {
        await renameFile(modalTarget._id!, newName, token);
      }
      setFiles(prev => prev.map(f => f._id === modalTarget._id ? { ...f, name: newName } : f));
      setRenameModalOpen(false);
      setModalTarget(null);
    } catch {/* Optionally handle error */}
    setActionLoading(false);
  };

  const handleDelete = (item: FileCardWithId) => {
    setModalTarget(item);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!modalTarget) return;
    setActionLoading(true);
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      if (modalTarget.type === 'folder') {
        await deleteFolder(modalTarget._id!, token);
      } else {
        await deleteFile(modalTarget._id!, token);
      }
      setFiles(prev => prev.filter(f => f._id !== modalTarget._id));
      setDeleteModalOpen(false);
      setModalTarget(null);
    } catch {/* Optionally handle error */}
    setActionLoading(false);
  };

  return (
    <div className="flex flex-col h-screen font-sans bg-white text-google-gray-900">
      <Header
        searchValue={searchKey}
        onSearchChange={setSearchKey}
        onSearchSubmit={() => {}} // Optionally implement search submit
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-6 bg-white overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Recent Files</h2>
            <div className="flex items-center border border-google-gray-300 rounded-full ml-2">
              <button
                onClick={() => setView('list')}
                className={`p-2 rounded-l-full ${view === 'list' ? 'bg-google-blue/20 text-google-blue' : 'hover:bg-google-gray-100'}`}
              >
                <LuList className="w-5 h-5" />
              </button>
              <button
                onClick={() => setView('grid')}
                className={`p-2 rounded-r-full ${view === 'grid' ? 'bg-google-blue/20 text-google-blue' : 'hover:bg-google-gray-100'}`}
              >
                <LuLayoutGrid className="w-5 h-5" />
              </button>
            </div>
          </div>
          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading...</div>
          ) : files.length === 0 ? (
            <EmptyStatePage
              illustration={recentIllustration}
              title="No recent files"
              subtitle="Your recently opened files will appear here."
            />
          ) : view === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
              {files.map((file) =>
                <FileCard
                  key={file._id || file.name}
                  name={file.name}
                  type={file.type}
                  size={file.size}
                  createdAt={file.createdAt}
                  url={file.url}
                  isStarred={file.isStarred}
                  lastModified={file.lastModified || file.createdAt || ''}
                  onStar={() => handleStar(file)}
                  onEdit={() => handleEdit(file)}
                  onDelete={() => handleDelete(file)}
                />
              )}
            </div>
          ) : (
            <FileList
              files={files.map((file) => ({
                ...file,
                isStarred: file.isStarred,
                onStar: () => handleStar(file),
                onEdit: () => handleEdit(file),
                onDelete: () => handleDelete(file),
              }))}
            />
          )}
          <Modal isOpen={renameModalOpen} onClose={() => setRenameModalOpen(false)}>
            <h2 className="text-lg font-semibold mb-4">Rename {modalTarget?.type}</h2>
            <input
              className="border rounded px-3 py-2 w-full mb-4"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              disabled={actionLoading}
            />
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setRenameModalOpen(false)} disabled={actionLoading}>Cancel</button>
              <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={handleRename} disabled={actionLoading || !newName.trim()}>
                {actionLoading ? 'Renaming...' : 'Rename'}
              </button>
            </div>
          </Modal>
          <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
            <h2 className="text-lg font-semibold mb-4">Delete {modalTarget?.type}</h2>
            <p>Are you sure you want to delete <b>{modalTarget?.name}</b>? This action cannot be undone.</p>
            <div className="flex justify-end gap-2 mt-4">
              <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setDeleteModalOpen(false)} disabled={actionLoading}>Cancel</button>
              <button className="px-4 py-2 rounded bg-red-600 text-white" onClick={confirmDelete} disabled={actionLoading}>
                {actionLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </Modal>
        </main>
      </div>
    </div>
  );
};

export default RecentPage;