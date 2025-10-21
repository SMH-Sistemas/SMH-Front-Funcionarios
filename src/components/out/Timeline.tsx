import { Check, Clock, Truck, Package, X, RotateCcw } from "lucide-react";
import { SaidaStatus } from "@/types/saida";
import { cn } from "@/lib/utils";

type TimelineItem = {
  status: SaidaStatus;
  data: string;
  responsavel: string;
  observacao?: string;
};

type TimelineProps = {
  items: TimelineItem[];
  currentStatus: SaidaStatus;
};

const statusConfig = {
  rascunho: {
    icon: Clock,
    label: "Rascunho",
    color: "text-muted-foreground",
    bgColor: "bg-muted",
  },
  reservado: {
    icon: Package,
    label: "Reservado",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  em_transporte: {
    icon: Truck,
    label: "Em Transporte",
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  entregue: {
    icon: Check,
    label: "Entregue",
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  cancelado: {
    icon: X,
    label: "Cancelado",
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
  estornado: {
    icon: RotateCcw,
    label: "Estornado",
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
};

export const Timeline = ({ items, currentStatus }: TimelineProps) => {
  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const config = statusConfig[item.status];
        const Icon = config.icon;
        const isLast = index === items.length - 1;
        const isCurrent = item.status === currentStatus;

        return (
          <div key={index} className="relative">
            {!isLast && (
              <div
                className={cn(
                  "absolute left-5 top-11 h-full w-0.5",
                  isCurrent ? "bg-primary" : "bg-muted"
                )}
              />
            )}
            <div className="flex gap-4">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                  isCurrent ? "bg-primary" : config.bgColor
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5",
                    isCurrent ? "text-primary-foreground" : config.color
                  )}
                />
              </div>
              <div className="flex-1 pb-8">
                <div className="flex items-center justify-between">
                  <h4
                    className={cn(
                      "font-semibold",
                      isCurrent && "text-primary"
                    )}
                  >
                    {config.label}
                  </h4>
                  <span className="text-sm text-muted-foreground">
                    {new Date(item.data).toLocaleString("pt-BR")}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Por: {item.responsavel}
                </p>
                {item.observacao && (
                  <p className="text-sm mt-2 text-foreground">
                    {item.observacao}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
