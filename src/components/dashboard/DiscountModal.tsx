import { useState } from "react";
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
import { Percent } from "lucide-react";

type DiscountModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (discount: number) => void;
  productsCount: number;
};

export const DiscountModal = ({
  open,
  onOpenChange,
  onSave,
  productsCount,
}: DiscountModalProps) => {
  const [discount, setDiscount] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(discount);
    setDiscount(0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
              <Percent className="h-5 w-5 text-secondary" />
            </div>
            Aplicar Desconto
          </DialogTitle>
          <DialogDescription>
            Aplicar desconto para {productsCount}{" "}
            {productsCount === 1 ? "produto selecionado" : "produtos selecionados"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="discount">Percentual de Desconto</Label>
              <div className="relative">
                <Input
                  id="discount"
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(parseInt(e.target.value))}
                  min="0"
                  max="100"
                  required
                  className="pr-8"
                  placeholder="0"
                />
                <Percent className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                Insira um valor entre 0 e 100
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="secondary">
              Aplicar Desconto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
