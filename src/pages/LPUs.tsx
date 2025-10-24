import { useState } from "react";
import {
  Package,
  Plus,
  Loader2,
  LogOut,
  User,
  List,
  Eye,
  Edit,
  Trash2,
  TruckIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useLPUs,
  useCreateLPU,
  useUpdateLPU,
  useDeleteLPU,
} from "@/hooks/useLPUs";
import { useLogout, useCurrentUser } from "@/hooks/useAuth";
import type { LPUResponseDTO, LPURequestDTO } from "@/services/api.lpu";
import imgLogo from "../assets/smh_sistemas_logo.jpg";
import { LPUModal } from "@/components/lpu/LPUModal";
import { DeleteLPUModal } from "@/components/lpu/DeleteLPUModal";
import { TaxManagement } from "@/components/lpu/TaxManagement";

const LPUs = () => {
  const navigate = useNavigate();

  // React Query hooks
  const { data: lpus = [], isLoading, error } = useLPUs();
  const { data: user } = useCurrentUser();
  const createLPUMutation = useCreateLPU();
  const updateLPUMutation = useUpdateLPU();
  const deleteLPUMutation = useDeleteLPU();
  const logoutMutation = useLogout();

  // Estados locais
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLPU, setSelectedLPU] = useState<LPUResponseDTO | null>(null);
  const [lpuToDelete, setLPUToDelete] = useState<LPUResponseDTO | null>(null);

  const handleViewLPU = (lpu: LPUResponseDTO) => {
    // Navegar para o dashboard de produtos dessa LPU
    navigate(`/dashboard/lpu/${lpu.id}`, { state: { lpu } });
  };

  const handleSaveLPU = (data: LPURequestDTO, id?: number) => {
    if (id) {
      // Atualizar LPU existente
      updateLPUMutation.mutate({ id, data });
    } else {
      // Criar nova LPU
      createLPUMutation.mutate(data);
    }
    setIsModalOpen(false);
    setSelectedLPU(null);
  };

  const handleEditLPU = (lpu: LPUResponseDTO) => {
    setSelectedLPU(lpu);
    setIsModalOpen(true);
  };

  const handleDeleteLPU = (lpu: LPUResponseDTO) => {
    setLPUToDelete(lpu);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (lpuToDelete) {
      deleteLPUMutation.mutate(lpuToDelete.id);
      setLPUToDelete(null);
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLPU(null);
  };

  const isAnyMutationLoading =
    createLPUMutation.isPending ||
    updateLPUMutation.isPending ||
    deleteLPUMutation.isPending ||
    logoutMutation.isPending;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-10 border-b-4 border-primary bg-background shadow-lg">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 md:px-8">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-white overflow-hidden shrink-0">
              <img
                src={imgLogo}
                alt="SMH Sistemas Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base md:text-xl font-bold text-primary truncate">
                SMH Sistemas
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Gerenciamento de LPUs
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {user && (
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{user.name}</span>
              </div>
            )}
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate("/pedidos")}
              className="gap-2 shrink-0"
            >
              <TruckIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Pedidos</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              className="gap-2 shrink-0"
            >
              {logoutMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 md:p-8">
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                Lista de Produtos Unitários (LPU)
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Gerencie suas listas de produtos. Clique em uma LPU para ver
                seus produtos.
              </p>
            </div>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="gap-2 shrink-0 w-full sm:w-auto"
              disabled={isAnyMutationLoading}
            >
              <Plus className="h-4 w-4" />
              Nova LPU
            </Button>
          </div>
        </div>

        <Card className="shadow-md">
          {/* Loading state */}
          {isLoading ? (
            <div className="p-12 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Carregando LPUs...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="p-12">
              <div className="text-center text-destructive">
                <p className="font-medium">Erro ao carregar LPUs</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Tente novamente mais tarde
                </p>
              </div>
            </div>
          ) : lpus.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhuma LPU cadastrada
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Comece criando sua primeira Lista de Produtos Unitários
              </p>
              <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Criar Primeira LPU
              </Button>
            </div>
          ) : (
            <>
              {/* Versão Desktop - Tabela */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">ID</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-center">Produtos</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lpus.map((lpu) => (
                      <TableRow
                        key={lpu.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleViewLPU(lpu)}
                      >
                        <TableCell className="font-mono text-sm">
                          #{lpu.id}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {lpu.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {lpu.description || "Sem descrição"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="gap-1">
                            <List className="h-3 w-3" />
                            {lpu.products.length}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={lpu.active ? "default" : "secondary"}
                            className={
                              lpu.active
                                ? "bg-green-600 hover:bg-green-700"
                                : ""
                            }
                          >
                            {lpu.active ? "Ativa" : "Inativa"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewLPU(lpu);
                              }}
                              title="Ver produtos"
                              className="hover:bg-blue-100 hover:text-blue-600"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditLPU(lpu);
                              }}
                              title="Editar LPU"
                              className="hover:bg-amber-100 hover:text-amber-600"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteLPU(lpu);
                              }}
                              title="Excluir LPU"
                              className="hover:bg-red-100 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Versão Mobile - Cards */}
              <div className="md:hidden divide-y">
                {lpus.map((lpu) => (
                  <div
                    key={lpu.id}
                    className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleViewLPU(lpu)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs text-muted-foreground">
                            #{lpu.id}
                          </span>
                          <Badge
                            variant={lpu.active ? "default" : "secondary"}
                            className={`text-xs ${
                              lpu.active
                                ? "bg-green-600 hover:bg-green-700"
                                : ""
                            }`}
                          >
                            {lpu.active ? "Ativa" : "Inativa"}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-base mb-1">
                          {lpu.name}
                        </h3>
                        {lpu.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {lpu.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1">
                          <List className="h-3 w-3" />
                          <span className="text-xs">
                            {lpu.products.length} produtos
                          </span>
                        </Badge>
                      </div>

                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewLPU(lpu);
                          }}
                          className="h-8 px-2 hover:bg-blue-100 hover:text-blue-600"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditLPU(lpu);
                          }}
                          className="h-8 px-2 hover:bg-amber-100 hover:text-amber-600"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLPU(lpu);
                          }}
                          className="h-8 px-2 hover:bg-red-100 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        {/* Seção de Gerenciamento de Impostos */}
        <div className="mt-6 sm:mt-8">
          <TaxManagement />
        </div>
      </main>

      <LPUModal
        open={isModalOpen}
        onOpenChange={handleCloseModal}
        onSave={handleSaveLPU}
        lpu={selectedLPU}
      />

      <DeleteLPUModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        lpu={lpuToDelete}
      />
    </div>
  );
};

export default LPUs;
