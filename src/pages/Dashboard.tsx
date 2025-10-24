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
  RotateCcw,
  ArrowLeft,
  TruckIcon,
} from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProductsTable } from "@/components/dashboard/ProductsTable";
import { ProductModal } from "@/components/dashboard/ProductModal";
import { ProductDetailsModal } from "@/components/dashboard/ProductDetailsModal";
import { DiscountModal } from "@/components/dashboard/DiscountModal";
import { IncreasePriceModal } from "@/components/dashboard/IncreasePriceModal";
import { DeleteConfirmModal } from "@/components/dashboard/DeleteConfirmModal";
import { StatsCards } from "@/components/dashboard/StatsCards";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useApplyDiscount,
  useRevertDiscount,
  useIncreasePrice,
} from "@/hooks/useProducts";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useLogout, useCurrentUser } from "@/hooks/useAuth";
import {
  type Product,
  type CreateProductRequest,
  type UpdateProductRequest,
} from "@/services/api.product";
import imgLogo from "../assets/smh_sistemas_logo.jpg";
import {
  useLPU,
  useAddProductToLPU,
  useRemoveProductFromLPU,
} from "@/hooks/useLPUs";

const Dashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { lpuId } = useParams<{ lpuId: string }>();
  const location = useLocation();

  // Buscar informações da LPU se houver lpuId
  const {
    data: lpuData,
    isLoading: lpuLoading,
    refetch: refetchLPU,
    isFetching: lpuFetching,
  } = useLPU(lpuId ? parseInt(lpuId) : null);
  // Sempre usar lpuData do React Query para garantir dados atualizados
  const currentLPU = lpuData;

  // Hooks do React Query
  const {
    data: allProducts = [],
    isLoading: productsLoading,
    error: productsError,
  } = useProducts();

  // Se estiver visualizando uma LPU específica, mostrar apenas seus produtos
  const products = lpuId && currentLPU ? currentLPU.products : allProducts;
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: user } = useCurrentUser();

  // Mutations para produtos diretos
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  const applyDiscountMutation = useApplyDiscount();
  const revertDiscountMutation = useRevertDiscount();
  const increasePriceMutation = useIncreasePrice();

  // Mutations para produtos dentro de LPU
  const addProductToLPUMutation = useAddProductToLPU();
  const removeProductFromLPUMutation = useRemoveProductFromLPU();

  const logoutMutation = useLogout();

  // Estados locais
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isIncreasePriceModalOpen, setIsIncreasePriceModalOpen] =
    useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsProductModalOpen(true);
  };

  const handleRefresh = async () => {
    if (lpuId && !isRefreshing) {
      setIsRefreshing(true);
      try {
        // Refetch da LPU para atualizar lista de produtos
        await refetchLPU();
      } finally {
        // Manter animação por pelo menos 500ms para feedback visual
        setTimeout(() => {
          setIsRefreshing(false);
        }, 500);
      }
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleViewProduct = (product: Product) => {
    setViewProduct(product);
    setIsDetailsModalOpen(true);
  };

  const handleSaveProduct = (
    productData: CreateProductRequest | UpdateProductRequest
  ) => {
    if (selectedProduct && "id" in productData) {
      // Atualizar produto existente - sempre usa API de produtos diretamente
      // A invalidação do cache é feita automaticamente pelo hook useUpdateProduct
      updateProductMutation.mutate(productData as UpdateProductRequest, {
        onSuccess: () => {
          // Fechar modal apenas após sucesso
          setIsProductModalOpen(false);
        },
      });
    } else if (lpuId && currentLPU) {
      // Criar novo produto e adicionar à LPU usando o endpoint /add-product
      const createRequest = productData as CreateProductRequest;
      addProductToLPUMutation.mutate(
        {
          lpuId: parseInt(lpuId),
          newProduct: {
            name: createRequest.name,
            imgUrl: createRequest.imgUrl,
            description: createRequest.description,
            ncm: createRequest.ncm,
            stockQuantity: createRequest.stockQuantity,
            cost: createRequest.cost,
            profitMargin: createRequest.profitMargin,
            price: createRequest.price,
            category: createRequest.category,
            type: createRequest.type as any,
            status: createRequest.status as any,
          },
        },
        {
          onSuccess: () => {
            // Fechar modal apenas após sucesso
            setIsProductModalOpen(false);
          },
        }
      );
    } else {
      // Criar novo produto fora do contexto de LPU
      createProductMutation.mutate(productData as CreateProductRequest, {
        onSuccess: () => {
          // Fechar modal apenas após sucesso
          setIsProductModalOpen(false);
        },
      });
    }
  };

  const handleDeleteProduct = (id: number) => {
    // Encontrar o produto para mostrar no modal
    const product = products.find((p) => p.id === id);
    setProductToDelete((product as Product) || null);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      if (lpuId && currentLPU) {
        // Estamos no contexto de uma LPU - remover produto da LPU
        removeProductFromLPUMutation.mutate({
          lpuId: parseInt(lpuId),
          productId: productToDelete.id,
        });
      } else {
        // Contexto normal - deletar produto diretamente
        deleteProductMutation.mutate(productToDelete.id);
      }
      setProductToDelete(null);
    }
  };

  const handleApplyDiscount = () => {
    if (selectedProducts.length > 0) {
      setIsDiscountModalOpen(true);
    }
  };

  const handleSaveDiscount = (discount: number) => {
    applyDiscountMutation.mutate({
      productIds: selectedProducts,
      discountPercentage: discount,
    });
    setSelectedProducts([]);
    setIsDiscountModalOpen(false);
  };

  const handleRevertDiscount = () => {
    if (selectedProducts.length > 0) {
      revertDiscountMutation.mutate(selectedProducts);
      setSelectedProducts([]);
    }
  };

  const handleIncreasePrice = () => {
    if (selectedProducts.length > 0) {
      setIsIncreasePriceModalOpen(true);
    }
  };

  const handleSaveIncreasePrice = (increasePercentage: number) => {
    increasePriceMutation.mutate({
      productIds: selectedProducts,
      increasePercentage,
    });
    setSelectedProducts([]);
    setIsIncreasePriceModalOpen(false);
  };

  // Usar dados do back-end ou calcular localmente como fallback
  const totalProducts = stats?.totalProducts ?? products.length;
  const totalValue =
    stats?.totalValue ??
    products.reduce(
      (sum, p) => sum + p.price * ("stockQuantity" in p ? p.stockQuantity : 0),
      0
    );
  const lowStockProducts =
    stats?.lowStockProducts ??
    products.filter((p) =>
      "stockQuantity" in p ? p.stockQuantity < 10 : false
    ).length;

  // Estados de loading - considerar lpuLoading se estiver visualizando uma LPU
  const isLoading =
    productsLoading || statsLoading || (lpuId ? lpuLoading : false);
  const isMutating =
    createProductMutation.isPending ||
    updateProductMutation.isPending ||
    deleteProductMutation.isPending ||
    applyDiscountMutation.isPending ||
    revertDiscountMutation.isPending ||
    increasePriceMutation.isPending ||
    addProductToLPUMutation.isPending ||
    removeProductFromLPUMutation.isPending ||
    logoutMutation.isPending;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-10 border-b-4 border-primary bg-background shadow-lg">
        <div className="flex h-16 items-center justify-between px-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              title="Voltar para LPUs"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white overflow-hidden">
              <img
                src={imgLogo}
                alt="SMH Sistemas Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">
                {currentLPU ? currentLPU.name : "SMH Sistemas"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {currentLPU ? "Produtos da LPU" : "Dashboard de Produtos"}
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
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg"
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
              variant="default"
              onClick={() => navigate("/pedidos")}
              className="gap-2"
            >
              <TruckIcon className="h-4 w-4" />
              Pedidos
            </Button>
            <Button
              variant="outline"
              onClick={() => logoutMutation.mutate()}
              className="gap-2 border-2 border-gray-300 hover:bg-gray-100 hover:border-gray-400 text-gray-700 font-medium"
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
            onClick={() => navigate("/pedidos")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Gestão de Pedidos
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
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-card-foreground">
                    Lista de Produtos
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Gerencie seu catálogo de produtos
                  </p>
                </div>
                {lpuId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefresh}
                    title="Atualizar lista de produtos"
                    disabled={isRefreshing || lpuLoading}
                    className="gap-2 hover:bg-blue-50"
                  >
                    <RotateCcw
                      className={`h-4 w-4 text-blue-600 transition-transform duration-500 ${
                        isRefreshing ? "animate-spin" : ""
                      }`}
                    />
                    <span className="text-sm text-blue-600">Atualizar</span>
                  </Button>
                )}
              </div>
              {selectedProducts.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleApplyDiscount}
                    className="gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold shadow-lg"
                    disabled={isMutating}
                  >
                    {applyDiscountMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <DollarSign className="h-4 w-4" />
                    )}
                    Aplicar Desconto ({selectedProducts.length})
                  </Button>
                  <Button
                    onClick={handleRevertDiscount}
                    className="gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold shadow-lg"
                    disabled={isMutating}
                  >
                    {revertDiscountMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RotateCcw className="h-4 w-4" />
                    )}
                    Reverter Desconto ({selectedProducts.length})
                  </Button>
                  <Button
                    onClick={handleIncreasePrice}
                    className="gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg"
                    disabled={isMutating}
                  >
                    {increasePriceMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <TrendingUp className="h-4 w-4" />
                    )}
                    Aumentar Preço ({selectedProducts.length})
                  </Button>
                </div>
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
              products={products as Product[]}
              selectedProducts={selectedProducts}
              onSelectProducts={setSelectedProducts}
              onEdit={handleEditProduct}
              onDelete={handleDeleteProduct}
              onView={handleViewProduct}
            />
          )}
        </Card>
      </main>

      <ProductModal
        open={isProductModalOpen}
        onOpenChange={setIsProductModalOpen}
        product={selectedProduct}
        onSave={handleSaveProduct}
        isLoading={
          createProductMutation.isPending ||
          updateProductMutation.isPending ||
          addProductToLPUMutation.isPending
        }
        currentLPUId={lpuId ? parseInt(lpuId) : undefined}
        onAddExistingProduct={(productId) => {
          if (lpuId && addProductToLPUMutation) {
            addProductToLPUMutation.mutate({
              lpuId: parseInt(lpuId),
              productIds: [productId], // Enviar como array
            });
          }
        }}
      />

      <ProductDetailsModal
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        product={viewProduct}
      />

      <DiscountModal
        open={isDiscountModalOpen}
        onOpenChange={setIsDiscountModalOpen}
        onSave={handleSaveDiscount}
        productsCount={selectedProducts.length}
      />

      <IncreasePriceModal
        open={isIncreasePriceModalOpen}
        onOpenChange={setIsIncreasePriceModalOpen}
        onSave={handleSaveIncreasePrice}
        productsCount={selectedProducts.length}
      />

      <DeleteConfirmModal
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        onConfirm={handleConfirmDelete}
        productName={productToDelete?.name}
      />
    </div>
  );
};

export default Dashboard;
