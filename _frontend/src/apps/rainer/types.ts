import {RainerFile} from "@/apps/rainer/models";

// @ts-expect-error This should be a recursive type
type TreeNode = Record<string, string | TreeNode>;

export type ProjectTree = TreeNode & { __path__: string }

export type RainerTree = Record<string, ProjectTree>;


export type RefactorRainerFile = RainerFile & {content: string; file_references: RainerFile[]};

export type FileDrops = {
    [dropNumber: string]: number;
}
