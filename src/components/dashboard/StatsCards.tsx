import { Package, DollarSign, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";

type StatsCardsProps = {
  totalProducts: number;
  totalValue: number;
  lowStockProducts: number;
};

export const StatsCards = ({
  totalProducts,
  totalValue,
  lowStockProducts,
}: StatsCardsProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="overflow-hidden border-l-4 border-l-primary shadow-md transition-all hover:shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total de Produtos
              </p>
              <p className="mt-2 text-3xl font-bold text-primary">
                {totalProducts}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Package className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden border-l-4 border-l-secondary shadow-md transition-all hover:shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Valor Total em Estoque
              </p>
              <p className="mt-2 text-3xl font-bold text-secondary">
                R$ {totalValue.toLocaleString("pt-BR")}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
              <DollarSign className="h-6 w-6 text-secondary" />
            </div>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden border-l-4 border-l-destructive shadow-md transition-all hover:shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Produtos com Estoque Baixo
              </p>
              <p className="mt-2 text-3xl font-bold text-destructive">
                {lowStockProducts}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
