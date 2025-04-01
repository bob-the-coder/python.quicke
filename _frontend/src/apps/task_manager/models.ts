// Auto-generated TypeScript models


export interface Agent {
  agent_directives: AgentDirective[];
  context_briefs: ContextBrief[];
  assigned_tasks: Task[];
  feedback_submitted: TaskFeedback[];
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
  description: string;
  model_name: string;
  intro: string;
  is_overseer: boolean;
  active: boolean;
}

export interface AgentDirective {
  name: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
  agent: Agent | undefined;
  directive: Directive | undefined;
}

export interface ContextBrief {
  tasks: Task[];
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
  title: string;
  summary: string;
  version: string;
  created_by: Agent | undefined;
  fulfilled: boolean;
}

export interface Directive {
  directive_agents: AgentDirective[];
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
  category: 'PRAGMA' | 'COMM' | 'IGN' | 'CLEANCODE' | 'ZEN';
  value: string;
}

export interface Task {
  subtasks: Task[];
  blocked_by: TaskDependency[];
  unblocks: TaskDependency[];
  feedback: TaskFeedback[];
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
  context: ContextBrief | undefined;
  parent: Task | undefined;
  type: 'ANALYZE_REQUIREMENTS' | 'EXTRACT_CONTEXT' | 'DEFINE_ARCHITECTURE' | 'SCOPE_FEATURE' | 'PLAN_SPRINT' | 'PRIORITIZE_TASKS' | 'MAP_DEPENDENCIES' | 'DEFINE_MODEL' | 'UPDATE_MODEL' | 'DB_MIGRATION' | 'CREATE_ENDPOINT' | 'BIND_ENDPOINT' | 'ADD_SERIALIZER' | 'INTEGRATE_MODULE' | 'DEFINE_VALIDATION' | 'SETUP_STATE' | 'IMPLEMENT_LOGIC' | 'IMPLEMENT_HELPER' | 'REFACTOR_CODE' | 'REFINE_TYPES' | 'FIX_LINT_ERRORS' | 'FRONTEND_COMPONENT' | 'FRONTEND_LOGIC' | 'STYLE_COMPONENT' | 'CONNECT_FRONTEND_BACKEND' | 'HANDLE_FORM' | 'WRITE_UNIT_TESTS' | 'WRITE_INTEGRATION_TESTS' | 'DEFINE_FIXTURE' | 'DEBUG_AND_TRACE' | 'ADMIN_UI' | 'CREATE_FAKE_DATA' | 'DOCUMENT_FEATURE' | 'WRITE_TODO_FLAGS' | 'REVIEW_CODE' | 'ADD_LOGIC' | 'OTHER';
  status: 'todo' | 'in_progress' | 'review' | 'done' | 'blocked' | 'obsolete';
  title: string;
  description: string;
  checklist: Array<{ label: string; checked: boolean }>;
  output_expectation: string;
  assigned_to: Agent | undefined;
  locked: boolean;
}

export interface TaskDependency {
  name: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
  dependent: Task | undefined;
  depends_on: Task | undefined;
}

export interface TaskFeedback {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
  task: Task | undefined;
  submitted_by: Agent | undefined;
  content: string;
  is_blocking: boolean;
}
