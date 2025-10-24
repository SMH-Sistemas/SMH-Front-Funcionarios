import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

type DeleteConfirmModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  productName?: string;
};

export const DeleteConfirmModal = ({
  open,
  onOpenChange,
  onConfirm,
  productName,
}: DeleteConfirmModalProps) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            Confirmar Exclusão
          </DialogTitle>
          <DialogDescription className="pt-3">
            {productName ? (
              <>
                Tem certeza que deseja remover o produto{" "}
                <span className="font-semibold text-foreground">
                  "{productName}"
                </span>
                ?
              </>
            ) : (
              "Tem certeza que deseja remover este produto?"
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
            <p className="text-sm text-amber-800 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                Esta ação não pode ser desfeita. O produto será removido
                permanentemente do sistema.
              </span>
            </p>
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-2 border-gray-300 hover:bg-gray-100 hover:border-gray-400 text-gray-700"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold shadow-lg"
          >
            Sim, Remover Produto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
