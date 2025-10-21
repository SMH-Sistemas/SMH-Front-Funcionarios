import { useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ItemSaida } from "@/types/saida";
import { mockProdutosEstoque } from "@/data/mockSaidas";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ItensStepProps = {
  itens: ItemSaida[];
  onUpdateItens: (itens: ItemSaida[]) => void;
};

export const ItensStep = ({ itens, onUpdateItens }: ItensStepProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProdutos = mockProdutosEstoque.filter(
    (produto) =>
      produto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddItem = (produtoId: string) => {
    const produto = mockProdutosEstoque.find((p) => p.id === produtoId);
    if (!produto) return;

    const itemExistente = itens.find((i) => i.produtoId === produtoId);
    if (itemExistente) {
      // Incrementa quantidade se já existe
      onUpdateItens(
        itens.map((i) =>
          i.produtoId === produtoId
            ? {
                ...i,
                quantidade: Math.min(
                  i.quantidade + 1,
                  i.quantidadeDisponivel
                ),
                subtotal:
                  Math.min(i.quantidade + 1, i.quantidadeDisponivel) *
                  i.precoUnitario,
              }
            : i
        )
      );
    } else {
      // Adiciona novo item
      const novoItem: ItemSaida = {
        id: Date.now().toString(),
        produtoId: produto.id,
        sku: produto.sku,
        nome: produto.name,
        unidade: "UN",
        precoUnitario: produto.price * (1 - produto.discount / 100),
        quantidade: 1,
        quantidadeDisponivel: produto.stock,
        subtotal: produto.price * (1 - produto.discount / 100),
      };
      onUpdateItens([...itens, novoItem]);
    }
  };

  const handleUpdateQuantidade = (itemId: string, quantidade: number) => {
    onUpdateItens(
      itens.map((i) =>
        i.id === itemId
          ? {
              ...i,
              quantidade: Math.max(
                1,
                Math.min(quantidade, i.quantidadeDisponivel)
              ),
              subtotal:
                Math.max(1, Math.min(quantidade, i.quantidadeDisponivel)) *
                i.precoUnitario,
            }
          : i
      )
    );
  };

  const handleRemoveItem = (itemId: string) => {
    onUpdateItens(itens.filter((i) => i.id !== itemId));
  };

  const valorTotal = itens.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar produto por nome ou SKU"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {searchTerm && (
        <Card className="p-4 max-h-60 overflow-y-auto">
          <div className="space-y-2">
            {filteredProdutos.map((produto) => (
              <div
                key={produto.id}
                className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-md cursor-pointer"
                onClick={() => handleAddItem(produto.id)}
              >
                <div className="flex-1">
                  <div className="font-semibold">{produto.name}</div>
                  <div className="text-sm text-muted-foreground">
                    SKU: {produto.sku} • Estoque: {produto.stock} UN
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {(
                      produto.price *
                      (1 - produto.discount / 100)
                    ).toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </div>
                  {produto.discount > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      -{produto.discount}%
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Produto</TableHead>
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
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Nenhum item adicionado. Use a busca acima para adicionar produtos.
                </TableCell>
              </TableRow>
            ) : (
              itens.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.sku}</TableCell>
                  <TableCell>{item.nome}</TableCell>
                  <TableCell className="text-right">
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
                    <Badge variant="secondary">
                      {item.quantidadeDisponivel} {item.unidade}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
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

      {itens.length > 0 && (
        <div className="flex justify-end">
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Valor Total</div>
            <div className="text-2xl font-bold text-primary">
              {valorTotal.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
