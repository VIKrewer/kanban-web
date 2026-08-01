"use client";
import Navbar from "@/components/navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBoards } from "@/lib/hooks/useBoards";
import { useUser } from "@clerk/nextjs";
import {
    ChartPie,
    Filter,
    Grid3x3,
    KanbanSquare,
    List,
    Plus,
    Rocket,
    Search,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { Board, BoardWithTasks } from "@/lib/supabase/models";

//https://composed-oriole-84.clerk.accounts.dev

export default function DashboardPage() {
    const { user } = useUser();
    const { createBoard, boards, error, boardsWithTasks } = useBoards();
    const [viewMode, setViewMode] = useState("grid");

    const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

    const [filters, setFilters] = useState({
        search: "",
        dateRange: {
            start: null as string | null,
            end: null as string | null,
        },
        taskCount: {
            min: null as number | null,
            max: null as number | null,
        },
    });

    const filteredBoards = boardsWithTasks.filter((boards: BoardWithTasks) => {
        const taskAmount = boards.columns.reduce(
            (total, col) => total + col.tasks.length,
            0,
        );

        const matchesSearch = boards.title
            .toLowerCase()
            .includes(filters.search.toLowerCase());

        const matchesDateRange =
            (!filters.dateRange.start ||
                new Date(boards.created_at) >=
                    new Date(filters.dateRange.start)) &&
            (!filters.dateRange.end ||
                new Date(boards.created_at) <= new Date(filters.dateRange.end));

        const matchesTaskCount =
            (!filters.taskCount.min||
                taskAmount >= filters.taskCount.min) &&
            (!filters.taskCount.max ||
                taskAmount <= filters.taskCount.max);

        return matchesSearch && matchesDateRange && matchesTaskCount;
    });
    function clearFilters() {
        setFilters({
            search: "",
            dateRange: {
                start: null as string | null,
                end: null as string | null,
            },
            taskCount: {
                min: null as number | null,
                max: null as number | null,
            },
        });
    }

    const handleCreateBoard = async () => {
        await createBoard({ title: "New Board" });
    };

    if (error) {
        return (
            <div>
                <h2>Error loading boards</h2>
                <p>{error}</p>
            </div>
        );
    }

    console.log(filteredBoards);

    return (
        <div className="min-h-screen bg-gray-50 ">
            <Navbar />

            <main className="container mx-auto px-4 py-6 sm:py-8">
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                        Seja bem-vindo,{" "}
                        {user?.firstName ??
                            user?.emailAddresses[0].emailAddress}
                    </h1>
                    <p className="text-gray-600">
                        Veja o que está acontecendo em seus boards.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    <Card>
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sx sm:text-sm font-medium text-gray-600">
                                        Total de boards
                                    </p>
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                                        {boards.length}
                                    </p>
                                </div>
                                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <KanbanSquare className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sx sm:text-sm font-medium text-gray-600">
                                        Projetos ativos
                                    </p>
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                                        {boards.length}
                                    </p>
                                </div>
                                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Rocket className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sx sm:text-sm font-medium text-gray-600">
                                        Atividades recentes
                                    </p>
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                                        {
                                            boards.filter((board) => {
                                                const updatedAt = new Date(
                                                    board.updated_at,
                                                );
                                                const oneWeekAgo = new Date();
                                                oneWeekAgo.setDate(
                                                    oneWeekAgo.getDate() - 7,
                                                );

                                                return updatedAt > oneWeekAgo;
                                            }).length
                                        }
                                    </p>
                                </div>
                                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <ChartPie className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sx sm:text-sm font-medium text-gray-600">
                                        Total de boards
                                    </p>
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                                        {boards.length}
                                    </p>
                                </div>
                                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <KanbanSquare className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Boards */}

                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                                Seus Boards
                            </h2>
                            <p className="text-gray-600">
                                Gerencie seus projetos e tarefas
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                            <div className="flex items-center space-x-2 bg-white border p-1 rounded-lg">
                                <Button
                                    variant={
                                        viewMode === "grid"
                                            ? "default"
                                            : "ghost"
                                    }
                                    size="sm"
                                    onClick={() => setViewMode("grid")}
                                >
                                    <Grid3x3 />
                                </Button>
                                <Button
                                    variant={
                                        viewMode === "list"
                                            ? "default"
                                            : "ghost"
                                    }
                                    size="sm"
                                    onClick={() => setViewMode("list")}
                                >
                                    <List />
                                </Button>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsFilterOpen(true)}
                            >
                                <Filter />
                                Filtrar
                            </Button>

                            <Button onClick={handleCreateBoard}>
                                <Plus />
                                Criar Board
                            </Button>
                        </div>
                    </div>

                    {/* search bar */}
                    <div className="relative mb-4 sm:mb-6">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            id="search"
                            placeholder="Procure pelos Boards..."
                            className="pl-10"
                            onChange={(e) =>
                                setFilters((prev) => ({
                                    ...prev,
                                    search: e.target.value,
                                }))
                            }
                        />
                    </div>

                    {/* Boards Grid/List */}

                    {boards.length === 0 ? (
                        <div>Não há boards ainda.</div>
                    ) : viewMode === "grid" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ms:gap-6">
                            {filteredBoards.map((board, key) => (
                                <Link key={key} href={`/boards/${board.id}`}>
                                    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                                        <CardHeader className="pb-3 ">
                                            <div className="flex items-center justify-between">
                                                <div
                                                    className={`w-4 h-4 ${board.color} rounded `}
                                                />
                                                <Badge
                                                    className="text-xs"
                                                    variant="secondary"
                                                >
                                                    Novo
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-4 sm:p-6">
                                            <CardTitle className="text-base sm:text-lg mb-2 group-hover:text-blue-600 transition-colors">
                                                {board.title}
                                            </CardTitle>
                                            <CardDescription className="text-sm mb-4">
                                                {board.description}
                                            </CardDescription>
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 space-y-1 sm:space-y-0">
                                                <div className="flex flex-col">
                                                    <span>
                                                        Criado em{" "}
                                                        {new Date(
                                                            board.created_at,
                                                        ).toLocaleDateString()}
                                                    </span>
                                                    <span>
                                                        Atualizado em{" "}
                                                        {new Date(
                                                            board.updated_at,
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div>
                                                    Tasks:{" "}
                                                    {board.columns.reduce(
                                                        (total, col) =>
                                                            total +
                                                            col.tasks.length,
                                                        0,
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}

                            <Card
                                onClick={handleCreateBoard}
                                className="group border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer"
                            >
                                <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center h-full min-h-50">
                                    <Plus className="h-6 w-6 sm:h-8 text-gray-400 group-hover:text-blue-600 mb-2" />
                                    <p className="text-sm sm:text-base text-gray-600 group-hover:text-blue-600 font-medium">
                                        Criar um novo board
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div>
                            {boards.map((board, key) => (
                                <div
                                    key={key}
                                    className={key > 0 ? "mt-4" : ""}
                                >
                                    <Link href={`/boards/${board.id}`}>
                                        <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                                            <CardHeader className="pb-3 ">
                                                <div className="flex items-center justify-between">
                                                    <div
                                                        className={`w-4 h-4 ${board.color} rounded `}
                                                    />
                                                    <Badge
                                                        className="text-xs"
                                                        variant="secondary"
                                                    >
                                                        Novo
                                                    </Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-4 sm:p-6">
                                                <CardTitle className="text-base sm:text-lg mb-2 group-hover:text-blue-600 transition-colors">
                                                    {board.title}
                                                </CardTitle>
                                                <CardDescription className="text-sm mb-4">
                                                    {board.description}
                                                </CardDescription>
                                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 space-y-1 sm:space-y-0">
                                                    <span>
                                                        Criado em{" "}
                                                        {new Date(
                                                            board.created_at,
                                                        ).toLocaleDateString()}
                                                    </span>
                                                    <span>
                                                        Atualizado em{" "}
                                                        {new Date(
                                                            board.updated_at,
                                                        ).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </div>
                            ))}

                            <Card
                                onClick={handleCreateBoard}
                                className="mt-4 group border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer"
                            >
                                <CardContent className="p-4 sm:p-6 flex flex-col items-center justify-center h-full min-h-50">
                                    <Plus className="h-6 w-6 sm:h-8 text-gray-400 group-hover:text-blue-600 mb-2" />
                                    <p className="text-sm sm:text-base text-gray-600 group-hover:text-blue-600 font-medium">
                                        Criar um novo board
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </main>

            {/* Filter dialog */}

            <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <DialogContent className={"w-[95vw] max-w-106.25 mx-auto"}>
                    <DialogHeader>
                        <DialogTitle>Filtrar Boards</DialogTitle>
                        <p className="text-sm text-gray-600">
                            Filtre Boards pelo titulo, data ou contagem de
                            tarefas
                        </p>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Procurar</Label>
                            <Input
                                id="search"
                                placeholder="Procure por titulos de Board..."
                                value={filters.search}
                                onChange={(e) =>
                                    setFilters((prev) => ({
                                        ...prev,
                                        search: e.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Periodo</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                    <Label className="text-xs">
                                        Data de Inicio
                                    </Label>

                                    <Input
                                        type="date"
                                        value={filters.dateRange.start ?? undefined}
                                        onChange={(e) =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                dateRange: {
                                                    ...prev.dateRange,
                                                    start:
                                                        e.target.value || null,
                                                },
                                            }))
                                        }
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs">
                                        Data de Fim
                                    </Label>

                                    <Input
                                        type="date"
                                        value={filters.dateRange.end ?? undefined}
                                        onChange={(e) =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                dateRange: {
                                                    ...prev.dateRange,
                                                    end: e.target.value || null,
                                                },
                                            }))
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Contador de tarefas</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                    <Label className="text-xs">Minimo</Label>

                                    <Input
                                        type="number"
                                        min={0}
                                        placeholder="Minimo de tarefas"
                                        value={filters.taskCount.min || undefined}
                                        onChange={(e) =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                taskCount: {
                                                    ...prev.taskCount,
                                                    min: e.target.value
                                                        ? Number(e.target.value)
                                                        : null,
                                                },
                                            }))
                                        }
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs">Máximo</Label>

                                    <Input
                                        type="number"
                                        value={filters.taskCount.max || undefined}
                                        min={0}
                                        placeholder="Máximo de tarefas"
                                        onChange={(e) =>
                                            setFilters((prev) => ({
                                                ...prev,
                                                taskCount: {
                                                    ...prev.taskCount,
                                                    max: e.target.value
                                                        ? Number(e.target.value)
                                                        : null,
                                                },
                                            }))
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between pt-4 space-y-2 sm:space-y-0 sm:space-x-2">
                            <Button onClick={clearFilters} variant={"outline"}>
                                Limpar Filtros
                            </Button>
                            <Button onClick={() => setIsFilterOpen(false)}>
                                Aplicar Filtros
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
