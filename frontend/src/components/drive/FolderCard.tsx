import React from 'react';
import { LuFolder, LuStar, LuTrash2, LuPencil } from 'react-icons/lu';

export interface FolderCardProps {
  name: string;
  itemCount: number;
  isStarred?: boolean;
  onStar?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
  onEdit?: () => void;
}

const FolderCard: React.FC<FolderCardProps> = ({
  name,
  isStarred,
  onStar,
  onDelete,
  onClick,
  onEdit,
}) => {
  return (
    <div
      className="bg-google-gray-100 hover:bg-google-gray-200 rounded-2xl p-4 transition-colors duration-200 cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LuFolder className="w-6 h-6 text-google-gray-800" />
          <span className="font-medium text-google-gray-900">{name}</span>
        </div>
        <div className="flex items-center">
          <button onClick={(e) => { e.stopPropagation(); onStar?.(); }} className="p-2 rounded-full hover:bg-google-gray-300/60">
            <LuStar className={`w-5 h-5 ${isStarred ? 'text-yellow-500 fill-current' : 'text-google-gray-700'}`} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onEdit?.(); }} className="p-2 rounded-full hover:bg-google-gray-300/60">
            <LuPencil className="w-5 h-5 text-google-gray-700" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete?.(); }} className="p-2 rounded-full hover:bg-google-gray-300/60">
            <LuTrash2 className="w-5 h-5 text-google-gray-700" />
          </button>
        </div>
      </div>
      {/* <p className="text-sm text-google-gray-700 mt-2 pl-9">{itemCount} items</p> */}
    </div>
  );
};

export default FolderCard; 