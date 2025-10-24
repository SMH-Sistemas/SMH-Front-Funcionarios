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
import { TrendingUp } from "lucide-react";

type IncreasePriceModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (increasePercentage: number) => void;
  productsCount: number;
};

export const IncreasePriceModal = ({
  open,
  onOpenChange,
  onSave,
  productsCount,
}: IncreasePriceModalProps) => {
  const [increasePercentage, setIncreasePercentage] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(increasePercentage);
    setIncreasePercentage(0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            Aumentar Preço
          </DialogTitle>
          <DialogDescription>
            Aumentar preço para {productsCount}{" "}
            {productsCount === 1
              ? "produto selecionado"
              : "produtos selecionados"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="increase" className="text-sm font-semibold">
                Percentual de Aumento
              </Label>
              <div className="relative">
                <Input
                  id="increase"
                  type="number"
                  step="0.01"
                  value={increasePercentage}
                  onChange={(e) =>
                    setIncreasePercentage(parseFloat(e.target.value) || 0)
                  }
                  min="0"
                  max="1000"
                  required
                  className="pr-8 border-2 border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="0"
                />
                <TrendingUp className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground">
                Insira o percentual de aumento (ex: 10 para 10%)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-2 border-gray-300 hover:bg-gray-100 hover:border-gray-400 text-gray-700"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg"
            >
              Aumentar Preço
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};


