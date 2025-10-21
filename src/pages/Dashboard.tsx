import { useState } from "react";
import {
  Package,
  Plus,
  TrendingUp,
  DollarSign,
  BarChart3,
  FileText,
  Loader2,
  AlertTriangle,
  LogOut,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProductsTable } from "@/components/dashboard/ProductsTable";
import { ProductModal } from "@/components/dashboard/ProductModal";
import { DiscountModal } from "@/components/dashboard/DiscountModal";
import { StatsCards } from "@/components/dashboard/StatsCards";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useApplyDiscount,
} from "@/hooks/useProducts";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useLogout, useCurrentUser } from "@/hooks/useAuth";
import { type Product } from "@/services/api";

const Dashboard = () => {
  const navigate = useNavigate();

  // Hooks do React Query
  const {
    data: products = [],
    isLoading: productsLoading,
    error: productsError,
  } = useProducts();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: user } = useCurrentUser();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  const applyDiscountMutation = useApplyDiscount();
  const logoutMutation = useLogout();

  // Estados locais
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (productData: Product) => {
    if (selectedProduct) {
      // Atualizar produto existente
      updateProductMutation.mutate({
        id: productData.id,
        name: productData.name,
        sku: productData.sku,
        category: productData.category,
        price: productData.price,
        stock: productData.stock,
        discount: productData.discount,
        status: productData.status,
      });
    } else {
      // Criar novo produto
      createProductMutation.mutate({
        name: productData.name,
        sku: productData.sku,
        category: productData.category,
        price: productData.price,
        stock: productData.stock,
        discount: productData.discount || 0,
        status: productData.status,
      });
    }
    setIsProductModalOpen(false);
  };

  const handleDeleteProduct = (id: string) => {
    deleteProductMutation.mutate(id);
  };

  const handleApplyDiscount = () => {
    if (selectedProducts.length > 0) {
      setIsDiscountModalOpen(true);
    }
  };

  const handleSaveDiscount = (discount: number) => {
    applyDiscountMutation.mutate({
      productIds: selectedProducts,
      discount,
    });
    setSelectedProducts([]);
    setIsDiscountModalOpen(false);
  };

  // Usar dados do back-end ou calcular localmente como fallback
  const totalProducts = stats?.totalProducts ?? products.length;
  const totalValue =
    stats?.totalValue ??
    products.reduce((sum, p) => sum + p.price * p.stock, 0);
  const lowStockProducts =
    stats?.lowStockProducts ?? products.filter((p) => p.stock < 10).length;

  // Estados de loading
  const isLoading = productsLoading || statsLoading;
  const isMutating =
    createProductMutation.isPending ||
    updateProductMutation.isPending ||
    deleteProductMutation.isPending ||
    applyDiscountMutation.isPending ||
    logoutMutation.isPending;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-10 border-b bg-background shadow-sm">
        <div className="flex h-16 items-center justify-between px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-primary to-primary/80">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">SMH Sistemas</h1>
              <p className="text-xs text-muted-foreground">
                Dashboard de Produtos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{user.name}</span>
              </div>
            )}
            <Button
              onClick={handleAddProduct}
              className="gap-2"
              disabled={isMutating}
            >
              {isMutating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Novo Produto
            </Button>
            <Button
              variant="outline"
              onClick={() => logoutMutation.mutate()}
              className="gap-2"
              disabled={isMutating}
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate("/saidas")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Saída de Produtos
                </p>
                <h3 className="text-2xl font-bold text-primary mt-2">
                  Gerenciar
                </h3>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Registrar remessas, vendas e entregas
            </p>
          </Card>
        </div>

        {/* Loading state para stats */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-3 mb-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded w-24"></div>
                    <div className="h-8 bg-muted animate-pulse rounded w-16"></div>
                  </div>
                  <div className="h-12 w-12 bg-muted animate-pulse rounded-full"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <StatsCards
            totalProducts={totalProducts}
            totalValue={totalValue}
            lowStockProducts={lowStockProducts}
          />
        )}

        <Card className="mt-6 overflow-hidden shadow-md">
          <div className="border-b bg-card px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-card-foreground">
                  Lista de Produtos
                </h2>
                <p className="text-sm text-muted-foreground">
                  Gerencie seu catálogo de produtos
                </p>
              </div>
              {selectedProducts.length > 0 && (
                <Button
                  variant="secondary"
                  onClick={handleApplyDiscount}
                  className="gap-2"
                  disabled={isMutating}
                >
                  {applyDiscountMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <DollarSign className="h-4 w-4" />
                  )}
                  Aplicar Desconto ({selectedProducts.length})
                </Button>
              )}
            </div>
          </div>

          {/* Error state */}
          {productsError && (
            <div className="p-8 text-center">
              <div className="text-destructive mb-2">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                <h3 className="text-lg font-semibold">
                  Erro ao carregar produtos
                </h3>
                <p className="text-sm text-muted-foreground">
                  Não foi possível conectar ao servidor. Verifique sua conexão.
                </p>
              </div>
            </div>
          )}

          {/* Loading state */}
          {productsLoading ? (
            <div className="p-8">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-muted animate-pulse rounded w-1/4"></div>
                      <div className="h-3 bg-muted animate-pulse rounded w-1/2"></div>
                    </div>
                    <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
                    <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <ProductsTable
              products={products}
              selectedProducts={selectedProducts}
              onSelectProducts={setSelectedProducts}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
            />
          )}
        </Card>
      </main>

      <ProductModal
        open={isProductModalOpen}
        onOpenChange={setIsProductModalOpen}
        product={selectedProduct}
        onSave={handleSaveProduct}
      />

      <DiscountModal
        open={isDiscountModalOpen}
        onOpenChange={setIsDiscountModalOpen}
        onSave={handleSaveDiscount}
        productsCount={selectedProducts.length}
      />
    </div>
  );
};

export default Dashboard;
