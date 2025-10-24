import { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Package } from "lucide-react";
import type { LPUResponseDTO, LPURequestDTO } from "@/services/api.lpu";

type LPUModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: LPURequestDTO, id?: number) => void;
  lpu?: LPUResponseDTO | null;
};

export const LPUModal = ({
  open,
  onOpenChange,
  onSave,
  lpu,
}: LPUModalProps) => {
  const [formData, setFormData] = useState<LPURequestDTO>({
    name: "",
    description: "",
    active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Atualizar formulário quando a LPU mudar
  useEffect(() => {
    if (lpu) {
      setFormData({
        name: lpu.name,
        description: lpu.description || "",
        active: lpu.active,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        active: true,
      });
    }
    setErrors({});
  }, [lpu, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Nome deve ter pelo menos 3 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSave(formData, lpu?.id);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      active: true,
    });
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            {lpu ? "Editar LPU" : "Nova LPU"}
          </DialogTitle>
          <DialogDescription>
            {lpu
              ? "Atualize as informações da Lista de Produtos Unitários"
              : "Crie uma nova Lista de Produtos Unitários"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold">
                Nome da LPU <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ex: Produtos Linha Industrial"
                className={errors.name ? "border-destructive" : ""}
                maxLength={100}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
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
                placeholder="Descreva a finalidade desta LPU..."
                rows={3}
                maxLength={250}
              />
              <p className="text-xs text-muted-foreground">
                {formData.description?.length || 0}/250 caracteres
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="active" className="text-sm font-semibold">
                  Status da LPU
                </Label>
                <p className="text-sm text-muted-foreground">
                  {formData.active
                    ? "Esta LPU está ativa"
                    : "Esta LPU está inativa"}
                </p>
              </div>
              <Switch
                id="active"
                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                checked={formData.active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, active: checked })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-2"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 font-semibold"
            >
              {lpu ? "Atualizar LPU" : "Criar LPU"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
