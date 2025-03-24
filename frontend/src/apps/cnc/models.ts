// Auto-generated TypeScript models

import { CommandArgument } from './types';
export interface CommandTemplate {
  items: CommandTemplateItem[];
  id: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
  name: string;
  arguments: CommandArgument[];
}

export interface CommandTemplateItem {
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

export interface Instruction {
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
