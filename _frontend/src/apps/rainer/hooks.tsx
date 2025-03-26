import React, { createContext, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  endpoint_get_rainer_tree,
  endpoint_get_file_contents,
  endpoint_create_file,
  endpoint_update_file,
  endpoint_delete_file,
  endpoint_create_directory,
  endpoint_delete_directory,
} from "./endpoints";
import { RefactorRainerFile } from "@/apps/rainer/types";

type FileIdentifier = { project: string; path: string };

interface RainerContextType {
  getTree: ReturnType<typeof useTree>["data"];
  getFile: (key: FileIdentifier) => ReturnType<typeof useFile>;
  createFile: {
    mutate: (payload: RefactorRainerFile) => void;
    isPending: boolean;
  };
  updateFile: {
    mutate: (payload: RefactorRainerFile) => void;
    isPending: boolean;
  };
  deleteFile: (key: FileIdentifier) => void;
  createDirectory: (key: FileIdentifier) => void;
  deleteDirectory: (key: FileIdentifier) => void;
}

const RainerContext = createContext<RainerContextType | null>(null);

function useTree() {
  return useQuery({
    queryKey: ["rainer", "tree"],
    queryFn: endpoint_get_rainer_tree,
  });
}

function useFile({ project, path }: FileIdentifier) {
  return useQuery({
    queryKey: ["rainer", "file", project, path],
    queryFn: () => endpoint_get_file_contents({ project, path }),
    enabled: !!project && !!path,
  });
}

export const RainerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();

  const treeQuery = useTree();

  const createFileMutation = useMutation({
    mutationFn: endpoint_create_file,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rainer", "tree"] });
    },
  });

  const updateFileMutation = useMutation({
    mutationFn: endpoint_update_file,
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["rainer", "file", vars.project, vars.path] });
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: ({ project, path }: FileIdentifier) =>
      endpoint_delete_file({ project, path }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["rainer", "tree"] });
      queryClient.removeQueries({ queryKey: ["rainer", "file", vars.project, vars.path] });
    },
  });

  const createDirMutation = useMutation({
    mutationFn: endpoint_create_directory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rainer", "tree"] });
    },
  });

  const deleteDirMutation = useMutation({
    mutationFn: ({ project, path }: FileIdentifier) =>
      endpoint_delete_directory({ project, path }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rainer", "tree"] });
    },
  });

  const value: RainerContextType = {
    getTree: treeQuery.data,
    getFile: useFile,
    createFile: { mutate: createFileMutation.mutate, isPending: createFileMutation.isPending },
    updateFile: {mutate: updateFileMutation.mutate, isPending: updateFileMutation.isPending},
    deleteFile: deleteFileMutation.mutate,
    createDirectory: createDirMutation.mutate,
    deleteDirectory: deleteDirMutation.mutate,
  };

  return <RainerContext.Provider value={value}>{children}</RainerContext.Provider>;
};

export function useRainer(): RainerContextType {
  const context = useContext(RainerContext);
  if (!context) throw new Error("useRainer must be used within a RainerProvider");
  return context;
}
