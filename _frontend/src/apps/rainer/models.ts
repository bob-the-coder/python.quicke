// Auto-generated TypeScript models


export interface CodeGenerationData {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
  llm_model: string;
  instructions: unknown;
  response: string;
  rainer_branch: string;
  rainer_path: string;
  drop_number: number;
}

export interface RainerFile {
  project: string;
  path: string;
}
