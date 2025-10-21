import { useState } from "react";
import { ArrowLeft, FileText, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SaidasTable } from "@/components/out/SaidasTable";
import { NovaSaidaModal } from "@/components/out/NovaSaidaModal";
import { SaidaDetalhes } from "@/components/out/SaidaDetalhes";
import { Saida } from "@/types/saida";
import { mockSaidas } from "@/data/mockSaidas";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Saidas = () => {
  const navigate = useNavigate();
  const [saidas, setSaidas] = useState<Saida[]>(mockSaidas);
  const [isNovaSaidaOpen, setIsNovaSaidaOpen] = useState(false);
  const [selectedSaida, setSelectedSaida] = useState<Saida | null>(null);
  const [isDetalhesOpen, setIsDetalhesOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  const handleSaveSaida = (novaSaida: Saida) => {
    setSaidas([novaSaida, ...saidas]);
  };

  const handleDeleteSaida = (id: string) => {
    setSaidas(saidas.filter((s) => s.id !== id));
  };

  const handleViewSaida = (saida: Saida) => {
    setSelectedSaida(saida);
    setIsDetalhesOpen(true);
  };

  const handleUpdateStatus = (id: string, status: Saida["status"]) => {
    setSaidas(
      saidas.map((s) =>
        s.id === id
          ? {
              ...s,
              status,
              timeline: [
                ...s.timeline,
                {
                  status,
                  data: new Date().toISOString(),
                  responsavel: "Usuário Atual",
                  observacao: `Status alterado para ${status}`,
                },
              ],
              logs: [
                ...s.logs,
                {
                  id: Date.now().toString(),
                  data: new Date().toISOString(),
                  usuario: "Usuário Atual",
                  acao: "Alteração de Status",
                  detalhes: `Status alterado para ${status}`,
                },
              ],
            }
          : s
      )
    );
    // Atualiza também a saída selecionada se for a mesma
    if (selectedSaida && selectedSaida.id === id) {
      const saidaAtualizada = saidas.find((s) => s.id === id);
      if (saidaAtualizada) {
        setSelectedSaida({ ...saidaAtualizada, status });
      }
    }
  };

  const filteredSaidas = saidas.filter((saida) => {
    const matchesSearch =
      saida.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      saida.cliente.nome.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus =
      statusFilter === "todos" || saida.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-10 border-b bg-background shadow-sm">
        <div className="flex h-16 items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary">
                  Saída de Produtos
                </h1>
                <p className="text-xs text-muted-foreground">
                  Gerenciamento de remessas e entregas
                </p>
              </div>
            </div>
          </div>
          <Button onClick={() => setIsNovaSaidaOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Saída
          </Button>
        </div>
      </header>

      <main className="p-8">
        <Card className="shadow-md">
          <div className="border-b bg-card px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-card-foreground">
                  Lista de Saídas
                </h2>
                <p className="text-sm text-muted-foreground">
                  Gerencie suas remessas e entregas
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número ou cliente"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                  <SelectItem value="reservado">Reservado</SelectItem>
                  <SelectItem value="em_transporte">Em Transporte</SelectItem>
                  <SelectItem value="entregue">Entregue</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                  <SelectItem value="estornado">Estornado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <SaidasTable
            saidas={filteredSaidas}
            onView={handleViewSaida}
            onDelete={handleDeleteSaida}
          />
        </Card>
      </main>

      <NovaSaidaModal
        open={isNovaSaidaOpen}
        onOpenChange={setIsNovaSaidaOpen}
        onSave={handleSaveSaida}
      />

      <SaidaDetalhes
        saida={selectedSaida}
        open={isDetalhesOpen}
        onOpenChange={setIsDetalhesOpen}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};

export default Saidas;
