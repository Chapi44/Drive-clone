import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import FolderCard from '../../components/drive/FolderCard';
import FileCard from '../../components/drive/FileCard';
import FileList from '../../components/drive/FileList';
import UploadEmptyStateUploadArea from '../../components/drive/UploadFileModal';
import { getFilesInFolder, getFolderTree, type FileOrFolder, type FolderTreeNode } from '../../services/fileService';
import { LuList, LuLayoutGrid, LuInfo, LuMenu, LuSearch, LuSlidersHorizontal } from 'react-icons/lu';
import Modal from '../../components/ui/Modal';
import { toggleFileStarred, toggleFolderStarred, renameFile, renameFolder, deleteFile, deleteFolder } from '../../services/fileService';
import DriveLogo from '../../assets/pngwing.com.png';
import ProfileMenu from '../../components/ui/ProfileMenu';
import { getMe } from '../../services/authService';

interface UserData {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
}

const mapMimetypeToType = (mimetype?: string) => {
  if (!mimetype) return 'unknown';
  if (mimetype.includes('image')) return 'image';
  if (mimetype.includes('pdf')) return 'pdf';
  if (mimetype.includes('spreadsheet')) return 'spreadsheet';
  if (mimetype.includes('presentation')) return 'presentation';
  if (mimetype.includes('document') || mimetype.includes('word')) return 'document';
  if (mimetype.includes('video')) return 'video';
  return 'unknown';
};

const PreviewModal: React.FC<{ file: FileOrFolder | null; onClose: () => void }> = ({ file, onClose }) => {
  if (!file) return null;
  const type = mapMimetypeToType(file.mimetype);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl max-w-2xl w-full relative">
        <button className="absolute top-2 right-4 text-xl" onClick={onClose}>&times;</button>
        <h2 className="text-lg font-semibold mb-4">{file.name}</h2>
        {type === 'image' && file.url && <img src={file.url} alt={file.name} className="max-h-96 mx-auto" />}
        {type === 'video' && file.url && <video src={file.url} controls className="max-h-96 mx-auto w-full" />}
        {type === 'pdf' && file.url && <iframe src={file.url} title={file.name} className="w-full h-96" />}
        {(!file.url || !['image', 'video', 'pdf'].includes(type)) && (
          <div className="text-center text-gray-500">Preview not available</div>
        )}
      </div>
    </div>
  );
};

const FolderView: React.FC = () => {
  const { folderId } = useParams<{ folderId: string }>();
  const [files, setFiles] = useState<FileOrFolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchKey, setSearchKey] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [previewFile, setPreviewFile] = useState<FileOrFolder | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<FileOrFolder[]>([]);
  const navigate = useNavigate();
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [modalTarget, setModalTarget] = useState<FileOrFolder | null>(null);
  const [newName, setNewName] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);

  const fetchFiles = async () => {
    if (!folderId) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      const data = await getFilesInFolder(folderId, token);
      setFiles(data.data || []);
    } catch (err: unknown) {
      if (typeof err === 'object' && err && 'message' in err) {
        setError((err as { message?: string }).message || 'Failed to fetch folder content');
      } else {
        setError('Failed to fetch folder content');
      }
    } finally {
      setLoading(false);
    }
  };

  const buildBreadcrumb = async () => {
    if (!folderId) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const tree = await getFolderTree(folderId, token);
      setBreadcrumb([
        {
          _id: 'root', name: 'Drive',
          owner: '',
          starred: false,
          isDeleted: false,
          deletedAt: null,
          createdAt: '',
          updatedAt: '',
          __v: 0,
          itemType: 'file',
        },
        ...((tree as FolderTreeNode[]).map((node) => ({ ...node, itemType: 'folder', __v: 0 }) as FileOrFolder)),
      ]);
    } catch {
      setBreadcrumb([{
          _id: 'root', name: 'Drive',
          owner: '',
          starred: false,
          isDeleted: false,
          deletedAt: null,
          createdAt: '',
          updatedAt: '',
          __v: 0,
          itemType: 'file'
      }]);
    }
  };

  useEffect(() => {
    fetchFiles();
    buildBreadcrumb();
    const token = localStorage.getItem('token');
    if (!token) return;
    getMe(token)
      .then(data => setUser(data))
      .catch(() => setUser(null));
    // eslint-disable-next-line
  }, [folderId]);

  const handleFileClick = (file: FileOrFolder) => {
    const type = mapMimetypeToType(file.mimetype);
    if (['image', 'video', 'pdf'].includes(type)) {
      setPreviewFile(file);
    } else {
      if (file.url) window.open(file.url, '_blank');
    }
  };

  const handleStar = async (item: FileOrFolder) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      if (item.itemType === 'folder') {
        await toggleFolderStarred(item._id, token);
      } else {
        await toggleFileStarred(item._id, token);
      }
      setFiles((prev) => prev.map(f => f._id === item._id ? { ...f, starred: !f.starred } : f));
    } catch { /* Optionally show error */ }
  };

  const handleEdit = (item: FileOrFolder) => {
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
      if (modalTarget.itemType === 'folder') {
        await renameFolder(modalTarget._id, newName, token);
      } else {
        await renameFile(modalTarget._id, newName, token);
      }
      setFiles((prev) => prev.map(f => f._id === modalTarget._id ? { ...f, name: newName } : f));
      setRenameModalOpen(false);
      setModalTarget(null);
    } catch { /* Optionally show error */ }
    setActionLoading(false);
  };

  const handleDelete = (item: FileOrFolder) => {
    setModalTarget(item);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!modalTarget) return;
    setActionLoading(true);
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      if (modalTarget.itemType === 'folder') {
        await deleteFolder(modalTarget._id, token);
      } else {
        await deleteFile(modalTarget._id, token);
      }
      setFiles((prev) => prev.filter(f => f._id !== modalTarget._id));
      setDeleteModalOpen(false);
      setModalTarget(null);
    } catch { /* Optionally show error */ }
    setActionLoading(false);
  };

  const avatarLetter = user?.firstName ? user.firstName[0].toUpperCase() : '?';
  const userEmail = user?.email || '';

  return (
    <div className="flex flex-col h-screen">
      {/* Mobile header: burger + Drive logo/text + search + profile */}
      <div className="relative">
        <div className="sm:hidden flex flex-col gap-1 px-2 py-2 bg-white border-b border-gray-100">
          <div className="flex items-center gap-2">
            <button
              className="p-2 bg-white border border-gray-300 rounded-lg shadow hover:bg-gray-100 transition"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <LuMenu className="w-5 h-5" />
            </button>
            <img src={DriveLogo} alt="Drive Logo" className="w-8 h-8" />
            <span className="text-google-gray-800 text-2xl font-light">Drive</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="relative flex-1">
              <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-google-gray-700 cursor-pointer" onClick={fetchFiles} />
              <input
                type="text"
                placeholder="Search in Drive"
                className="w-full bg-google-gray-200/75 rounded-full py-2 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-google-blue focus:bg-white text-sm"
                value={searchKey}
                onChange={e => setSearchKey(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') fetchFiles();
                }}
              />
              <LuSlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-google-gray-700" />
            </div>
            <button
              onClick={() => setIsProfileMenuOpen(prev => !prev)}
              className="p-2 rounded-full bg-google-gray-500 text-white w-9 h-9 flex items-center justify-center"
              title={userEmail}
            >
              <span className="text-md font-bold">{avatarLetter}</span>
            </button>
          </div>
          <ProfileMenu 
            isOpen={isProfileMenuOpen}
            onClose={() => setIsProfileMenuOpen(false)}
          />
        </div>
        {/* Desktop header */}
        <div className="hidden sm:block">
          <Header
            searchValue={searchKey}
            onSearchChange={setSearchKey}
            onSearchSubmit={fetchFiles}
          />
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden relative">
        {/* Burger menu button for mobile */}

        {/* Sidebar (responsive) */}
        <Sidebar visible={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        {/* Main content, flush with sidebar (no margin on desktop!) */}
        <main className="flex-1 p-6 bg-white overflow-y-auto">
          <div className="text-sm text-gray-500 mb-2 flex items-center gap-1">
            {breadcrumb.map((item, idx) => (
              <div key={item._id} className="flex items-center">
                {idx !== 0 && <span className="mx-1">/</span>}
                <span
                  className="cursor-pointer hover:underline"
                  onClick={() => {
                    if (item._id === 'root') navigate('/dashboard');
                    else navigate(`/dashboard/folder/${item._id}`);
                  }}
                >
                  {item.name}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-semibold">Folder Contents</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setView('list')}
                className={`p-2 rounded-full ${view === 'list' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              >
                <LuList className="w-5 h-5" />
              </button>
              <button
                onClick={() => setView('grid')}
                className={`p-2 rounded-full ${view === 'grid' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              >
                <LuLayoutGrid className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <LuInfo className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : files.length === 0 ? (
            <UploadEmptyStateUploadArea
              parentFolder={folderId!}
              onUpload={fetchFiles}
            />
          ) : view === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {files.map((item) =>
                item.itemType === 'folder' ? (
                  <FolderCard
                    key={item._id}
                    name={item.name}
                    itemCount={0}
                    isStarred={item.starred}
                    onClick={() => navigate(`/dashboard/folder/${item._id}`)}
                    onStar={() => handleStar(item)}
                    onEdit={() => handleEdit(item)}
                    onDelete={() => handleDelete(item)}
                  />
                ) : (
                  <FileCard
                    key={item._id}
                    name={item.name}
                    type={mapMimetypeToType(item.mimetype)}
                    size={item.size ? `${(item.size / 1024).toFixed(1)} KB` : 'N/A'}
                    createdAt={new Date(item.createdAt).toLocaleDateString()}
                    url={item.url}
                    isStarred={item.starred}
                    lastModified={new Date(item.updatedAt).toLocaleDateString()}
                    onClick={() => handleFileClick(item)}
                    onStar={() => handleStar(item)}
                    onEdit={() => handleEdit(item)}
                    onDelete={() => handleDelete(item)}
                  />
                )
              )}
            </div>
          ) : (
            <FileList
              files={files.map((item) => ({
                _id: item._id,
                name: item.name,
                type: item.itemType === 'folder' ? 'folder' : mapMimetypeToType(item.mimetype),
                size: item.size ? `${(item.size / 1024).toFixed(1)} KB` : 'N/A',
                createdAt: new Date(item.createdAt).toLocaleDateString(),
                lastModified: new Date(item.updatedAt).toLocaleDateString(),
                isStarred: item.starred,
                url: item.url,
                onClick: item.itemType === 'folder'
                  ? () => navigate(`/dashboard/folder/${item._id}`)
                  : () => handleFileClick(item),
                onStar: () => handleStar(item),
                onEdit: () => handleEdit(item),
                onDelete: () => handleDelete(item),
              }))}
            />
          )}
        </main>
      </div>
      <PreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
      <Modal isOpen={renameModalOpen} onClose={() => setRenameModalOpen(false)}>
        <h2 className="text-lg font-semibold mb-4">Rename {modalTarget?.itemType}</h2>
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
        <h2 className="text-lg font-semibold mb-4">Delete {modalTarget?.itemType}</h2>
        <p>Are you sure you want to delete <b>{modalTarget?.name}</b>? This action cannot be undone.</p>
        <div className="flex justify-end gap-2 mt-4">
          <button className="px-4 py-2 rounded bg-gray-200" onClick={() => setDeleteModalOpen(false)} disabled={actionLoading}>Cancel</button>
          <button className="px-4 py-2 rounded bg-red-600 text-white" onClick={confirmDelete} disabled={actionLoading}>
            {actionLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default FolderView;
