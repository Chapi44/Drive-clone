import React, { useState } from 'react';
import { LuFolder, LuFolderOpen, LuChevronRight, LuChevronDown } from 'react-icons/lu';

export interface Folder {
  id: string;
  name: string;
  children?: Folder[];
}

interface FolderTreeProps {
  folders: Folder[];
  onFolderSelect: (id: string) => void;
}

interface FolderItemProps {
  folder: Folder;
  onFolderSelect: (id: string) => void;
  level?: number;
}

const FolderItem: React.FC<FolderItemProps> = ({ folder, onFolderSelect, level = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = folder.children && folder.children.length > 0;

  const handleToggle = () => {
    setIsOpen(!isOpen);
    onFolderSelect(folder.id);
  };

  return (
    <div className="font-medium" style={{ paddingLeft: `${level * 1.5}rem` }}>
      <div
        className="flex items-center p-2 rounded-full hover:bg-google-gray-200 cursor-pointer"
        onClick={handleToggle}
      >
        {hasChildren ? (
          isOpen ? <LuChevronDown className="w-5 h-5 mr-2 text-google-gray-800" /> : <LuChevronRight className="w-5 h-5 mr-2 text-google-gray-800" />
        ) : (
          <div className="w-5 mr-2" />
        )}
        {isOpen ? <LuFolderOpen className="w-5 h-5 mr-2 text-google-gray-900" /> : <LuFolder className="w-5 h-5 mr-2 text-google-gray-900" />}
        <span className="text-google-gray-950 text-sm">{folder.name}</span>
      </div>
      {isOpen && hasChildren && (
        <div className="mt-1">
          {folder.children?.map(child => (
            <FolderItem key={child.id} folder={child} onFolderSelect={onFolderSelect} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const FolderTree: React.FC<FolderTreeProps> = ({ folders, onFolderSelect }) => {
  return (
    <div className="space-y-1">
      {folders.map(folder => (
        <FolderItem key={folder.id} folder={folder} onFolderSelect={onFolderSelect} />
      ))}
    </div>
  );
};

export default FolderTree; 