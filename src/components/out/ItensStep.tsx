import { useState, useEffect } from "react";
import { Search, Trash2, Package, Info, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ItemSaida } from "@/types/saida";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLPUs } from "@/hooks/useLPUs";
import { useProducts } from "@/hooks/useProducts";
import { useTaxes } from "@/hooks/useTaxes";
import { Alert, AlertDescription } from "@/components/ui/alert";

type ItensStepProps = {
  itens: ItemSaida[];
  onUpdateItens: (itens: ItemSaida[]) => void;
  selectedTaxId: number | null;
  onSelectTax: (taxId: number | null) => void;
};

export const ItensStep = ({
  itens,
  onUpdateItens,
  selectedTaxId,
  onSelectTax,
}: ItensStepProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLPUId, setSelectedLPUId] = useState<string>("all");

  // Buscar LPUs, produtos e impostos
  const { data: lpus = [], isLoading: lpusLoading } = useLPUs();
  const { data: allProducts = [], isLoading: productsLoading } = useProducts();
  const { data: taxes = [], isLoading: taxesLoading } = useTaxes();

  // Determinar tipo de imposto baseado nos itens
  const hasProducts = itens.some((item) => item.productType === "PRODUCT");
  const hasServices = itens.some((item) => item.productType === "SERVICE");
  const shouldUseEmpreitadaGlobal = hasProducts && hasServices;

  // Filtrar impostos disponíveis
  const availableTaxes = shouldUseEmpreitadaGlobal
    ? taxes.filter((tax) => tax.type === "EMPREITADA_GLOBAL")
    : taxes.filter((tax) => tax.type === "ICMS" || tax.type === "ISS");

  // Buscar imposto selecionado
  const selectedTax = taxes.find((tax) => tax.id === selectedTaxId);

  // Determinar produtos disponíveis
  const availableProducts =
    selectedLPUId === "all"
      ? allProducts
      : lpus
          .find((lpu) => lpu.id.toString() === selectedLPUId)
          ?.products.map((p) => ({
            ...p,
            id: p.productId, // Garantir compatibilidade
          })) || [];

  // Filtrar produtos por busca
  const filteredProdutos = availableProducts.filter(
    (produto) =>
      produto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.ncm.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddItem = (produtoId: number) => {
    const produto = availableProducts.find(
      (p) => p.id === produtoId || p.productId === produtoId
    );
    if (!produto) return;

    const itemExistente = itens.find(
      (i) => i.produtoId === produto.id.toString()
    );
    if (itemExistente) {
      // Incrementa quantidade
      const novaQuantidade = Math.min(
        itemExistente.quantidade + 1,
        itemExistente.quantidadeDisponivel
      );
      const novoSubtotal = novaQuantidade * itemExistente.precoUnitario;

      onUpdateItens(
        itens.map((i) =>
          i.produtoId === produto.id.toString()
            ? {
                ...i,
                quantidade: novaQuantidade,
                subtotal: novoSubtotal,
              }
            : i
        )
      );
    } else {
      // Adiciona novo item
      const novoItem: ItemSaida = {
        id: Date.now().toString(),
        produtoId: produto.id.toString(),
        sku: produto.ncm,
        nome: produto.name,
        unidade: "UN",
        precoUnitario: produto.price,
        quantidade: 1,
        quantidadeDisponivel: produto.stockQuantity || 0,
        subtotal: produto.price,
        productType: produto.type as "PRODUCT" | "SERVICE",
      };
      onUpdateItens([...itens, novoItem]);
    }
  };

  const handleUpdateQuantidade = (itemId: string, quantidade: number) => {
    onUpdateItens(
      itens.map((i) => {
        if (i.id === itemId) {
          const novaQuantidade = Math.max(
            1,
            Math.min(quantidade, i.quantidadeDisponivel)
          );
          const novoSubtotal = novaQuantidade * i.precoUnitario;

          return {
            ...i,
            quantidade: novaQuantidade,
            subtotal: novoSubtotal,
          };
        }
        return i;
      })
    );
  };

  const handleRemoveItem = (itemId: string) => {
    onUpdateItens(itens.filter((i) => i.id !== itemId));
  };

  // Calcular totais
  const valorSubtotal = itens.reduce((sum, item) => sum + item.subtotal, 0);
  const valorTotalImpostos = selectedTax
    ? (valorSubtotal * selectedTax.percentage) / 100
    : 0;
  const valorTotal = valorSubtotal + valorTotalImpostos;

  const isLoading = lpusLoading || productsLoading || taxesLoading;

  return (
    <div className="space-y-4">
      {/* Seletor de LPU */}
      <div className="space-y-2">
        <Label htmlFor="lpu-select">Filtrar por LPU</Label>
        <Select
          value={selectedLPUId}
          onValueChange={setSelectedLPUId}
          disabled={isLoading}
        >
          <SelectTrigger id="lpu-select">
            <SelectValue placeholder="Selecione uma LPU" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">📦 Todos os Produtos</SelectItem>
            {lpus.map((lpu) => (
              <SelectItem key={lpu.id} value={lpu.id.toString()}>
                {lpu.name} ({lpu.products.length} produtos)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedLPUId !== "all" && (
          <p className="text-xs text-muted-foreground">
            Mostrando produtos da LPU selecionada
          </p>
        )}
      </div>

      {/* Alerta sobre tipo de pedido */}
      {itens.length > 0 && (
        <Alert
          className={
            shouldUseEmpreitadaGlobal
              ? "bg-amber-50 border-amber-200"
              : "bg-blue-50 border-blue-200"
          }
        >
          <Info
            className={
              shouldUseEmpreitadaGlobal
                ? "h-4 w-4 text-amber-600"
                : "h-4 w-4 text-blue-600"
            }
          />
          <AlertDescription
            className={
              shouldUseEmpreitadaGlobal ? "text-amber-800" : "text-blue-800"
            }
          >
            {shouldUseEmpreitadaGlobal ? (
              <>
                <strong>Venda Casada (Produtos + Serviços):</strong> Este pedido
                contém produtos e serviços. Apenas impostos do tipo{" "}
                <strong>EMPREITADA_GLOBAL</strong> podem ser aplicados sobre o
                valor total.
              </>
            ) : hasProducts ? (
              <>
                <strong>Apenas Produtos:</strong> Você pode aplicar impostos dos
                tipos <strong>ICMS</strong> ou <strong>ISS</strong> sobre o
                valor total.
              </>
            ) : (
              <>
                <strong>Apenas Serviços:</strong> Você pode aplicar impostos dos
                tipos <strong>ICMS</strong> ou <strong>ISS</strong> sobre o
                valor total.
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Impostos Disponíveis */}
      {availableTaxes.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-blue-900">
              <Receipt className="h-4 w-4" />
              Impostos Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {availableTaxes.map((tax) => (
                <div
                  key={tax.id}
                  className="flex items-center justify-between p-2 bg-white rounded border border-blue-200"
                >
                  <div className="flex-1">
                    <div className="text-xs font-medium text-blue-900">
                      {tax.type === "EMPREITADA_GLOBAL" &&
                        "🏗️ Empreitada Global"}
                      {tax.type === "ICMS" && "📦 ICMS"}
                      {tax.type === "ISS" && "🔧 ISS"}
                      {tax.type === "OUTRO" && "📋 Outro"}
                    </div>
                    {tax.description && (
                      <div className="text-xs text-muted-foreground truncate">
                        {tax.description}
                      </div>
                    )}
                  </div>
                  <Badge variant="secondary" className="ml-2 shrink-0">
                    {tax.percentage}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Busca de produtos */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar produto por nome ou NCM..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
          disabled={isLoading}
        />
      </div>

      {/* Resultados da busca */}
      {isLoading ? (
        <Card className="p-8">
          <div className="text-center text-muted-foreground">
            Carregando produtos...
          </div>
        </Card>
      ) : (
        searchTerm && (
          <Card className="p-4 max-h-60 overflow-y-auto">
            <div className="space-y-2">
              {filteredProdutos.length === 0 ? (
                <div className="text-center text-muted-foreground py-4">
                  Nenhum produto encontrado
                </div>
              ) : (
                filteredProdutos.map((produto) => (
                  <div
                    key={produto.id || produto.productId}
                    className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-md cursor-pointer transition-colors"
                    onClick={() =>
                      handleAddItem(produto.id || produto.productId)
                    }
                  >
                    <div className="flex-1">
                      <div className="font-semibold flex items-center gap-2">
                        {produto.name}
                        {produto.imgUrl && (
                          <Package className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        NCM: {produto.ncm} • Estoque:{" "}
                        {produto.stockQuantity || 0} UN
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-700">
                        {produto.price.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {produto.category}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        )
      )}

      {/* Tabela de itens adicionados */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>NCM</TableHead>
              <TableHead>Produto</TableHead>
              <TableHead className="text-center">Tipo</TableHead>
              <TableHead className="text-right">Preço Unit.</TableHead>
              <TableHead className="text-center">Qtd.</TableHead>
              <TableHead className="text-right">Disponível</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itens.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground py-8"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Package className="h-10 w-10 text-muted-foreground/50" />
                    <p>Nenhum item adicionado</p>
                    <p className="text-xs">
                      {selectedLPUId === "all"
                        ? "Selecione uma LPU ou busque produtos para adicionar"
                        : "Busque produtos para adicionar ao pedido"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              itens.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs">
                    {item.sku}
                  </TableCell>
                  <TableCell className="font-medium">{item.nome}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        item.productType === "SERVICE" ? "default" : "secondary"
                      }
                      className={
                        item.productType === "SERVICE"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }
                    >
                      {item.productType === "SERVICE" ? "Serviço" : "Produto"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-green-700 font-semibold">
                    {item.precoUnitario.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={1}
                      max={item.quantidadeDisponivel}
                      value={item.quantidade}
                      onChange={(e) =>
                        handleUpdateQuantidade(
                          item.id,
                          parseInt(e.target.value) || 1
                        )
                      }
                      className="w-20 text-center"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={
                        item.quantidadeDisponivel < 10
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {item.quantidadeDisponivel} {item.unidade}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold text-primary">
                    {item.subtotal.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(item.id)}
                      className="hover:bg-red-100 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Seletor de Imposto Global */}
      {itens.length > 0 && availableTaxes.length > 0 && (
        <Card className="border-purple-200 bg-purple-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-purple-900">
              <Receipt className="h-4 w-4" />
              Selecionar Imposto do Pedido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="tax-select">
                Imposto aplicado sobre o valor total
              </Label>
              <Select
                value={selectedTaxId?.toString() || "none"}
                onValueChange={(value) =>
                  onSelectTax(value === "none" ? null : parseInt(value))
                }
              >
                <SelectTrigger id="tax-select">
                  <SelectValue placeholder="Selecione um imposto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem imposto</SelectItem>
                  {availableTaxes.map((tax) => (
                    <SelectItem key={tax.id} value={tax.id.toString()}>
                      {tax.type === "EMPREITADA_GLOBAL" &&
                        "🏗️ Empreitada Global"}
                      {tax.type === "ICMS" && "📦 ICMS"}
                      {tax.type === "ISS" && "🔧 ISS"}
                      {tax.type === "OUTRO" && "📋 Outro"} - {tax.percentage}%
                      {tax.description && ` (${tax.description})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTax && (
                <p className="text-xs text-muted-foreground">
                  Este imposto será aplicado sobre o valor total de R${" "}
                  {valorSubtotal.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumo do Pedido */}
      {itens.length > 0 && (
        <Card className="bg-linear-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-base">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-semibold text-gray-700">
                  {valorSubtotal.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
              <div className="flex justify-between items-center text-base">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Total de Impostos:
                </span>
                <span className="font-semibold text-amber-700">
                  {valorTotalImpostos > 0 ? "+" : ""}
                  {valorTotalImpostos.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
              <div className="pt-3 border-t border-primary/20">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-primary">
                    Valor Total:
                  </span>
                  <span className="text-3xl font-bold text-primary">
                    {valorTotal.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
