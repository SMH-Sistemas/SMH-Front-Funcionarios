import { useState } from "react";
import { Button } from "@/components/ui/button";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Edit, Trash2, Plus, Percent } from "lucide-react";
import { TaxModal } from "./TaxModal";
import {
  useTaxes,
  useCreateTax,
  useUpdateTax,
  useDeleteTax,
} from "@/hooks/useTaxes";
import { TaxResponseDTO, TaxRequestDTO } from "@/services/api.tax";

export const TaxManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTax, setSelectedTax] = useState<TaxResponseDTO | null>(null);

  const { data: taxes = [], isLoading, error } = useTaxes();
  const createTaxMutation = useCreateTax();
  const updateTaxMutation = useUpdateTax();
  const deleteTaxMutation = useDeleteTax();

  const handleSaveTax = (data: TaxRequestDTO & { id?: number }) => {
    if (data.id) {
      // Atualizar
      updateTaxMutation.mutate(
        {
          id: data.id,
          data: {
            type: data.type,
            percentage: data.percentage,
            description: data.description,
          },
        },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            setSelectedTax(null);
          },
        }
      );
    } else {
      // Criar
      createTaxMutation.mutate(data, {
        onSuccess: () => {
          setIsModalOpen(false);
        },
      });
    }
  };

  const handleEditTax = (tax: TaxResponseDTO) => {
    setSelectedTax(tax);
    setIsModalOpen(true);
  };

  const handleDeleteTax = (id: number) => {
    if (
      window.confirm(
        "Tem certeza que deseja deletar este imposto? Esta ação não pode ser desfeita."
      )
    ) {
      deleteTaxMutation.mutate(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTax(null);
  };

  const getTypeBadgeColor = (type: string) => {
    return type === "EMPREITADA_GLOBAL" ? "bg-blue-100 text-blue-700" : type === "ICMS" ? "bg-green-100 text-green-700" : type === "ISS" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-700";
  };

  const getTypeLabel = (type: string) => {
    return type === "EMPREITADA_GLOBAL" ? "Empreitada Global" : type === "ICMS" ? "ICMS" : type === "ISS" ? "ISS" : "Outro";
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-linear-to-r from-amber-50 to-orange-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <Percent className="h-6 w-6 text-amber-700" />
            </div>
            <div>
              <CardTitle className="text-xl">Gerenciar Impostos</CardTitle>
              <CardDescription>
                Configure as porcentagens de impostos por tipo de produto
              </CardDescription>
            </div>
          </div>
          <Button
            onClick={() => {
              setSelectedTax(null);
              setIsModalOpen(true);
            }}
            className="bg-amber-600 hover:bg-amber-700 text-white gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo Imposto
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Carregando impostos...
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">
              Erro ao carregar impostos: {(error as Error).message}
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Tentar Novamente
            </Button>
          </div>
        ) : taxes.length === 0 ? (
          <div className="text-center py-12">
            <Percent className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              Nenhum imposto cadastrado ainda
            </p>
            <Button
              onClick={() => {
                setSelectedTax(null);
                setIsModalOpen(true);
              }}
              className="bg-amber-600 hover:bg-amber-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Imposto
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">ID</TableHead>
                  <TableHead className="font-semibold">Tipo</TableHead>
                  <TableHead className="font-semibold text-right">
                    Porcentagem
                  </TableHead>
                  <TableHead className="font-semibold">Descrição</TableHead>
                  <TableHead className="w-32 text-right font-semibold">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {taxes.map((tax) => (
                  <TableRow
                    key={tax.id}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      #{tax.id}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${getTypeBadgeColor(tax.type)} border-0`}
                      >
                        {getTypeLabel(tax.type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold text-lg text-amber-700">
                        {tax.percentage.toFixed(2)}%
                      </span>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <p className="text-sm text-foreground truncate">
                        {tax.description}
                      </p>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditTax(tax)}
                          className="h-8 w-8 bg-amber-100 text-amber-700 hover:bg-amber-200 border-2 border-amber-300"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTax(tax.id)}
                          className="h-8 w-8 bg-red-100 text-red-700 hover:bg-red-200 border-2 border-red-300"
                          title="Deletar"
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
        )}
      </CardContent>

      <TaxModal
        open={isModalOpen}
        onOpenChange={handleCloseModal}
        tax={selectedTax}
        onSave={handleSaveTax}
      />
    </Card>
  );
};
