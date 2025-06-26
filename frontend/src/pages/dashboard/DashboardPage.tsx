import React, { useState, useEffect, useRef } from 'react';
import { LuChevronDown, LuList, LuLayoutGrid, LuInfo, LuFolder } from 'react-icons/lu';
import Header from '../../components/layout/Header';
import Sidebar from '../../components/layout/Sidebar';
import FileList from '../../components/drive/FileList';
import FolderCard from '../../components/drive/FolderCard';
import FileCard, { type FileCardProps } from '../../components/drive/FileCard';
import { getFiles, toggleFileStarred, toggleFolderStarred, renameFile, renameFolder, deleteFile, deleteFolder } from '../../services/fileService';
import UploadEmptyStateUploadArea from '../../components/drive/UploadFileModal';
import { useNavigate } from 'react-router-dom';

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

const RenameModal: React.FC<{
  isOpen: boolean;
  initialName: string;
  onClose: () => void;
  onSubmit: (newName: string) => void;
}> = ({ isOpen, initialName, onClose, onSubmit }) => {
  const [name, setName] = useState(initialName);
  useEffect(() => { setName(initialName); }, [initialName, isOpen]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl p-6 min-w-[320px] w-full max-w-sm relative">
        <button className="absolute top-2 right-2 text-lg" onClick={onClose}>&times;</button>
        <h2 className="text-lg font-bold mb-4">Rename</h2>
        <input
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 rounded bg-gray-100 text-gray-700" onClick={onClose}>Cancel</button>
          <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={() => onSubmit(name)}>OK</button>
        </div>
      </div>
    </div>
  );
};

const DeleteModal: React.FC<{
  isOpen: boolean;
  name: string;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ isOpen, name, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl p-6 min-w-[320px] w-full max-w-sm relative">
        <button className="absolute top-2 right-2 text-lg" onClick={onClose}>&times;</button>
        <h2 className="text-lg font-bold mb-4">Delete</h2>
        <p className="mb-4">Are you sure you want to delete <span className="font-semibold">{name}</span>?</p>
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 rounded bg-gray-100 text-gray-700" onClick={onClose}>Cancel</button>
          <button className="px-4 py-2 rounded bg-red-600 text-white" onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
};

const DashboardPage: React.FC = () => {
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [files, setFiles] = useState<FileCardWithId[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [currentFolderId] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileCardProps | null>(null);
  const [searchKey, setSearchKey] = useState('');
  const searchDebounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [recentFolders, setRecentFolders] = useState<FileApiResponse[]>([]);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<{ id: string; type: 'file' | 'folder'; name: string } | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: 'file' | 'folder'; name: string } | null>(null);
  const [fetchedAll, setFetchedAll] = useState(false);

  const fetchFiles = async (parentFolder?: string | null, limit?: number, search?: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No auth token');
      const query: { parentFolder?: string; limit?: number; searchKey?: string } = {};
      if (parentFolder) query.parentFolder = parentFolder;
      if (limit) query.limit = limit;
      if (search) query.searchKey = search;
      const data = await getFiles(query, token);
      const apiFiles: FileApiResponse[] = Array.isArray(data.data) ? data.data : [];
      setTotal(data.total || null);
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
    } catch (err) {
      if (err instanceof Error) setError(err.message);
      else setError('Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles(undefined, 10);
    setFetchedAll(false);
  }, []);

  useEffect(() => {
    // Debounce search
    if (searchDebounceTimeout.current) clearTimeout(searchDebounceTimeout.current);
    searchDebounceTimeout.current = setTimeout(() => {
      fetchFiles(currentFolderId, undefined, searchKey);
    }, 300);
    return () => {
      if (searchDebounceTimeout.current) clearTimeout(searchDebounceTimeout.current);
    };
  }, [searchKey, currentFolderId]);

    useEffect(() => {
    const fetchRecentFolders = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        // Pass recentDays, itemType, and limit for recent folders
        const data = await getFiles(
          { recentDays: 7, itemType: 'folder', limit: 2 },
          token
        );
        const folders = (Array.isArray(data.data) ? data.data : []).filter(
          (item: FileApiResponse) => item.itemType === 'folder'
        );
        setRecentFolders(folders);
      } catch {
        setRecentFolders([]);
      }
    };
    fetchRecentFolders();
  }, []);

const handleFolderClick = (folderId: string) => {
  navigate(`/dashboard/folder/${folderId}`);
};

const handleFileClick = (file: FileCardProps) => {
  if (['image', 'video', 'pdf'].includes(file.type)) {
    setSelectedFile(file);
    setShowPreviewModal(true);
  } else {
    // Optionally handle other file types (download, etc)
  }
};

// const handleDeleteFile = (fileId: string) => {
//   setFiles(prevFiles => prevFiles.filter(f => f._id !== fileId));
// };

const handleToggleStar = async (itemId: string, itemType: 'file' | 'folder', isStarred: boolean) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No auth token');
    if (itemType === 'file') {
      await toggleFileStarred(itemId, token);
    } else {
      await toggleFolderStarred(itemId, token);
    }
    setFiles(prev =>
      prev.map(f =>
        f._id === itemId ? { ...f, isStarred: !isStarred } : f
      )
    );
    setRecentFolders(prev =>
      prev.map(f =>
        f._id === itemId ? { ...f, starred: !isStarred } : f
      )
    );
  } catch {
    // Optionally show error
  }
};

const handleEdit = (id: string, type: 'file' | 'folder', name: string) => {
  setRenameTarget({ id, type, name });
  setRenameModalOpen(true);
};

const handleRename = async (newName: string) => {
  if (!renameTarget) return;
  const token = localStorage.getItem('token');
  if (!token) return;
  try {
    if (renameTarget.type === 'file') {
      await renameFile(renameTarget.id, newName, token);
    } else {
      await renameFolder(renameTarget.id, newName, token);
    }
    setFiles(prev => prev.map(f => f._id === renameTarget.id ? { ...f, name: newName } : f));
    setRecentFolders(prev => prev.map(f => f._id === renameTarget.id ? { ...f, name: newName } : f));
  } catch {
    // Optionally show error
  }
  setRenameModalOpen(false);
  setRenameTarget(null);
};

const handleDelete = (id: string, type: 'file' | 'folder', name: string) => {
  setDeleteTarget({ id, type, name });
  setDeleteModalOpen(true);
};

const handleDeleteConfirm = async () => {
  if (!deleteTarget) return;
  const token = localStorage.getItem('token');
  if (!token) return;
  try {
    if (deleteTarget.type === 'file') {
      await deleteFile(deleteTarget.id, token);
    } else {
      await deleteFolder(deleteTarget.id, token);
    }
    setFiles(prev => prev.filter(f => f._id !== deleteTarget.id));
    setRecentFolders(prev => prev.filter(f => f._id !== deleteTarget.id));
  } catch {
    // Optionally show error
  }
  setDeleteModalOpen(false);
  setDeleteTarget(null);
};

const navigate = useNavigate();




  return (
    <div className="flex flex-col h-screen font-sans bg-white text-google-gray-900">
      <Header
        searchValue={searchKey}
        onSearchChange={setSearchKey}
        onSearchSubmit={() => fetchFiles(currentFolderId, undefined, searchKey)}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 p-6 bg-white overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <button className="flex items-center gap-2 text-xl text-google-gray-800 font-medium p-2 rounded-md hover:bg-google-gray-100">
              <span>My Drive</span>
              <LuChevronDown className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
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
              <button className="p-2 rounded-full hover:bg-google-gray-100">
                <LuInfo className="w-5 h-5 text-google-gray-700" />
              </button>
            </div>
          </div>

        <section>
        <h2 className="text-sm font-medium text-google-gray-600 mb-4">Recent Folders</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 mb-8">
          {recentFolders.length === 0 ? (
            <div className="text-gray-400 col-span-2">No recent folders</div>
          ) : (
            recentFolders.map(folder => (
              <div
                key={folder._id}
                className="bg-google-gray-100 hover:bg-google-gray-200 rounded-2xl p-4 transition-colors duration-200 cursor-pointer flex items-center gap-3"
                onClick={() => handleFolderClick(folder._id)}
              >
                <LuFolder className="w-6 h-6 text-google-gray-800" />
                <span className="font-medium text-google-gray-900">{folder.name}</span>
              </div>
            ))
          )}
        </div>
      </section>

          <section className="mt-8">
            {loading ? (
              view === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-gray-200 animate-pulse rounded-2xl p-4 h-32" />
                  ))}
                </div>
              ) : (
                <div>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border-b animate-pulse">
                      <div className="w-8 h-8 bg-gray-200 rounded" />
                      <div className="flex-1 h-4 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
              )
            ) : error ? (
              <div className="text-center py-10 text-red-500">{error}</div>
            ) : (
              <>
                {files.length === 0 && currentFolderId ? (
                  <UploadEmptyStateUploadArea
                    onUpload={() => fetchFiles(currentFolderId)}
                    parentFolder={currentFolderId || undefined}
                  />
                ) : (
                  <>
                    {view === 'grid' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                        {files.map((file) =>
                          file.type === 'folder' ? (
                            <FolderCard
                              key={file._id || file.name}
                              name={file.name}
                              itemCount={0}
                              isStarred={file.isStarred}
                              onClick={() => handleFolderClick(file._id || file.name)}
                              onStar={() => handleToggleStar(file._id || '', 'folder', !!file.isStarred)}
                              onEdit={() => handleEdit(file._id || '', 'folder', file.name)}
                              onDelete={() => handleDelete(file._id || '', 'folder', file.name)}
                            />
                          ) : (
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
                              onDelete={() => handleDelete(file._id || '', 'file', file.name)}
                              onStar={() => handleToggleStar(file._id || '', 'file', !!file.isStarred)}
                              onEdit={() => handleEdit(file._id || '', 'file', file.name)}
                            />
                          )
                        )}
                      </div>
                    ) : (
                      <FileList
                        files={files.map((file) => ({
                          ...file,
                          onClick: file.type === 'folder'
                            ? () => handleFolderClick(file._id || file.name)
                            : () => handleFileClick(file),
                          onStar: () => handleToggleStar(file._id || '', file.type === 'folder' ? 'folder' : 'file', !!file.isStarred),
                          onEdit: () => handleEdit(file._id || '', file.type === 'folder' ? 'folder' : 'file', file.name),
                          onDelete: () => handleDelete(file._id || '', file.type === 'folder' ? 'folder' : 'file', file.name),
                        }))}
                      />
                    )}
                    {!loading && total !== null && files.length < total && !fetchedAll && (
                      <div className="flex justify-start mt-6">
                        <button
                          className="text-blue-600 font-large hover:underline text-sm"
                          onClick={async () => {
                            setLoading(true);
                            setError(null);
                            try {
                              const token = localStorage.getItem('token');
                              if (!token) throw new Error('No auth token');
                              // Fetch all files (no limit)
                              const data = await getFiles(currentFolderId ? { parentFolder: currentFolderId } : {}, token);
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
                              setFetchedAll(true);
                            } catch (err) {
                              if (err instanceof Error) setError(err.message);
                              else setError('Failed to fetch files');
                            } finally {
                              setLoading(false);
                            }
                          }}
                        >
                          View more
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </section>
          <PreviewModal file={showPreviewModal ? selectedFile : null} onClose={() => setShowPreviewModal(false)} />
          <RenameModal
            isOpen={renameModalOpen}
            initialName={renameTarget?.name || ''}
            onClose={() => { setRenameModalOpen(false); setRenameTarget(null); }}
            onSubmit={handleRename}
          />
          <DeleteModal
            isOpen={deleteModalOpen}
            name={deleteTarget?.name || ''}
            onClose={() => { setDeleteModalOpen(false); setDeleteTarget(null); }}
            onConfirm={handleDeleteConfirm}
          />
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
