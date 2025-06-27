import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import FolderCard from '../../components/drive/FolderCard';
import FileCard from '../../components/drive/FileCard';
import FileList from '../../components/drive/FileList';
import UploadEmptyStateUploadArea from '../../components/drive/UploadFileModal';
import { getFilesInFolder, getFolderTree, type FileOrFolder, type FolderTreeNode } from '../../services/fileService';
import { LuList, LuLayoutGrid, LuInfo } from 'react-icons/lu';
import Modal from '../../components/ui/Modal';
import { toggleFileStarred, toggleFolderStarred, renameFile, renameFolder, deleteFile, deleteFolder } from '../../services/fileService';

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
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [previewFile, setPreviewFile] = useState<FileOrFolder | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<FileOrFolder[]>([]);
  const navigate = useNavigate();
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [modalTarget, setModalTarget] = useState<FileOrFolder | null>(null);
  const [newName, setNewName] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

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

  return (
    <div className="flex flex-col h-screen">
      <Header
        searchValue={searchKey}
        onSearchChange={setSearchKey}
        onSearchSubmit={fetchFiles}
      />
      <div className="flex flex-1">
        <Sidebar />
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
