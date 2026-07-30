"use client";

import Navbar from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBoard } from "@/lib/hooks/useBoards";
import type { ColumnWithTasks, Task as TaskType } from "@/lib/supabase/models";
import { Calendar, MoreHorizontal, Plus, UserCircle } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    rectIntersection,
    useDroppable,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";

function DroppableColumn({
    column,
    children,
    onCreateTask,
    onEditColumn,
}: {
    column: ColumnWithTasks;
    children: React.ReactNode;
    onCreateTask: (columnId: string, taskData: any) => Promise<void>;
    onEditColumn: (column: ColumnWithTasks) => void;
}) {
    const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const taskData = {
            title: formData.get("title") as string,
            description: (formData.get("description") as string) || undefined,
            assignee: (formData.get("assignee") as string) || undefined,
            dueDate: (formData.get("dueDate") as string) || undefined,
            priority:
                (formData.get("priority") as "baixo" | "medio" | "alto") ||
                "medio",
        };

        if (taskData.title.trim()) {
            await onCreateTask(column.id, taskData);
            setIsNewTaskOpen(false);
        }
    }

    const { setNodeRef } = useDroppable({ id: column.id });

    return (
        <div
            ref={setNodeRef}
            className={`w-full lg:shrink-0 lg:w-80`}
        >
            <div className={`bg-white rounded-lg shadow-sm border`}>
                {/* Column header */}
                <div className="p-3 sm:p-4 border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                {column.title}
                            </h3>
                            <Badge
                                variant={"secondary"}
                                className="text-xs shrink-0"
                            >
                                {column.tasks.length}
                            </Badge>
                        </div>
                        <Button
                            variant={"ghost"}
                            size={"sm"}
                            className={"shrink-0"}
                            onClick={() => onEditColumn(column)}
                        >
                            <MoreHorizontal />
                        </Button>
                    </div>
                </div>

                {/* Column content */}
                <div className="p-2">
                    {children}
                    <Dialog
                        open={isNewTaskOpen}
                        onOpenChange={setIsNewTaskOpen}
                    >
                        <DialogTrigger
                            render={
                                <Button
                                    variant={"ghost"}
                                    className={
                                        "w-full mt-3 text-gray-500 hover:text-gray-700"
                                    }
                                >
                                    <Plus />
                                    Nova tarefa
                                </Button>
                            }
                        />

                        <DialogContent className="w-[95vw] max-w-106.25 mx-auto">
                            <DialogHeader>
                                <DialogTitle>Crie uma nova tarefa</DialogTitle>
                                <p className="text-sm text-gray-600">
                                    Adicione uma tarefa ao Board
                                </p>
                            </DialogHeader>

                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <div className="space-y-2">
                                    <Label>Titulo *</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        placeholder="Insira o titulo da tarefa"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Descrição</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        placeholder="Insira a descrição da tarefa..."
                                        rows={3}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Responsável</Label>
                                    <Input
                                        id="assignee"
                                        name="assignee"
                                        placeholder="Quem fará essa tarefa?"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Prioridade</Label>
                                    <Select
                                        name="priority"
                                        defaultValue="medio"
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {["baixo", "medio", "alto"].map(
                                                (priority, key) => (
                                                    <SelectItem
                                                        key={key}
                                                        value={priority}
                                                    >
                                                        {priority
                                                            .charAt(0)
                                                            .toUpperCase() +
                                                            priority.slice(1)}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Prazo</Label>
                                    <Input
                                        type="date"
                                        id="dueDate"
                                        name="dueDate"
                                    />
                                </div>

                                <div className="flex justify-end space-x-2 pt-4">
                                    <Button type="submit">Criar tarefa</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}

function SortableTask({ task }: { task: TaskType }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    function getPriorityColor(priority: "baixo" | "medio" | "alto"): string {
        switch (priority) {
            case "alto":
                return "bg-red-500";
            case "medio":
                return "bg-yellow-500";
            case "baixo":
                return "bg-green-500";
            default:
                return "bg-yellow-500";
        }
    }

    const styles = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={styles} {...listeners} {...attributes}>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-3 sm:p-4 ">
                    <div className="space-y-2 sm:space-y-3">
                        {/* Task Header */}
                        <div className="flex items-start justify-between">
                            <h4 className="font-medium text-gray-900 text-sm leading-tight flex-1 min-w-0 pr-2">
                                {task.title}
                            </h4>
                        </div>

                        {/* Task description */}
                        <p className="text-xs text-gray-600 line-clamp-2">
                            {task.description || "Sem descrição."}
                        </p>

                        {/* Task meta */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                                {task.assignee && (
                                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                                        <UserCircle className="h-3 w-3" />
                                        <span className="truncate">
                                            {task.assignee}
                                        </span>
                                    </div>
                                )}

                                {task.due_date && (
                                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                                        <Calendar className="h-3 w-3" />
                                        <span className="truncate">
                                            {task.due_date}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div
                                className={`w-2 h-2 rounded-full shrink-0 ${getPriorityColor(task.priority)}`}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function TaskOverlay({ task }: { task: TaskType }) {
    function getPriorityColor(priority: "baixo" | "medio" | "alto"): string {
        switch (priority) {
            case "alto":
                return "bg-red-500";
            case "medio":
                return "bg-yellow-500";
            case "baixo":
                return "bg-green-500";
            default:
                return "bg-yellow-500";
        }
    }

    return (
        <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4 ">
                <div className="space-y-2 sm:space-y-3">
                    {/* Task Header */}
                    <div className="flex items-start justify-between">
                        <h4 className="font-medium text-gray-900 text-sm leading-tight flex-1 min-w-0 pr-2">
                            {task.title}
                        </h4>
                    </div>

                    {/* Task description */}
                    <p className="text-xs text-gray-600 line-clamp-2">
                        {task.description || "Sem descrição."}
                    </p>

                    {/* Task meta */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
                            {task.assignee && (
                                <div className="flex items-center space-x-1 text-xs text-gray-500">
                                    <UserCircle className="h-3 w-3" />
                                    <span className="truncate">
                                        {task.assignee}
                                    </span>
                                </div>
                            )}

                            {task.due_date && (
                                <div className="flex items-center space-x-1 text-xs text-gray-500">
                                    <Calendar className="h-3 w-3" />
                                    <span className="truncate">
                                        {task.due_date}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div
                            className={`w-2 h-2 rounded-full shrink-0 ${getPriorityColor(task.priority)}`}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function BoardPage() {
    const { id } = useParams<{ id: string }>();
    const {
        board,
        updateBoard,
        columns,
        createRealTask,
        setColumns,
        moveTask,
        createColumn,
        updateColumn,
    } = useBoard(id);

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newColor, setNewColor] = useState("");

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [isCreatingColumn, setIsCreatingColumn] = useState(false);
    const [isEditingColumn, setIsEditingColumn] = useState(false);
    const [newColumnTitle, setNewColumnTitle] = useState("");
    const [editingColumnTitle, setEditingColumnTitle] = useState("");
    const [editingColumn, setEditingColumn] = useState<ColumnWithTasks | null>(
        null,
    );

    const [filters, setFilters] = useState({
        priority: [] as string[],
        assignee: [] as string[],
        dueDate: null as string | null,
    });

    const [isNewTaskOpen, setIsNewTaskOpen] = useState(false);

    const [activeTask, setActiveTask] = useState<TaskType | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
    );

    function handleFilterChange(
        type: "priority" | "assignee" | "dueDate",
        value: string | string[] | null,
    ) {
        setFilters((prev) => ({
            ...prev,
            [type]: value,
        }));
    }

    function clearFilters() {
        setFilters({
            priority: [] as string[],
            assignee: [] as string[],
            dueDate: null as string | null,
        });
    }

    async function handleUpdateBoard(e: React.FormEvent) {
        e.preventDefault();

        if (!newTitle.trim() || !board) return;

        try {
            await updateBoard(board.id, {
                title: newTitle.trim(),
                color: newColor || board.color,
            });
            setIsEditingTitle(false);
        } catch {}
    }

    async function createTask(
        columnId: string,
        taskData: {
            title: string;
            description?: string;
            assignee?: string;
            dueDate?: string;
            priority: "baixo" | "medio" | "alto";
        },
    ) {
        await createRealTask(columnId, taskData);
    }

    async function handleCreateTask(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const taskData = {
            title: formData.get("title") as string,
            description: (formData.get("description") as string) || undefined,
            assignee: (formData.get("assignee") as string) || undefined,
            dueDate: (formData.get("dueDate") as string) || undefined,
            priority:
                (formData.get("priority") as "baixo" | "medio" | "alto") ||
                "medio",
        };

        const targetColumn = columns[0];
        if (!targetColumn) return;

        if (taskData.title.trim()) {
            await createTask(targetColumn.id, taskData);
            setIsNewTaskOpen(false);
        }
    }

    function handleDragStart(event: DragStartEvent) {
        const taskId = event.active.id as string;
        const task = columns
            .flatMap((col) => col.tasks)
            .find((task) => task.id === taskId);

        if (task) {
            setActiveTask(task);
        }
    }

    function handleDragOver(event: DragOverEvent) {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const sourceColumn = columns.find((col) =>
            col.tasks.some((task) => task.id === activeId),
        );

        const targetColumn =
            columns.find((col) => col.id === overId) ||
            columns.find((col) => col.tasks.some((task) => task.id === overId));

        if (!sourceColumn || !targetColumn) return;

        // Mesma coluna — reordena
        if (sourceColumn.id === targetColumn.id) {
            const activeIndex = sourceColumn.tasks.findIndex(
                (task) => task.id === activeId,
            );
            const overIndex = targetColumn.tasks.findIndex(
                (task) => task.id === overId,
            );

            if (
                activeIndex !== -1 &&
                overIndex !== -1 &&
                activeIndex !== overIndex
            ) {
                setColumns((prev: ColumnWithTasks[]) => {
                    const newColumns = [...prev];
                    const column = newColumns.find(
                        (col) => col.id === sourceColumn.id,
                    );
                    if (column) {
                        const tasks = [...column.tasks];
                        const [removed] = tasks.splice(activeIndex, 1);
                        tasks.splice(overIndex, 0, removed);
                        column.tasks = tasks;
                    }
                    return newColumns;
                });
            }
        } else {
            // Coluna diferente — move a task
            setColumns((prev: ColumnWithTasks[]) => {
                const newColumns = prev.map((col) => ({
                    ...col,
                    tasks: [...col.tasks],
                }));

                const src = newColumns.find(
                    (col) => col.id === sourceColumn.id,
                )!;
                const dst = newColumns.find(
                    (col) => col.id === targetColumn.id,
                )!;

                const taskIndex = src.tasks.findIndex(
                    (task) => task.id === activeId,
                );
                if (taskIndex === -1) return prev;

                const [task] = src.tasks.splice(taskIndex, 1);
                const overIndex = dst.tasks.findIndex((t) => t.id === overId);
                dst.tasks.splice(
                    overIndex === -1 ? dst.tasks.length : overIndex,
                    0,
                    task,
                );

                return newColumns;
            });
        }
    }

    async function handleDragEnd(event: DragEndEvent) {
        try {
            const { active, over } = event;

            if (!over) return;

            const taskId = active.id as string;
            const overId = over.id as string;

            const sourceColumn = columns.find((col) =>
                col.tasks.some((task) => task.id === taskId),
            );

            const targetColumn =
                columns.find((col) => col.id === overId) ||
                columns.find((col) =>
                    col.tasks.some((task) => task.id === overId),
                );

            if (!sourceColumn || !targetColumn) return;

            if (sourceColumn.id === targetColumn.id) {
                const oldIndex = sourceColumn.tasks.findIndex(
                    (task) => task.id === taskId,
                );

                const newIndex = sourceColumn.tasks.findIndex(
                    (task) => task.id === overId,
                );

                if (
                    oldIndex !== -1 &&
                    newIndex !== -1 &&
                    oldIndex !== newIndex
                ) {
                    setColumns((prev) =>
                        prev.map((col) => {
                            if (col.id !== sourceColumn.id) return col;

                            const tasks = [...col.tasks];

                            const [movedTask] = tasks.splice(oldIndex, 1);

                            tasks.splice(newIndex, 0, movedTask);

                            return {
                                ...col,
                                tasks,
                            };
                        }),
                    );

                    moveTask(taskId, sourceColumn.id, newIndex).catch(
                        console.error,
                    );
                }

                return;
            }

            setColumns((prev) => {
                const source = prev.find((col) =>
                    col.tasks.some((task) => task.id === taskId),
                );

                if (!source) return prev;

                const task = source.tasks.find((task) => task.id === taskId);

                if (!task) return prev;

                return prev.map((col) => {
                    if (col.id === source.id) {
                        return {
                            ...col,
                            tasks: col.tasks.filter(
                                (task) => task.id !== taskId,
                            ),
                        };
                    }

                    if (col.id === targetColumn.id) {
                        return {
                            ...col,
                            tasks: [...col.tasks, task],
                        };
                    }

                    return col;
                });
            });

            moveTask(taskId, targetColumn.id, targetColumn.tasks.length).catch(
                console.error,
            );
        } finally {
            setActiveTask(null);
        }
    }

    async function handleCreateColumn(e: React.FormEvent) {
        e.preventDefault();

        if (!newColumnTitle.trim()) return;
        await createColumn(newColumnTitle.trim());

        setNewColumnTitle("");
        setIsCreatingColumn(false);
    }

    async function handleUpdateColumn(e: React.FormEvent) {
        e.preventDefault();

        if (!editingColumnTitle.trim() || !editingColumn) return;
        await updateColumn(editingColumn.id, editingColumnTitle.trim());

        setEditingColumnTitle("");
        setIsEditingColumn(false);
        setEditingColumn(null);
    }

    function handleEditColumn(column: ColumnWithTasks) {
        setIsEditingColumn(true);
        setEditingColumn(column);
        setEditingColumnTitle(column.title);
    }

    const filteredColumns = columns.map((column) => ({
        ...column,
        tasks: column.tasks.filter((task) => {
            // filter by priority

            if (
                filters.priority.length > 0 &&
                !filters.priority.includes(task.priority)
            ) {
                return false;
            }

            // Filter by due date
            if (filters.dueDate && task.due_date) {
                const taskDate = new Date(task.due_date).toDateString();
                const filterDate = new Date(filters.dueDate).toDateString();

                if (taskDate !== filterDate) {
                    return false;
                }
            }

            return true;
        }),
    }));

    return (
        <>
            <div className="min-h-screen bg-gray-50">
                <Navbar
                    boardTitle={board?.title}
                    onEditBoard={() => {
                        setNewTitle(board?.title ?? "");
                        setNewColor(board?.color ?? "");
                        setIsEditingTitle(true);
                    }}
                    onFilterClick={() => setIsFilterOpen(true)}
                    filterCount={Object.values(filters).reduce(
                        (count, v) =>
                            count +
                            (Array.isArray(v) ? v.length : v !== null ? 1 : 0),
                        0,
                    )}
                />

                <Dialog open={isEditingTitle} onOpenChange={setIsEditingTitle}>
                    <DialogContent className="w-[95vw] max-w-106.25 mx-auto">
                        <DialogHeader>
                            <DialogTitle>Editar Board</DialogTitle>
                        </DialogHeader>
                        <form
                            className="space-y-4"
                            onSubmit={handleUpdateBoard}
                        >
                            <div className="space-y-2">
                                <Label htmlFor="boardTitle">
                                    Titulo do Board
                                </Label>
                                <Input
                                    value={newTitle}
                                    onChange={(e) =>
                                        setNewTitle(e.target.value)
                                    }
                                    id="boardTitle"
                                    placeholder="Insira o titulo do Board"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Cor do Board</Label>
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                    {[
                                        "bg-blue-500",
                                        "bg-red-500",
                                        "bg-orange-500",
                                        "bg-amber-500",
                                        "bg-yellow-500",
                                        "bg-green-500",
                                        "bg-emerald-500",
                                        "bg-teal-500",
                                        "bg-cyan-500",
                                        "bg-purple-500",
                                        "bg-pink-500",
                                        "bg-indigo-500",
                                    ].map((color) => (
                                        <button
                                            type="button"
                                            onClick={() => setNewColor(color)}
                                            key={color}
                                            className={`w-8 h-8 rounded-full ${color} ${color === newColor ? "ring-2 ring-offset-2 ring-gray-900" : ""}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button
                                    type="button"
                                    variant={"outline"}
                                    onClick={() => setIsEditingTitle(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit">Salvar edição</Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                    <DialogContent className="w-[95vw] max-w-106.25 mx-auto">
                        <DialogHeader>
                            <DialogTitle>Filtrar tarefas</DialogTitle>
                            <p className="text-sm text-gray-600">
                                Filtre as tarefas pela prioridade, responsável
                                ou prazo
                            </p>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Prioridade</Label>
                                <div className="flex flex-wrap gap-2">
                                    {["baixo", "medio", "alto"].map(
                                        (priority, key) => (
                                            <Button
                                                onClick={() => {
                                                    const newPriorities =
                                                        filters.priority.includes(
                                                            priority,
                                                        )
                                                            ? filters.priority.filter(
                                                                  (p) =>
                                                                      p !==
                                                                      priority,
                                                              )
                                                            : [
                                                                  ...filters.priority,
                                                                  priority,
                                                              ];
                                                    handleFilterChange(
                                                        "priority",
                                                        newPriorities,
                                                    );
                                                }}
                                                className={"cursor-pointer"}
                                                key={key}
                                                variant={
                                                    filters.priority.includes(
                                                        priority,
                                                    )
                                                        ? "default"
                                                        : "outline"
                                                }
                                                size={"sm"}
                                            >
                                                {priority
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    priority.slice(1)}
                                            </Button>
                                        ),
                                    )}
                                </div>
                            </div>

                            {/* <div className="space-y-2">
                            <Label>Responsável</Label>
                            <div className="flex flex-wrap gap-2">
                                {["baixo", "medio", "alto"].map((priority, key) => (
                                    <Button className={"cursor-pointer"} key={key} variant={"outline"} size={"sm"} >
                                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                    </Button>
                                ))}
                            </div>
                        </div> */}

                            <div className="space-y-2">
                                <Label>Prazo</Label>
                                <Input
                                    value={filters.dueDate || ""}
                                    onChange={(e) =>
                                        handleFilterChange(
                                            "dueDate",
                                            e.target.value || null,
                                        )
                                    }
                                    type="date"
                                />
                            </div>

                            <div className="flex justify-between pt-4">
                                <Button
                                    onClick={clearFilters}
                                    type="button"
                                    variant={"outline"}
                                >
                                    Limpar filtros
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => setIsFilterOpen(false)}
                                >
                                    Aplicar filtros
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* { board content } */}

                <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
                    {/* Board stats */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
                        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                            <div className="text-sm text-gray-600">
                                <span className="font-medium">
                                    Tarefas totais:
                                </span>
                                {columns.reduce(
                                    (sum, col) => sum + col.tasks.length,
                                    0,
                                )}
                            </div>
                        </div>

                        {/* Add a task dialog */}

                        <Dialog
                            open={isNewTaskOpen}
                            onOpenChange={setIsNewTaskOpen}
                        >
                            <DialogTrigger
                                render={
                                    <Button className={"w-full sm:w-auto "}>
                                        <Plus />
                                        Nova tarefa
                                    </Button>
                                }
                            />

                            <DialogContent className="w-[95vw] max-w-106.25 mx-auto">
                                <DialogHeader>
                                    <DialogTitle>
                                        Crie uma nova tarefa
                                    </DialogTitle>
                                    <p className="text-sm text-gray-600">
                                        Adicione uma tarefa ao Board
                                    </p>
                                </DialogHeader>

                                <form
                                    className="space-y-4"
                                    onSubmit={handleCreateTask}
                                >
                                    <div className="space-y-2">
                                        <Label>Titulo *</Label>
                                        <Input
                                            id="title"
                                            name="title"
                                            placeholder="Insira o titulo da tarefa"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Descrição</Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            placeholder="Insira a descrição da tarefa..."
                                            rows={3}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Responsável</Label>
                                        <Input
                                            id="assignee"
                                            name="assignee"
                                            placeholder="Quem fará essa tarefa?"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Prioridade</Label>
                                        <Select
                                            name="priority"
                                            defaultValue="medio"
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {["baixo", "medio", "alto"].map(
                                                    (priority, key) => (
                                                        <SelectItem
                                                            key={key}
                                                            value={priority}
                                                        >
                                                            {priority
                                                                .charAt(0)
                                                                .toUpperCase() +
                                                                priority.slice(
                                                                    1,
                                                                )}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Prazo</Label>
                                        <Input
                                            type="date"
                                            id="dueDate"
                                            name="dueDate"
                                        />
                                    </div>

                                    <div className="flex justify-end space-x-2 pt-4">
                                        <Button type="submit">
                                            Criar tarefa
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Board columns */}

                    <DndContext
                        sensors={sensors}
                        collisionDetection={rectIntersection}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                    >
                        <div
                            className="flex flex-col lg:flex-row lg:space-x-6 lg:overflow-x-auto 
            lg:pb-6 lg:px-2 lg:-mx-2 lg:[&::-webkit-scrollbar]:h-2 
            lg:[&::-webkit-scrollbar-track]:bg-gray-100 
            lg:[&::-webkit-scrollbar-thumb]:bg-gray-300 lg:[&::-webkit-scrollbar-thumb]:rounded-full 
            space-y-4 lg:space-y-0"
                        >
                            {filteredColumns.map((column, key) => (
                                <DroppableColumn
                                    column={column}
                                    key={key}
                                    onCreateTask={createTask}
                                    onEditColumn={handleEditColumn}
                                >
                                    <SortableContext
                                        items={column.tasks.map(
                                            (task) => task.id,
                                        )}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="space-y-3">
                                            {column.tasks.map((task, key) => (
                                                <SortableTask
                                                    task={task}
                                                    key={key}
                                                />
                                            ))}
                                        </div>
                                    </SortableContext>
                                </DroppableColumn>
                            ))}

                            <div className="w-full lg:shrink-0 lg:w-80">
                                <Button
                                    onClick={() => setIsCreatingColumn(true)}
                                    variant={"outline"}
                                    className={
                                        "w-full h-full min-h-50 border-dashed border-2 text-gray-500 hover:text-gray-700"
                                    }
                                >
                                    <Plus />
                                    Adicionar outra lista
                                </Button>
                            </div>

                            <DragOverlay>
                                {activeTask ? (
                                    <TaskOverlay task={activeTask} />
                                ) : null}
                            </DragOverlay>
                        </div>
                    </DndContext>
                </main>
            </div>

            <Dialog open={isCreatingColumn} onOpenChange={setIsCreatingColumn}>
                <DialogContent className="w-[95vw] max-w-106.25 mx-auto">
                    <DialogHeader>
                        <DialogTitle>Crie uma nova Coluna</DialogTitle>
                        <p className="text-sm text-gray-600">
                            Adicione uma nova coluna para organizar suas tarefas
                        </p>
                    </DialogHeader>

                    <form className="space-y-4" onSubmit={handleCreateColumn}>
                        <div className="space-y-2">
                            <Label>Titulo da coluna</Label>
                            <Input
                                id="columnTitle"
                                value={newColumnTitle}
                                onChange={(e) =>
                                    setNewColumnTitle(e.target.value)
                                }
                                placeholder="Insira o titulo da coluna...."
                                required
                            />
                        </div>
                        <div className="space-x-2 flex justify-end">
                            <Button
                                type="button"
                                variant={"outline"}
                                onClick={() => setIsCreatingColumn(false)}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit">Criar Coluna</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isEditingColumn} onOpenChange={setIsEditingColumn}>
                <DialogContent className="w-[95vw] max-w-106.25 mx-auto">
                    <DialogHeader>
                        <DialogTitle>Edite a Coluna</DialogTitle>
                        <p className="text-sm text-gray-600">
                            Atualize o titulo da sua coluna
                        </p>
                    </DialogHeader>

                    <form className="space-y-4" onSubmit={handleUpdateColumn}>
                        <div className="space-y-2">
                            <Label>Titulo da coluna</Label>
                            <Input
                                id="columnTitle"
                                value={editingColumnTitle}
                                onChange={(e) =>
                                    setEditingColumnTitle(e.target.value)
                                }
                                placeholder="Insira o titulo da coluna...."
                                required
                            />
                        </div>
                        <div className="space-x-2 flex justify-end">
                            <Button
                                type="button"
                                variant={"outline"}
                                onClick={() => {
                                    setIsEditingColumn(false);
                                    setEditingColumnTitle("");
                                    setEditingColumn(null);
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit">Editar Coluna</Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
