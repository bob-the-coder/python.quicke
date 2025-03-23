// RainerContext.tsx

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

type FileIdentifier = { branch: string; path: string };

interface RainerContextType {
  getTree: ReturnType<typeof useTree>["data"];
  getFile: (key: FileIdentifier) => ReturnType<typeof useFile>;
  createFile: (payload: { branch: string; path: string; content?: string }) => void;
  updateFile: (payload: { branch: string; path: string; content: string }) => void;
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

function useFile({ branch, path }: FileIdentifier) {
  return useQuery({
    queryKey: ["rainer", "file", branch, path],
    queryFn: () => endpoint_get_file_contents({ branch, path }),
    enabled: !!branch && !!path,
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
      queryClient.invalidateQueries({queryKey: ["rainer", "file", vars.branch, vars.path]});
    },
  });

  const deleteFileMutation = useMutation({
    mutationFn: ({ branch, path }: FileIdentifier) =>
      endpoint_delete_file({ branch, path }),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["rainer", "tree"] });
      queryClient.removeQueries({ queryKey: ["rainer", "file", vars.branch, vars.path] });
    },
  });

  const createDirMutation = useMutation({
    mutationFn: endpoint_create_directory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rainer", "tree"] });
    },
  });

  const deleteDirMutation = useMutation({
    mutationFn: ({ branch, path }: FileIdentifier) =>
      endpoint_delete_directory({ branch, path }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rainer", "tree"] });
    },
  });

  const value: RainerContextType = {
    getTree: treeQuery.data,
    getFile: useFile,
    createFile: createFileMutation.mutate,
    updateFile: updateFileMutation.mutate,
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
