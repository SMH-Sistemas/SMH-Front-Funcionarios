import { Edit, Trash2, Eye, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Product } from "@/services/api.product";

type ProductsTableProps = {
  products: Product[];
  selectedProducts: number[];
  onSelectProducts: (ids: number[]) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  onView: (product: Product) => void;
};

export const ProductsTable = ({
  products,
  selectedProducts,
  onSelectProducts,
  onEdit,
  onDelete,
  onView,
}: ProductsTableProps) => {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectProducts(products.map((p) => p.id));
    } else {
      onSelectProducts([]);
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      onSelectProducts([...selectedProducts, id]);
    } else {
      onSelectProducts(selectedProducts.filter((pId) => pId !== id));
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      AVAILABLE: "Disponível",
      RESERVED: "Reservado",
      SOLD: "Vendido",
      OUT_OF_STOCK: "Sem Estoque",
      DISCONTINUED: "Descontinuado",
    };
    return labels[status] || status;
  };

  const getStatusVariant = (
    status: string
  ): "default" | "secondary" | "destructive" => {
    if (status === "AVAILABLE") return "default";
    if (status === "OUT_OF_STOCK" || status === "DISCONTINUED")
      return "destructive";
    return "secondary";
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      PRODUCT: "Produto",
      SERVICE: "Serviço",
    };
    return labels[type] || type;
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-12">
              <Checkbox
                checked={
                  selectedProducts.length === products.length &&
                  products.length > 0
                }
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead className="w-16"></TableHead>
            <TableHead className="font-semibold">NCM</TableHead>
            <TableHead className="font-semibold">Nome do Produto</TableHead>
            <TableHead className="font-semibold">Tipo</TableHead>
            <TableHead className="font-semibold text-right">Custo</TableHead>
            <TableHead className="font-semibold text-right">
              lucro (%)
            </TableHead>
            <TableHead className="font-semibold text-right">
              Preço de venda
            </TableHead>
            <TableHead className="font-semibold text-right">
              Quantidade
            </TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="w-36 text-right font-semibold">
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow
              key={product.id}
              className="transition-colors hover:bg-muted/30"
            >
              <TableCell>
                <Checkbox
                  checked={selectedProducts.includes(product.id)}
                  onCheckedChange={(checked) =>
                    handleSelectOne(product.id, checked as boolean)
                  }
                />
              </TableCell>
              <TableCell>
                <div className="w-12 h-12 rounded-md border bg-muted/30 overflow-hidden flex items-center justify-center">
                  {product.imgUrl ? (
                    <img
                      src={product.imgUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <Package className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </TableCell>
              <TableCell className="font-mono text-sm text-muted-foreground">
                {product.ncm}
              </TableCell>
              <TableCell className="font-medium">
                {product.name}
                {product.description && (
                  <p className="text-xs text-muted-foreground truncate max-w-xs">
                    {product.description}
                  </p>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{getTypeLabel(product.type)}</Badge>
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                R${" "}
                {product.cost?.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }) || "0,00"}
              </TableCell>
              <TableCell className="text-right">
                <Badge variant="secondary" className="font-semibold">
                  {product.profitMargin?.toFixed(1) || "0"}%
                </Badge>
              </TableCell>
              <TableCell className="text-right font-semibold text-green-700">
                R${" "}
                {product.price.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </TableCell>
              <TableCell className="text-right">
                <Badge
                  variant={
                    product.stockQuantity < 10 ? "destructive" : "secondary"
                  }
                  className="font-semibold"
                >
                  {product.stockQuantity}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={getStatusVariant(product.status)}
                  className={
                    product.status === "AVAILABLE"
                      ? "bg-green-600 hover:bg-green-700"
                      : ""
                  }
                >
                  {getStatusLabel(product.status)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onView(product)}
                    className="h-8 w-8 bg-blue-100 text-blue-700 hover:bg-blue-200 border-2 border-blue-300"
                    title="Ver detalhes"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(product)}
                    className="h-8 w-8 bg-green-100 text-green-700 hover:bg-green-200 border-2 border-green-300"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(product.id)}
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
  );
};
