import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  PackagePlus,
  Package,
  Search,
  Calculator,
} from "lucide-react";
import type {
  Product,
  CreateProductRequest,
  UpdateProductRequest,
  ProductType,
  ProductStatus,
} from "@/services/api.product";
import { useProducts } from "@/hooks/useProducts";
import { useLPUs } from "@/hooks/useLPUs";

type ProductModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSave: (product: CreateProductRequest | UpdateProductRequest) => void;
  isLoading?: boolean;
  currentLPUId?: number; // ID da LPU atual para filtrar produtos
  onAddExistingProduct?: (productId: number) => void; // Callback para adicionar produto existente
};

export const ProductModal = ({
  open,
  onOpenChange,
  product,
  onSave,
  isLoading = false,
  currentLPUId,
  onAddExistingProduct,
}: ProductModalProps) => {
  const [mode, setMode] = useState<"new" | "existing">("new");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(
    null
  );
  const [selectedSourceLPUId, setSelectedSourceLPUId] = useState<number | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [formData, setFormData] = useState<
    CreateProductRequest & { id?: number }
  >({
    name: "",
    imgUrl: "",
    description: "",
    ncm: "",
    stockQuantity: 0,
    cost: 0,
    profitMargin: 0,
    price: 0,
    category: "",
    type: "PRODUCT" as ProductType,
    status: "AVAILABLE" as ProductStatus,
  });

  const [imagePreview, setImagePreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Buscar todos os produtos e LPUs para modo "adicionar existente"
  const { data: allProducts = [] } = useProducts();
  const { data: allLPUs = [] } = useLPUs();

  // Calcular automaticamente o preço de venda com base no custo e margem de lucro
  // Fórmula: Preço de Venda = Custo + (Custo × Margem de Lucro / 100)
  useEffect(() => {
    const { cost, profitMargin } = formData;
    if (cost > 0 && profitMargin >= 0) {
      const calculatedPrice = cost + (cost * profitMargin) / 100;
      setFormData((prev) => ({
        ...prev,
        price: parseFloat(calculatedPrice.toFixed(2)),
      }));
    } else if (cost === 0) {
      setFormData((prev) => ({ ...prev, price: 0 }));
    }
  }, [formData.cost, formData.profitMargin]);

  // Filtrar LPUs disponíveis (excluir a LPU atual)
  const availableLPUs = currentLPUId
    ? allLPUs.filter((lpu) => lpu.id !== currentLPUId)
    : allLPUs;

  // Filtrar produtos da LPU selecionada
  const productsFromSelectedLPU = selectedSourceLPUId
    ? allLPUs
        .find((lpu) => lpu.id === selectedSourceLPUId)
        ?.products.filter((lpuProduct) => {
          // Verificar se o produto já está na LPU atual
          const currentLPU = allLPUs.find((lpu) => lpu.id === currentLPUId);
          const isInCurrentLPU = currentLPU?.products.some(
            (p) => p.productId === lpuProduct.productId
          );
          return !isInCurrentLPU;
        }) || []
    : [];

  // Aplicar filtro de busca nos produtos
  const filteredProducts = productsFromSelectedLPU.filter((p) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(search) ||
      p.ncm.toLowerCase().includes(search) ||
      p.description?.toLowerCase().includes(search)
    );
  });

  useEffect(() => {
    if (product) {
      setMode("new"); // Se está editando, sempre modo "novo"
      setFormData({
        id: product.id,
        productId: product.productId,
        name: product.name,
        imgUrl: product.imgUrl || "",
        description: product.description,
        ncm: product.ncm,
        stockQuantity: product.stockQuantity,
        cost: 0, // Produto existente pode não ter custo, usar 0 como padrão
        profitMargin: 0, // Produto existente pode não ter margem, usar 0 como padrão
        price: product.price,
        category: product.category,
        type: product.type,
        status: product.status,
      });
      setImagePreview(product.imgUrl || "");
    } else {
      setMode("new"); // Resetar para modo "novo" ao abrir
      setSelectedProductId(null);
      setSelectedSourceLPUId(null);
      setSearchTerm("");
      setFormData({
        name: "",
        imgUrl: "",
        description: "",
        ncm: "",
        stockQuantity: 0,
        cost: 0,
        profitMargin: 0,
        price: 0,
        category: "",
        type: "PRODUCT" as ProductType,
        status: "AVAILABLE" as ProductStatus,
      });
      setImagePreview("");
    }
  }, [product, open]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione apenas arquivos de imagem.");
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem deve ter no máximo 5MB.");
      return;
    }

    // Converter para base64
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
      setFormData({ ...formData, imgUrl: base64String });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview("");
    setFormData({ ...formData, imgUrl: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? "Editar Produto" : "Adicionar Produto"}
          </DialogTitle>
          <DialogDescription>
            {product
              ? "Atualize as informações do produto"
              : "Escolha entre criar um novo produto ou adicionar um produto existente"}
          </DialogDescription>
        </DialogHeader>

        {/* Seletor de modo: apenas quando não está editando e está em contexto de LPU */}
        {!product && currentLPUId && onAddExistingProduct && (
          <div className="py-4 border-b">
            <RadioGroup
              value={mode}
              onValueChange={(value) => setMode(value as "new" | "existing")}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="new" id="mode-new" />
                <Label
                  htmlFor="mode-new"
                  className="flex items-center gap-2 cursor-pointer font-medium"
                >
                  <PackagePlus className="h-4 w-4" />
                  Criar Novo Produto
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="existing" id="mode-existing" />
                <Label
                  htmlFor="mode-existing"
                  className="flex items-center gap-2 cursor-pointer font-medium"
                >
                  <Package className="h-4 w-4" />
                  Adicionar Existente
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Modo: Adicionar produto existente */}
        {mode === "existing" &&
        !product &&
        currentLPUId &&
        onAddExistingProduct ? (
          <div className="py-4 space-y-4">
            {/* Seletor de LPU de Origem */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                1. Selecione a LPU de Origem *
              </Label>
              <p className="text-xs text-muted-foreground mb-2">
                Escolha de qual LPU você deseja buscar produtos
              </p>
              <Select
                value={selectedSourceLPUId?.toString() || ""}
                onValueChange={(value) => {
                  setSelectedSourceLPUId(value ? parseInt(value) : null);
                  setSelectedProductId(null); // Resetar produto selecionado
                  setSearchTerm(""); // Resetar busca
                }}
              >
                <SelectTrigger className="border-2 border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                  <SelectValue placeholder="Selecione uma LPU..." />
                </SelectTrigger>
                <SelectContent>
                  {availableLPUs.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Nenhuma outra LPU disponível
                    </div>
                  ) : (
                    availableLPUs.map((lpu) => (
                      <SelectItem key={lpu.id} value={lpu.id.toString()}>
                        <div className="flex items-center justify-between gap-3 w-full">
                          <span className="font-medium">{lpu.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({lpu.products.length} produtos)
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Campo de Busca e Lista de Produtos */}
            {selectedSourceLPUId && (
              <>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">
                    2. Buscar e Selecionar Produto *
                  </Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Pesquise por nome, NCM ou descrição
                  </p>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Digite para buscar... (ex: Controlador, 8537.10.90)"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="border-2 border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Produtos Disponíveis
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      {filteredProducts.length}{" "}
                      {filteredProducts.length === 1 ? "produto" : "produtos"}
                    </span>
                  </div>

                  {productsFromSelectedLPU.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                      <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="font-medium">
                        Nenhum produto disponível nesta LPU
                      </p>
                      <p className="text-xs mt-1">
                        Todos os produtos desta LPU já estão na sua lista atual
                      </p>
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                      <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="font-medium">Nenhum produto encontrado</p>
                      <p className="text-xs mt-1">
                        Tente ajustar o termo de busca
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-3 max-h-[40vh] overflow-y-auto pr-2">
                      {filteredProducts.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => setSelectedProductId(p.productId)}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                            selectedProductId === p.productId
                              ? "border-primary bg-primary/5 shadow-md"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm truncate">
                                {p.name}
                              </h4>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {p.description}
                              </p>
                              <div className="flex items-center gap-3 mt-2 text-xs flex-wrap">
                                <span className="text-muted-foreground">
                                  NCM: {p.ncm}
                                </span>
                                <span className="text-muted-foreground">
                                  Qtd: {p.stockQuantity}
                                </span>
                                <span className="font-medium text-green-600">
                                  R$ {p.price.toFixed(2)}
                                </span>
                                {p.category && (
                                  <span className="text-muted-foreground">
                                    {p.category}
                                  </span>
                                )}
                              </div>
                            </div>
                            {p.imgUrl && (
                              <img
                                src={p.imgUrl}
                                alt={p.name}
                                className="w-16 h-16 object-cover rounded shrink-0"
                              />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (selectedProductId && onAddExistingProduct) {
                    onAddExistingProduct(selectedProductId);
                    onOpenChange(false);
                  }
                }}
                disabled={!selectedProductId || isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  <>Adicionar Produto Selecionado</>
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          /* Modo: Criar novo produto ou editar */
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6 py-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold">
                    Nome do Produto *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    placeholder="Ex: Controlador PLC"
                    className="border-2 border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ncm" className="text-sm font-semibold">
                    NCM *
                  </Label>
                  <Input
                    id="ncm"
                    value={formData.ncm}
                    onChange={(e) =>
                      setFormData({ ...formData, ncm: e.target.value })
                    }
                    required
                    placeholder="Ex: 8537.10.90"
                    className="border-2 border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image" className="text-sm font-semibold">
                  Imagem do Produto
                </Label>
                <div className="space-y-3">
                  {/* Área de upload */}
                  <div
                    className={`relative border-2 border-dashed rounded-lg transition-colors ${
                      imagePreview
                        ? "border-blue-500 bg-blue-50"
                        : "border-blue-300 bg-gray-50 hover:border-blue-500 hover:bg-blue-50"
                    }`}
                  >
                    {imagePreview ? (
                      // Preview da imagem
                      <div className="relative w-full h-48 p-2">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-contain rounded"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <Button
                          type="button"
                          size="sm"
                          className="absolute top-3 right-3 h-8 w-8 p-0 bg-red-600 hover:bg-red-700 text-white"
                          onClick={handleRemoveImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      // Área de upload
                      <label
                        htmlFor="image"
                        className="flex flex-col items-center justify-center w-full h-48 cursor-pointer"
                      >
                        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                          <Upload className="h-10 w-10" />
                          <div className="text-center">
                            <p className="text-sm font-medium">
                              Clique para fazer upload
                            </p>
                            <p className="text-xs mt-1">
                              PNG, JPG, GIF até 5MB
                            </p>
                          </div>
                        </div>
                      </label>
                    )}
                    <input
                      ref={fileInputRef}
                      id="image"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>

                  {/* Botão alternativo para trocar imagem */}
                  {imagePreview && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full border-2 border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Trocar Imagem
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-semibold">
                  Descrição
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Descrição detalhada do produto"
                  rows={3}
                  className="border-2 border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm font-semibold">
                    Tipo *
                  </Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: ProductType) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger className="border-2 border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PRODUCT">Produto</SelectItem>
                      <SelectItem value="SERVICE">Serviço</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-semibold">
                    Status *
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: ProductStatus) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger className="border-2 border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AVAILABLE">Disponível</SelectItem>
                      <SelectItem value="RESERVED">Reservado</SelectItem>
                      <SelectItem value="SOLD">Vendido</SelectItem>
                      <SelectItem value="OUT_OF_STOCK">Sem Estoque</SelectItem>
                      <SelectItem value="DISCONTINUED">
                        Descontinuado
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cost" className="text-sm font-semibold">
                    Custo (R$) *
                  </Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cost: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                    min="0"
                    placeholder="0.00"
                    className="border-2 border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="profitMargin"
                    className="text-sm font-semibold"
                  >
                    Margem de Lucro (%) *
                  </Label>
                  <Input
                    id="profitMargin"
                    type="number"
                    step="0.01"
                    value={formData.profitMargin}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profitMargin: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                    min="0"
                    // max="100"
                    placeholder="0.00"
                    className="border-2 border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="price"
                    className="text-sm font-semibold flex items-center gap-2"
                  >
                    <Calculator className="h-4 w-4 text-green-600" />
                    Preço de Venda (R$) *

                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    readOnly
                    required
                    min="0"
                    placeholder="0.00"
                    className="border-2 border-green-300 bg-green-50 text-green-900 font-semibold cursor-not-allowed focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="stockQuantity"
                    className="text-sm font-semibold"
                  >
                    Quantidade em Estoque *
                  </Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stockQuantity: parseInt(e.target.value) || 0,
                      })
                    }
                    required
                    min="0"
                    placeholder="0"
                    className="border-2 border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="border-2 border-gray-300 hover:bg-gray-100 hover:border-gray-400 text-gray-700"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {product ? "Atualizando..." : "Criando..."}
                  </>
                ) : (
                  <>{product ? "Atualizar" : "Criar"} Produto</>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
