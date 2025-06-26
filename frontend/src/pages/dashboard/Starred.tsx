import React, { useEffect, useState } from 'react';
import EmptyStatePage from './EmptyStatePage';
import starredIllustration from '../../assets/drive-starred-illustration.png.png';
import { getFiles, toggleFileStarred, toggleFolderStarred, renameFile, renameFolder, deleteFile, deleteFolder } from '../../services/fileService';
import FileCard, { type FileCardProps } from '../../components/drive/FileCard';
import FileList from '../../components/drive/FileList';
import Sidebar from '../../components/layout/Sidebar';
import Header from '../../components/layout/Header';
import { LuList, LuLayoutGrid } from 'react-icons/lu';
import Modal from '../../components/ui/Modal';

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

const PreviewModal: React.FC<{ file: FileCardProps | null; onClose: () => void }> = ({ file, onClose }) => {
  if (!file) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full relative">
        <button className="absolute top-2 right-2 text-lg" onClick={onClose}>&times;</button>
        <h2 className="text-lg font-bold mb-4">{file.name}</h2>
        {file.type === 'image' && file.url && (
          <img src={file.url} alt={file.name} className="max-h-96 mx-auto" />
        )}
        {file.type === 'video' && file.url && (
          <video src={file.url} controls className="max-h-96 mx-auto w-full" />
        )}
        {file.type === 'pdf' && file.url && (
          <iframe src={file.url} title={file.name} className="w-full h-96" />
        )}
        {(!file.url || (file.type !== 'image' && file.type !== 'video' && file.type !== 'pdf')) && (
          <div className="text-center text-gray-500">Preview not available</div>
        )}
      </div>
    </div>
  );
};

const StarredPage: React.FC = () => {
  const [files, setFiles] = useState<FileCardWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [searchKey, setSearchKey] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileCardProps | null>(null);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [modalTarget, setModalTarget] = useState<FileCardWithId | null>(null);
  const [newName, setNewName] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchStarredFiles = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const data = await getFiles({ starred: true, limit: 20, searchKey }, token);
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
    fetchStarredFiles();
  }, [searchKey]);

  const handleFileClick = (file: FileCardProps) => {
    if (['image', 'video', 'pdf'].includes(file.type)) {
      setSelectedFile(file);
      setShowPreviewModal(true);
    }
    // Optionally handle other file types (download, etc)
  };

  const handleStar = async (item: FileCardWithId) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      if (item.type === 'folder') {
        await toggleFolderStarred(item._id!, token);
      } else {
        await toggleFileStarred(item._id!, token);
      }
      setFiles(prev => prev.map(f => f._id === item._id ? { ...f, isStarred: !f.isStarred } : f));
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
        onSearchSubmit={() => {}}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-6 bg-white overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Starred Files</h2>
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
              illustration={starredIllustration}
              title="No starred files"
              subtitle="Star important files to access them quickly."
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
                  onClick={() => handleFileClick(file)}
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
                onClick: () => handleFileClick(file),
                onStar: () => handleStar(file),
                onEdit: () => handleEdit(file),
                onDelete: () => handleDelete(file),
              }))}
            />
          )}
          <PreviewModal file={showPreviewModal ? selectedFile : null} onClose={() => setShowPreviewModal(false)} />
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

export default StarredPage;