export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskType = 'work' | 'event' | 'poll';

export interface TaskUser {
  _id: string;
  username: string;
  displayName?: string;
  avatar: string | null;
}

export interface Task {
  _id: string;
  workspace: string;
  channel: string;
  sourceMessage?: string | null;
  taskType?: TaskType;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: TaskUser | null;
  createdBy: TaskUser;
  dueDate?: string | null;
  completedAt?: string | null;
  eventAt?: string | null;
  location?: string;
  eventRsvps?: Array<{
    user: string;
    response: 'going' | 'maybe' | 'declined';
  }>;
  pollQuestion?: string;
  pollOptions?: Array<{ option: string; votes: string[] }>;
  pollExpiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  workspaceId: string;
  channelId: string;
  taskType?: TaskType;
  title: string;
  description?: string;
  priority?: TaskPriority;
  assignee?: string | null;
  dueDate?: string | null;
  eventAt?: string | null;
  location?: string;
  pollQuestion?: string;
  pollOptions?: string[];
  pollExpiresAt?: string | null;
  pollAnonymous?: boolean;
  pollMultiChoice?: boolean;
  sourceMessage?: string | null;
}

export interface MyTaskSummary {
  pendingCount: number;
  overdueCount: number;
}
