import React from 'react';
import { 
  LuFile, LuStar, LuTrash2, LuPencil,
  LuFileText, LuFileSpreadsheet, LuFileVideo, LuImage, LuFolder
} from 'react-icons/lu';

export type FileType = 'pdf' | 'spreadsheet' | 'document' | 'presentation' | 'image' | 'video' | 'folder' | 'unknown';

export interface FileCardProps {
  name: string;
  type: FileType;
  size: string;
  lastModified: string;
  owner?: string;
  isStarred?: boolean;
  onStar?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
  onEdit?: () => void;
  url?: string;
  createdAt?: string;
  hideActions?: boolean;
}

const FileCard: React.FC<FileCardProps> = ({
  name,
  type,
  isStarred,
  onStar,
  onDelete,
  onClick,
  onEdit,
  url,
  createdAt,
}) => {

  const getFileIcon = () => {
    switch (type) {
      case 'folder': return <LuFolder className="w-6 h-6 text-google-gray-800" />;
      case 'pdf': return <LuFileText className="w-6 h-6 text-red-500" />;
      case 'document': return <LuFileText className="w-6 h-6 text-blue-500" />;
      case 'spreadsheet': return <LuFileSpreadsheet className="w-6 h-6 text-green-500" />;
      case 'presentation': return <LuFileText className="w-6 h-6 text-yellow-600" />;
      case 'video': return <LuFileVideo className="w-6 h-6 text-red-700" />;
      case 'image': return <LuImage className="w-6 h-6 text-purple-500" />;
      default: return <LuFile className="w-6 h-6 text-google-gray-800" />;
    }
  };

  

  return (
    <div
      className="bg-google-gray-200/50 hover:bg-google-gray-200 rounded-2xl p-4 transition-colors duration-200 cursor-pointer flex flex-col justify-between relative z-20"
      onClick={onClick}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          {type === 'image' && url ? (
            <img src={url} alt={name} className="w-10 h-10 object-cover rounded" />
          ) : (
            getFileIcon()
          )}
          <div className="flex items-center relative">
            <button onClick={(e) => { e.stopPropagation(); onStar?.(); }} className="p-2 rounded-full hover:bg-google-gray-300/60">
              <LuStar className={`w-5 h-5 ${isStarred ? 'text-google-yellow' : 'text-google-gray-800'}`} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onEdit?.(); }} className="p-2 rounded-full hover:bg-google-gray-300/60">
              <LuPencil className="w-5 h-5 text-google-gray-800" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete?.(); }} className="p-2 rounded-full hover:bg-google-gray-300/60">
              <LuTrash2 className="w-5 h-5 text-google-gray-800" />
            </button>
          </div>
        </div>
        <div>
          <h3 className="font-medium text-google-gray-950 truncate">{name}</h3>
        </div>
      </div>
      <div>
        <p className="text-sm text-google-gray-800 mt-2">You created</p>
        <p className="text-xs text-google-gray-600">{createdAt || ''}</p>
      </div>
    </div>
  );
};

export default FileCard;
