const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface CreateFolderPayload {
  name: string;
  parentFolder?: string;
}

export interface FolderResponse {
  name: string;
  owner: string;
  parentFolder?: string;
  starred: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  _id: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}


export interface FileOrFolder {
  _id: string;
  name: string;
  owner: string;
  parentFolder?: string;
  starred: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
  itemType: 'file' | 'folder';
  url?: string;
  mimetype?: string;
  size?: number;
}

export interface FolderContentResponse {
  data: FileOrFolder[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export async function createFolderandFile(
  payload: CreateFolderPayload & { itemType: 'folder' | 'file'; files?: File[] },
  token: string
): Promise<FolderResponse> {
  const { itemType, parentFolder, name, files } = payload;

  let response: Response;

  if (itemType === 'folder') {
    // Folder creation (JSON)
    response = await fetch(`${BASE_URL}/files/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        itemType: 'folder',
        ...(parentFolder && { parentFolder }),
      }),
    });
  } else if (itemType === 'file') {
    // File upload (FormData)
    if (!files || files.length === 0) {
      throw new Error('No files provided for upload');
    }

    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('itemType', 'file');
    if (parentFolder) formData.append('parentFolder', parentFolder);

    response = await fetch(`${BASE_URL}/files/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  } else {
    throw new Error('Invalid itemType');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to upload');
  }

  return response.json();
}


export interface GetFilesQuery {
  mimetypes?: string;
  page?: number;
  limit?: number;
  starred?: boolean;
  parentFolder?: string;
  searchKey?: string;
  recentDays?: number;
  itemType?: 'file' | 'folder'; 
}


export async function getFiles(query: GetFilesQuery, token: string) {
  const params = new URLSearchParams();
  if (query.mimetypes) params.append('mimetypes', query.mimetypes);
  if (query.page) params.append('page', String(query.page));
  if (query.limit) params.append('limit', String(query.limit));
  if (query.starred !== undefined) params.append('starred', String(query.starred));
  if (query.parentFolder) params.append('parentFolder', query.parentFolder);
  if (query.searchKey) params.append('searchKey', query.searchKey);

  const response = await fetch(`${BASE_URL}/files/items?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch files');
  }
  return response.json();
}

export async function uploadFiles(files: File[], parentFolder: string | undefined, token: string) {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  if (parentFolder) formData.append('parentFolder', parentFolder);

  const response = await fetch(`${BASE_URL}/files/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to upload files');
  }
  return response.json();
}


export async function getFilesInFolder(folderId: string, token: string): Promise<FolderContentResponse> {
  const response = await fetch(`${BASE_URL}/files/folder/${folderId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch files in folder');
  }

  return response.json();
}

export interface FolderTreeNode {
  _id: string;
  name: string;
  owner: string;
  parentFolder: string;
  starred: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  itemType: 'folder';
  children: FolderTreeNode[];
}
export interface RenamePayload {
  name: string;
}
export interface FileOrFolder {
  _id: string;
  name: string;
  owner: string;
  parentFolder?: string;
  starred: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  __v: number;
  itemType: 'file' | 'folder';
  url?: string;
  mimetype?: string;
  size?: number;
}
export async function getFolderTree(parentId: string, token: string): Promise<FolderTreeNode[]> {
  const response = await fetch(`${BASE_URL}/files/folders/tree/${parentId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch folder tree');
  }

  return response.json();
}


export async function renameFile(fileId: string, newName: string, token: string): Promise<any> {
  const response = await fetch(`${BASE_URL}/files/${fileId}/rename`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name: newName }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to rename file');
  }

  return response.json();
}


export async function renameFolder(folderId: string, newName: string, token: string): Promise<any> {
  const response = await fetch(`${BASE_URL}/folders/rename/${folderId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name: newName }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to rename folder');
  }

  return response.json();
}


export async function toggleFolderStarred(folderId: string, token: string): Promise<any> {
  const response = await fetch(`${BASE_URL}/folders/${folderId}/starred`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to toggle starred status');
  }

  return response.json();
}


export async function toggleFileStarred(fileId: string, token: string): Promise<any> {
  const response = await fetch(`${BASE_URL}/files/${fileId}/starred`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to toggle file starred status');
  }

  return response.json();
}



// Delete a folder by ID
export async function deleteFolder(folderId: string, token: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/folders/delete/${folderId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to delete folder');
  }
}

// Delete a file by ID
export async function deleteFile(fileId: string, token: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/files/delete/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to delete file');
  }
}
