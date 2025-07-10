import { useState } from "react";
import { 
  Folder, 
  FolderOpen, 
  File, 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  RefreshCw 
} from "lucide-react";

interface FileSystemNode {
  id: string;
  name: string;
  type: "file" | "directory";
  children?: FileSystemNode[];
  expanded?: boolean;
  path: string;
}

export default function FileExplorer() {
  const [fileSystem, setFileSystem] = useState<FileSystemNode[]>([
    {
      id: "root",
      name: "C:\\",
      type: "directory",
      expanded: true,
      path: "C:\\",
      children: [
        {
          id: "users",
          name: "Users",
          type: "directory",
          expanded: false,
          path: "C:\\Users",
          children: [
            {
              id: "admin",
              name: "Admin",
              type: "directory",
              expanded: true,
              path: "C:\\Users\\Admin",
              children: [
                {
                  id: "desktop",
                  name: "Desktop",
                  type: "directory",
                  expanded: false,
                  path: "C:\\Users\\Admin\\Desktop",
                },
                {
                  id: "documents",
                  name: "Documents",
                  type: "directory",
                  expanded: false,
                  path: "C:\\Users\\Admin\\Documents",
                },
                {
                  id: "passwords",
                  name: "passwords.txt",
                  type: "file",
                  path: "C:\\Users\\Admin\\passwords.txt",
                },
                {
                  id: "backup",
                  name: "backup.bat",
                  type: "file",
                  path: "C:\\Users\\Admin\\backup.bat",
                },
              ],
            },
          ],
        },
        {
          id: "program-files",
          name: "Program Files",
          type: "directory",
          expanded: false,
          path: "C:\\Program Files",
        },
        {
          id: "windows",
          name: "Windows",
          type: "directory",
          expanded: false,
          path: "C:\\Windows",
        },
      ],
    },
  ]);

  const toggleFolder = (nodeId: string) => {
    const updateNode = (nodes: FileSystemNode[]): FileSystemNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId && node.type === "directory") {
          return { ...node, expanded: !node.expanded };
        }
        if (node.children) {
          return { ...node, children: updateNode(node.children) };
        }
        return node;
      });
    };
    setFileSystem(updateNode(fileSystem));
  };

  const renderFileSystemNode = (node: FileSystemNode, depth: number = 0) => {
    const isFolder = node.type === "directory";
    const Icon = isFolder 
      ? (node.expanded ? FolderOpen : Folder)
      : (node.name.endsWith('.txt') ? FileText : File);

    return (
      <div key={node.id}>
        <div
          className={`flex items-center space-x-2 py-1 hover:c2-bg-dark rounded cursor-pointer`}
          style={{ marginLeft: `${depth * 16}px` }}
          onClick={() => isFolder && toggleFolder(node.id)}
        >
          <Icon className={`w-4 h-4 ${
            isFolder ? 'c2-text-info' : 
            node.name.endsWith('.txt') ? 'c2-text-dim' : 'c2-text-accent'
          }`} />
          <span className="text-sm c2-text">{node.name}</span>
        </div>
        
        {isFolder && node.expanded && node.children && (
          <div>
            {node.children.map(child => renderFileSystemNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full c2-bg-panel flex flex-col">
      <div className="p-3 c2-border border-b">
        <h3 className="text-sm font-medium c2-text-accent">File Explorer</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {fileSystem.map(node => renderFileSystemNode(node))}
        </div>
      </div>
      
      <div className="p-2 c2-border border-t flex space-x-1">
        <button 
          className="p-1 hover:c2-bg-dark rounded c2-text-dim hover:c2-text-accent"
          title="Upload"
        >
          <Upload className="w-3 h-3" />
        </button>
        <button 
          className="p-1 hover:c2-bg-dark rounded c2-text-dim hover:c2-text-accent"
          title="Download"
        >
          <Download className="w-3 h-3" />
        </button>
        <button 
          className="p-1 hover:c2-bg-dark rounded c2-text-dim hover:c2-text-accent"
          title="Delete"
        >
          <Trash2 className="w-3 h-3" />
        </button>
        <button 
          className="p-1 hover:c2-bg-dark rounded c2-text-dim hover:c2-text-accent"
          title="Refresh"
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
