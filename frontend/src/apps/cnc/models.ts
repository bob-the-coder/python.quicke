// Auto-generated TypeScript models

import { CommandArgument } from './types';
export type CommandTemplate = {
  items: CommandTemplateItem[];
  id: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
  name: string;
  arguments: CommandArgument[];
}

export type CommandTemplateItem = {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
  template: CommandTemplate | undefined;
  instruction: Instruction | undefined;
  custom_text: string;
  order: number;
}

export type Instruction = {
  commandtemplateitem: CommandTemplateItem[];
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
  text: string;
  group: string;
  instruction_type: string;
}
