import {RainerFile} from "@/apps/rainer/models";

export type RainerTree = {
    backend: Record<string, string>;
    frontend: Record<string, string>;
}

export type RefactorRainerFile = RainerFile & {content: string; file_references: RainerFile[]}