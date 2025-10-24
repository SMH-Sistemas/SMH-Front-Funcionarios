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
import { AlertTriangle } from "lucide-react";
import type { LPUResponseDTO } from "@/services/api.lpu";

type DeleteLPUModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  lpu: LPUResponseDTO | null;
};

export const DeleteLPUModal = ({
  open,
  onOpenChange,
  onConfirm,
  lpu,
}: DeleteLPUModalProps) => {
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setConfirmText("");
      setError("");
    }
  }, [open]);

  const handleConfirm = () => {
    if (!lpu) return;

    if (confirmText !== lpu.name) {
      setError("O nome digitado não corresponde ao nome da LPU");
      return;
    }

    onConfirm();
    handleClose();
  };

  const handleClose = () => {
    setConfirmText("");
    setError("");
    onOpenChange(false);
  };

  const isConfirmDisabled = !confirmText || confirmText !== lpu?.name;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            Confirmar Exclusão
          </DialogTitle>
          <DialogDescription className="pt-2">
            Esta ação não pode ser desfeita. A LPU será permanentemente removida
            do sistema.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-amber-900">
                  Atenção! Esta ação é irreversível
                </p>
                <p className="text-sm text-amber-800">
                  Todos os produtos associados a esta LPU também serão afetados.
                  Tenha certeza antes de continuar.
                </p>
              </div>
            </div>
          </div>

          {lpu && (
            <div className="space-y-3">
              <div className="rounded-lg bg-muted p-3">
                <p className="text-sm text-muted-foreground mb-1">
                  Você está prestes a excluir:
                </p>
                <p className="font-semibold text-foreground">{lpu.name}</p>
                {lpu.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {lpu.description}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span>{lpu.products.length} produtos</span>
                  <span>•</span>
                  <span>{lpu.active ? "Ativa" : "Inativa"}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-name" className="text-sm font-semibold">
                  Para confirmar, digite o nome da LPU:{" "}
                  <span className="text-destructive font-mono">{lpu.name}</span>
                </Label>
                <Input
                  id="confirm-name"
                  value={confirmText}
                  onChange={(e) => {
                    setConfirmText(e.target.value);
                    setError("");
                  }}
                  placeholder="Digite o nome exato da LPU"
                  className={error ? "border-destructive" : ""}
                  autoComplete="off"
                />
                {error && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {error}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="border-2"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className="bg-destructive hover:bg-destructive/90 text-white font-semibold"
          >
            Sim, Excluir LPU
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
