import React from 'react';
import { 
  LuStar, LuPencil,
  LuFile, LuFileText, LuFileSpreadsheet, LuFileVideo, LuImage, LuFolder, LuUser, LuTrash2
} from 'react-icons/lu';
import { type FileCardProps, type FileType } from './FileCard';

const getFileIcon = (type: FileType) => {
  switch (type) {
    case 'folder': return <LuFolder className="w-5 h-5 text-google-gray-800" />;
    case 'pdf': return <LuFileText className="w-5 h-5 text-red-500" />;
    case 'document': return <LuFileText className="w-5 h-5 text-blue-500" />;
    case 'spreadsheet': return <LuFileSpreadsheet className="w-5 h-5 text-green-500" />;
    case 'presentation': return <LuFileText className="w-5 h-5 text-yellow-600" />;
    case 'video': return <LuFileVideo className="w-5 h-5 text-red-700" />;
    case 'image': return <LuImage className="w-5 h-5 text-purple-500" />;
    default: return <LuFile className="w-5 h-5 text-google-gray-800" />;
  }
};

interface FileListItemProps extends FileCardProps {
  createdAt?: string;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const FileListItem: React.FC<FileListItemProps> = ({
  name,
  type,
  isStarred,
  onStar,
  createdAt,
  onClick,
  onEdit,
  onDelete,
}) => {
  return (
    <tr className="group border-b border-google-gray-200 hover:bg-google-gray-100 cursor-pointer" onClick={onClick}>
      <td className="px-6 py-2 text-sm font-medium text-gray-900 flex items-center gap-3">
        {getFileIcon(type)}
        <span>{name}</span>
      </td>
      <td className="px-6 py-2 text-sm text-gray-600">
        {`You created${createdAt ? ' ' + createdAt : ''}`}
      </td>
      <td className="px-6 py-2 text-sm text-gray-600 flex items-center gap-2">
        <LuUser className="w-5 h-5 text-gray-500" />
        <span>me</span>
      </td>
      <td className="px-6 py-2 text-sm text-gray-600">My Drive</td>
      <td className="px-6 py-2 text-right">
        <div className="flex items-center justify-end gap-1">
            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={e => { e.stopPropagation(); void (onStar && onStar()); }} className="p-2 rounded-full hover:bg-gray-200">
                    <LuStar className={`w-5 h-5 ${isStarred ? 'text-yellow-500 fill-current' : 'text-gray-600'}`} />
                </button>
                <button onClick={e => { e.stopPropagation(); void (onEdit && onEdit()); }} className="p-2 rounded-full hover:bg-gray-200">
                    <LuPencil className="w-5 h-5 text-gray-600" />
                </button>
                <button onClick={e => { e.stopPropagation(); void (onDelete && onDelete()); }} className="p-2 rounded-full hover:bg-gray-200">
                    <LuTrash2 className="w-5 h-5 text-gray-600" />
                </button>
            </div>
        </div>
      </td>
    </tr>
  );
};

export default FileListItem; 