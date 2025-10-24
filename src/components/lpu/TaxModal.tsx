import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaxResponseDTO, TaxRequestDTO, TaxType } from "@/services/api.tax";

type TaxModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tax: TaxResponseDTO | null;
  onSave: (data: TaxRequestDTO & { id?: number }) => void;
};

export const TaxModal = ({
  open,
  onOpenChange,
  tax,
  onSave,
}: TaxModalProps) => {
  const [formData, setFormData] = useState<TaxRequestDTO & { id?: number }>({
    type: TaxType.EMPREITADA_GLOBAL,
    percentage: 0,
    description: "",
  });

  useEffect(() => {
    if (tax) {
      setFormData({
        id: tax.id,
        type: tax.type,
        percentage: tax.percentage,
        description: tax.description,
      });
    } else {
      setFormData({
        type: TaxType.EMPREITADA_GLOBAL,
        percentage: 0,
        description: "",
      });
    }
  }, [tax, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {tax ? "Editar Imposto" : "Adicionar Imposto"}
          </DialogTitle>
          <DialogDescription>
            {tax
              ? "Atualize as informações do imposto"
              : "Configure um novo imposto para produtos ou serviços"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-semibold">
              Tipo *
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value: TaxType) =>
                setFormData({ ...formData, type: value })
              }
              disabled={!!tax} // Não permite alterar o tipo ao editar
            >
              <SelectTrigger className="border-2 border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={TaxType.EMPREITADA_GLOBAL}>Empreitada Global</SelectItem>
                <SelectItem value={TaxType.ICMS}>ICMS</SelectItem>
                <SelectItem value={TaxType.ISS}>ISS</SelectItem>
                <SelectItem value={TaxType.OUTRO}>Outro</SelectItem>
              </SelectContent>
            </Select>
            {tax && (
              <p className="text-xs text-muted-foreground">
                O tipo não pode ser alterado após a criação
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="percentage" className="text-sm font-semibold">
              Porcentagem (%) *
            </Label>
            <Input
              id="percentage"
              type="number"
              step="0.01"
              value={formData.percentage}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  percentage: parseFloat(e.target.value) || 0,
                })
              }
              required
              min="0"
              max="100"
              placeholder="0.00"
              className="border-2 border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold">
              Descrição *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
              placeholder="Ex: ICMS, ISS, PIS, COFINS, etc."
              rows={3}
              maxLength={250}
              className="border-2 border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {formData.description.length}/250
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-2 border-gray-300 hover:bg-gray-100"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {tax ? "Atualizar" : "Criar"} Imposto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
