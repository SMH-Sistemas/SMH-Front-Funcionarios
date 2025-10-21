import { useState } from "react";
import { Eye, Trash2 } from "lucide-react";
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
import { Saida } from "@/types/saida";

type SaidasTableProps = {
  saidas: Saida[];
  onView: (saida: Saida) => void;
  onDelete: (id: string) => void;
};

const statusBadgeVariant = {
  rascunho: "secondary",
  reservado: "default",
  em_transporte: "default",
  entregue: "default",
  cancelado: "destructive",
  estornado: "secondary",
} as const;

const statusLabel = {
  rascunho: "Rascunho",
  reservado: "Reservado",
  em_transporte: "Em Transporte",
  entregue: "Entregue",
  cancelado: "Cancelado",
  estornado: "Estornado",
};

export const SaidasTable = ({ saidas, onView, onDelete }: SaidasTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[120px]">Número</TableHead>
          <TableHead>Data</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead className="text-right">Total Itens</TableHead>
          <TableHead className="text-right">Valor Total</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Responsável</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {saidas.map((saida) => (
          <TableRow key={saida.id}>
            <TableCell className="font-medium">{saida.numero}</TableCell>
            <TableCell>
              {new Date(saida.data).toLocaleDateString("pt-BR")}
            </TableCell>
            <TableCell>{saida.cliente.nome}</TableCell>
            <TableCell className="text-right">{saida.itens.length}</TableCell>
            <TableCell className="text-right">
              {saida.valorTotal.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </TableCell>
            <TableCell>
              <Badge variant={statusBadgeVariant[saida.status]}>
                {statusLabel[saida.status]}
              </Badge>
            </TableCell>
            <TableCell>{saida.responsavel}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onView(saida)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {saida.status === "rascunho" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(saida.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
