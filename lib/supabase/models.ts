export interface Board {
    id: string;
    title: string;
    description: string | null;
    color: string;
    user_id: string;
    created_at: string;
    updated_at: string;
}

export interface Column {
    id: string;
    board_id: string;
    title: string;
    sort_order: number;
    created_at: string;
    updated_at: string;
    user_id: string;
}

export interface Task {
    id: string;
    column_id: string;
    title: string;
    description: string | null;
    assignee: string | null;
    due_date: string | null;
    priority: "baixo" | "medio" | "alto";
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export type ColumnWithTasks  = Column & {
    tasks: Task[];
}

export type BoardWithTasks = Board & {
    columns: ColumnWithTasks[]
}