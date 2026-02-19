export type PRDiffFile = {
  sha: string;
  filename: string;
  status:
    | "added"
    | "removed"
    | "modified"
    | "renamed"
    | "copied"
    | "changed"
    | "unchanged";
  additions: number;
  deletions: number;
  previousFilename?: string;
};

export type PRDiffInfo = {
  title: string;
  number: number;
  url: string;
  state: string;
  isDraft: boolean;
  author: string;
  authorAvatar: string;
  baseBranch: string;
  headBranch: string;
  additions: number;
  deletions: number;
  changedFiles: number;
  createdAt: string;
  updatedAt: string;
};

export type PRDiffResponse = {
  pr: PRDiffInfo;
  files: PRDiffFile[];
  diff: string;
};
