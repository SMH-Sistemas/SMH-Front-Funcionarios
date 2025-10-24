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
      <Card className="overflow-hidden border-l-4 border-l-blue-600 shadow-lg transition-all hover:shadow-xl bg-linear-to-br from-blue-50 to-white">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600">
                Total de Produtos
              </p>
              <p className="mt-2 text-4xl font-bold text-blue-600">
                {totalProducts}
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 shadow-md">
              <Package className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden border-l-4 border-l-green-600 shadow-lg transition-all hover:shadow-xl bg-linear-to-br from-green-50 to-white">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600">
                Valor Total em Estoque
              </p>
              <p className="mt-2 text-4xl font-bold text-green-600">
                R$ {totalValue.toLocaleString("pt-BR")}
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-600 shadow-md">
              <DollarSign className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden border-l-4 border-l-red-600 shadow-lg transition-all hover:shadow-xl bg-linear-to-br from-red-50 to-white">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-600">
                Produtos com Estoque Baixo
              </p>
              <p className="mt-2 text-4xl font-bold text-red-600">
                {lowStockProducts}
              </p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-600 shadow-md">
              <AlertTriangle className="h-7 w-7 text-white" />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
