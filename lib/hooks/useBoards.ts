"use client";
import { useUser } from "@clerk/nextjs";
import {
    boardDataService,
    boardService,
    columnService,
    tasksService,
} from "../services";
import { useCallback, useEffect, useState } from "react";
import { useSupabase } from "../supabase/SupabaseProvider";
import { Board, BoardWithTasks, ColumnWithTasks } from "../supabase/models";

export function useBoards() {
    const { user } = useUser();
    const { supabase } = useSupabase();
    // const [boards, setBoards] = useState<Board[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [boardsWithTasks, setBoardsWithTasks] = useState<BoardWithTasks[]>([])

    const loadBoardsWithTasks = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);
            const data = await boardService.getBoardsWithTasks(supabase!, user.id);
            setBoardsWithTasks(data);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to load boards.",
            );
        } finally {
            setLoading(false);
        }
    }, [supabase, user]);

    useEffect(() => {
        if (user) {
            // loadBoards();
            loadBoardsWithTasks();
        }
    }, [user, loadBoardsWithTasks]);

    // async function loadBoards() {
    //     if (!user) return;

    //     try {
    //         setLoading(true);
    //         setError(null);
    //         const data = await boardService.getBoards(supabase!, user.id);
    //         setBoards(data);
    //     } catch (err) {
    //         setError(
    //             err instanceof Error ? err.message : "Failed to load boards.",
    //         );
    //     } finally {
    //         setLoading(false);
    //     }
    // }

    async function createBoard(boardData: {
        title: string;
        description?: string;
        color?: string;
    }) {
        if (!user) throw new Error("User not authenticated");

        try {
            const newBoard =
                await boardDataService.createBoardWithDefaultColumns(
                    supabase!,
                    {
                        ...boardData,
                        userId: user?.id,
                    },
                );

            setBoardsWithTasks((prev) => [{ ...newBoard, columns: [] }, ...prev]);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to create board",
            );
        }
    }

    return { loading, error, createBoard, boardsWithTasks };
}

export function useBoard(boardId: string) {
    const { supabase } = useSupabase();
    const { user } = useUser();
    const [board, setBoard] = useState<Board | null>(null);
    const [columns, setColumns] = useState<ColumnWithTasks[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadBoard = useCallback(async () => {
        if (!boardId) return;

        try {
            setLoading(true);
            setError(null);
            const data = await boardDataService.getBoardWithColumns(
                supabase!,
                boardId,
            );
            setBoard(data.board);
            setColumns(data.columnsWithTasks);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to load boards.",
            );
        } finally {
            setLoading(false);
        }
    }, [boardId, supabase]);

    useEffect(() => {
        if (boardId) {
            loadBoard();
        }
    }, [boardId, loadBoard]);

    async function updateBoard(boardId: string, updates: Partial<Board>) {
        try {
            const updatedBoard = await boardService.updateBoard(
                supabase!,
                boardId,
                updates,
            );
            setBoard(updatedBoard);
            return updateBoard;
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to update the board.",
            );
        }
    }

    async function createRealTask(
        columnId: string,
        taskData: {
            title: string;
            description?: string;
            assignee?: string;
            dueDate?: string;
            priority: "baixo" | "medio" | "alto";
        },
    ) {
        try {
            const newTask = await tasksService.createTask(supabase!, {
                title: taskData.title,
                description: taskData.description || null,
                assignee: taskData.assignee || null,
                due_date: taskData.dueDate || null,
                column_id: columnId,
                sort_order:
                    columns.find((col) => col.id === columnId)?.tasks.length ||
                    0,
                priority: taskData.priority || "medio",
            });

            setColumns((prev) =>
                prev.map((col) =>
                    col.id === columnId
                        ? { ...col, tasks: [...col.tasks, newTask] }
                        : col,
                ),
            );
            return newTask;
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to create the task.",
            );
        }
    }

    async function moveTask(
        taskId: string,
        newColumnId: string,
        newOrder: number,
    ) {
        try {
            await tasksService.moveTask(
                supabase!,
                taskId,
                newColumnId,
                newOrder,
            );
        } catch (err) {
            await loadBoard(); // ou restaurar o estado anterior

            setError(
                err instanceof Error ? err.message : "Failed to move task.",
            );
        }
    }

    async function createColumn(title: string) {
        if (!board || !user) throw new Error("Board not loaded");

        try {
            const newColumn = await columnService.createColumn(supabase!, {
                title,
                board_id: board.id,
                sort_order: columns.length,
                user_id: user.id,
            });

            setColumns((prev) => [...prev, { ...newColumn, tasks: [] }]);
            return newColumn;
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to create column.",
            );
        }
    }

    async function updateColumn(columnId: string, title: string) {
        try {
            const updatedColumn = await columnService.updateColumnTitle(
                supabase!,
                columnId,
                title,
            );

            setColumns((prev) =>
                prev.map((col) =>
                    col.id === columnId ? { ...col, ...updatedColumn } : col,
                ),
            );

            return updatedColumn;
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to create column.",
            );
        }
    }

    return {
        board,
        columns,
        loading,
        error,
        updateBoard,
        createRealTask,
        setColumns,
        moveTask,
        createColumn,
        updateColumn,
    };
}
