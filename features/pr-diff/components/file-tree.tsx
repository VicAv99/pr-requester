"use client";

import { useMemo, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import type { PRDiffFile } from "../types/pr-diff";
import {
  ChevronRightIcon,
  FileIcon,
  FilePlusIcon,
  FileMinusIcon,
  FolderIcon,
  FolderOpenIcon,
  PencilIcon,
  ArrowRightIcon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const STATUS_ICON: Record<PRDiffFile["status"], typeof FileIcon> = {
  added: FilePlusIcon,
  removed: FileMinusIcon,
  modified: PencilIcon,
  renamed: ArrowRightIcon,
  copied: FilePlusIcon,
  changed: PencilIcon,
  unchanged: FileIcon,
};

const STATUS_COLOR: Record<PRDiffFile["status"], string> = {
  added: "text-status-approved",
  removed: "text-status-changes-requested",
  modified: "text-amber-500",
  renamed: "text-blue-500",
  copied: "text-blue-500",
  changed: "text-amber-500",
  unchanged: "text-muted-foreground",
};

type TreeNode = {
  name: string;
  path: string;
  children: Map<string, TreeNode>;
  files: PRDiffFile[];
  totalAdditions: number;
  totalDeletions: number;
};

function buildTree(files: PRDiffFile[]): TreeNode {
  const root: TreeNode = {
    name: "",
    path: "",
    children: new Map(),
    files: [],
    totalAdditions: 0,
    totalDeletions: 0,
  };

  for (const file of files) {
    const parts = file.filename.split("/");
    const fileName = parts.pop()!;
    let current = root;

    for (const part of parts) {
      if (!current.children.has(part)) {
        const childPath = current.path ? `${current.path}/${part}` : part;
        current.children.set(part, {
          name: part,
          path: childPath,
          children: new Map(),
          files: [],
          totalAdditions: 0,
          totalDeletions: 0,
        });
      }
      current = current.children.get(part)!;
    }

    current.files.push({ ...file, filename: fileName });
  }

  function aggregate(node: TreeNode): void {
    let additions = 0;
    let deletions = 0;

    for (const file of node.files) {
      additions += file.additions;
      deletions += file.deletions;
    }

    for (const child of node.children.values()) {
      aggregate(child);
      additions += child.totalAdditions;
      deletions += child.totalDeletions;
    }

    node.totalAdditions = additions;
    node.totalDeletions = deletions;
  }

  aggregate(root);

  return root;
}

function collectAllDirPaths(node: TreeNode): Set<string> {
  const paths = new Set<string>();
  for (const child of node.children.values()) {
    paths.add(child.path);
    for (const p of collectAllDirPaths(child)) {
      paths.add(p);
    }
  }
  return paths;
}

type FileTreeProps = {
  files: PRDiffFile[];
  activeFile?: string;
  onFileClick: (filename: string) => void;
};

export function FileTree({ files, activeFile, onFileClick }: FileTreeProps) {
  const tree = useMemo(() => buildTree(files), [files]);

  const [expanded, setExpanded] = useState<Set<string>>(
    () => collectAllDirPaths(tree),
  );

  const toggle = useCallback((path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  return (
    <nav className="flex flex-col gap-0.5">
      <DirectoryContents
        node={tree}
        expanded={expanded}
        onToggle={toggle}
        activeFile={activeFile}
        onFileClick={onFileClick}
        depth={0}
      />
    </nav>
  );
}

type DirectoryContentsProps = {
  node: TreeNode;
  expanded: Set<string>;
  onToggle: (path: string) => void;
  activeFile?: string;
  onFileClick: (filename: string) => void;
  depth: number;
};

function DirectoryContents({
  node,
  expanded,
  onToggle,
  activeFile,
  onFileClick,
  depth,
}: DirectoryContentsProps) {
  const sortedDirs = useMemo(
    () =>
      [...node.children.values()].sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    [node.children],
  );

  const sortedFiles = useMemo(
    () =>
      [...node.files].sort((a, b) =>
        a.filename.localeCompare(b.filename),
      ),
    [node.files],
  );

  return (
    <>
      {sortedDirs.map((child) => (
        <DirectoryNode
          key={child.path}
          node={child}
          expanded={expanded}
          onToggle={onToggle}
          activeFile={activeFile}
          onFileClick={onFileClick}
          depth={depth}
        />
      ))}
      {sortedFiles.map((file) => {
        const fullPath = node.path
          ? `${node.path}/${file.filename}`
          : file.filename;
        const Icon = STATUS_ICON[file.status];

        return (
          <Tooltip key={fullPath}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => onFileClick(fullPath)}
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
                className={cn(
                  "flex items-center gap-1.5 rounded-md py-1 pr-2 text-left text-xs transition-colors",
                  "hover:bg-muted",
                  activeFile === fullPath && "bg-muted font-medium",
                )}
              >
                <Icon
                  className={cn("size-3.5 shrink-0", STATUS_COLOR[file.status])}
                />
                <span className="min-w-0 flex-1 truncate">{file.filename}</span>
                <span className="shrink-0 font-mono text-[10px] tabular-nums">
                  <span className="text-status-approved">+{file.additions}</span>
                  {" "}
                  <span className="text-status-changes-requested">
                    -{file.deletions}
                  </span>
                </span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" align="start">
              {fullPath}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </>
  );
}

type DirectoryNodeProps = {
  node: TreeNode;
  expanded: Set<string>;
  onToggle: (path: string) => void;
  activeFile?: string;
  onFileClick: (filename: string) => void;
  depth: number;
};

function DirectoryNode({
  node,
  expanded,
  onToggle,
  activeFile,
  onFileClick,
  depth,
}: DirectoryNodeProps) {
  const isOpen = expanded.has(node.path);
  const FolderStateIcon = isOpen ? FolderOpenIcon : FolderIcon;

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => onToggle(node.path)}
            style={{ paddingLeft: `${depth * 12 + 4}px` }}
            className="flex items-center gap-1 rounded-md py-1 pr-2 text-left text-xs transition-colors hover:bg-muted"
          >
            <ChevronRightIcon
              className={cn(
                "size-3 shrink-0 text-muted-foreground transition-transform duration-150",
                isOpen && "rotate-90",
              )}
            />
            <FolderStateIcon className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate font-medium">{node.name}</span>
            <span className="shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground">
              <span className="text-status-approved">+{node.totalAdditions}</span>
              {" "}
              <span className="text-status-changes-requested">
                -{node.totalDeletions}
              </span>
            </span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" align="start">
          {node.path}
        </TooltipContent>
      </Tooltip>
      {isOpen && (
        <DirectoryContents
          node={node}
          expanded={expanded}
          onToggle={onToggle}
          activeFile={activeFile}
          onFileClick={onFileClick}
          depth={depth + 1}
        />
      )}
    </>
  );
}
