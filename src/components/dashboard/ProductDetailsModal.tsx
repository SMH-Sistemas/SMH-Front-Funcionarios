import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, X } from "lucide-react";
import type { Product } from "@/services/api.product";

type ProductDetailsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
};

export const ProductDetailsModal = ({
  open,
  onOpenChange,
  product,
}: ProductDetailsModalProps) => {
  if (!product) return null;

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Package className="h-6 w-6 text-primary" />
            </div>
            Detalhes do Produto
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Imagem */}
          <div className="w-full">
            <div className="aspect-video rounded-xl border-2 bg-linear-to-br from-muted/50 to-muted/30 overflow-hidden flex items-center justify-center p-4">
              {product.imgUrl ? (
                <img
                  src={product.imgUrl}
                  alt={product.name}
                  className="max-w-full max-h-full object-contain rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="flex flex-col items-center justify-center p-8 text-muted-foreground">
                          <svg class="h-20 w-20 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p class="text-base">Imagem não disponível</p>
                        </div>
                      `;
                    }
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
                  <Package className="h-20 w-20 mb-3" />
                  <p className="text-base">Sem imagem cadastrada</p>
                </div>
              )}
            </div>
          </div>

          {/* Nome e badges */}
          <div className="space-y-3">
            <h3 className="text-3xl font-bold text-foreground">
              {product.name}
            </h3>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={getStatusVariant(product.status)}
                className={`text-sm py-1 px-3 ${
                  product.status === "AVAILABLE"
                    ? "bg-green-600 hover:bg-green-700"
                    : ""
                }`}
              >
                {getStatusLabel(product.status)}
              </Badge>
              <Badge variant="outline" className="text-sm py-1 px-3">
                {getTypeLabel(product.type)}
              </Badge>
            </div>
          </div>

          {/* Descrição */}
          {product.description && (
            <div className="bg-muted/40 rounded-lg p-4 border">
              <p className="text-sm font-semibold text-muted-foreground mb-2">
                DESCRIÇÃO
              </p>
              <p className="text-foreground leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          <Separator className="my-4" />

          {/* Informações em grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-muted/40 rounded-lg p-4 border">
              <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">
                Custo Unitário
              </p>
              <p className="text-2xl font-bold text-foreground">
                R${" "}
                {product.cost?.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }) || "0,00"}
              </p>
            </div>

            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">
                Margem de Lucro
              </p>
              <p className="text-2xl font-bold text-amber-700">
                {product.profitMargin?.toFixed(1) || "0"}%
              </p>
            </div>

            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">
                Preço de Venda
              </p>
              <p className="text-2xl font-bold text-green-700">
                R${" "}
                {product.price.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div className="bg-muted/40 rounded-lg p-4 border">
              <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">
                Quantidade em Estoque
              </p>
              <p className="text-2xl font-bold text-foreground">
                {product.stockQuantity}
              </p>
            </div>

            <div className="bg-muted/40 rounded-lg p-4 border">
              <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">
                NCM
              </p>
              <p className="text-lg font-mono font-bold text-foreground">
                {product.ncm}
              </p>
            </div>

            <div className="bg-muted/40 rounded-lg p-4 border">
              <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">
                ID do Produto
              </p>
              <p className="text-lg font-mono font-bold text-foreground">
                #{product.id}
              </p>
            </div>
          </div>

          {/* Valor total em estoque - destaque */}
          <div className="rounded-xl bg-linear-to-br from-primary/10 to-primary/5 p-6 border-2 border-primary/20">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">
                  VALOR TOTAL EM ESTOQUE
                </p>
                <p className="text-xs text-muted-foreground">
                  {product.stockQuantity} unidades × R${" "}
                  {product.price.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <p className="text-3xl font-bold text-primary">
                R${" "}
                {(product.price * product.stockQuantity).toLocaleString(
                  "pt-BR",
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
