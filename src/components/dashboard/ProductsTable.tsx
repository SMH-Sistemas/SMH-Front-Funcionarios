import { Edit, Trash2, Eye } from "lucide-react";
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
import type { Product } from "@/services/api";

type ProductsTableProps = {
  products: Product[];
  selectedProducts: string[];
  onSelectProducts: (ids: string[]) => void;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
};

export const ProductsTable = ({
  products,
  selectedProducts,
  onSelectProducts,
  onEdit,
  onDelete,
}: ProductsTableProps) => {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectProducts(products.map((p) => p.id));
    } else {
      onSelectProducts([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      onSelectProducts([...selectedProducts, id]);
    } else {
      onSelectProducts(selectedProducts.filter((pId) => pId !== id));
    }
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
            <TableHead className="font-semibold">SKU</TableHead>
            <TableHead className="font-semibold">Nome do Produto</TableHead>
            <TableHead className="font-semibold">Categoria</TableHead>
            <TableHead className="font-semibold text-right">Preço</TableHead>
            <TableHead className="font-semibold text-right">Estoque</TableHead>
            <TableHead className="font-semibold text-right">Desconto</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="w-32 text-right font-semibold">
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
              <TableCell className="font-mono text-sm text-muted-foreground">
                {product.sku}
              </TableCell>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>{product.category}</TableCell>
              <TableCell className="text-right font-semibold">
                R$ {product.price.toLocaleString("pt-BR")}
              </TableCell>
              <TableCell className="text-right">
                <Badge
                  variant={product.stock < 10 ? "destructive" : "secondary"}
                  className="font-semibold"
                >
                  {product.stock}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {product.discount > 0 ? (
                  <Badge
                    variant="default"
                    className="bg-secondary font-semibold"
                  >
                    {product.discount}%
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    product.status === "active" ? "default" : "secondary"
                  }
                  className={
                    product.status === "active"
                      ? "bg-green-600 hover:bg-green-700"
                      : ""
                  }
                >
                  {product.status === "active" ? "Ativo" : "Inativo"}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(product)}
                    className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(product.id)}
                    className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
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
