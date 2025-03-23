import {RainerFile} from "@/apps/rainer/models";

export type RainerTree = {
    backend: Record<string | "__path__", string>;
    frontend: Record<string | "__path__", string>;
}

export type RefactorRainerFile = RainerFile & {content: string; file_references: RainerFile[]};
