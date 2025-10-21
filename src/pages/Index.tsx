import { Button } from "@/components/ui/button";
import { ArrowRight, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary via-primary/95 to-primary/90">
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
      
      <div className="relative z-10 flex flex-col items-center gap-8 px-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary shadow-2xl">
          <Package className="h-10 w-10 text-secondary-foreground" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-primary-foreground md:text-6xl">
            SMH Sistemas
          </h1>
          <p className="max-w-md text-lg text-primary-foreground/90 md:text-xl">
            Sistema de Gerenciamento de Produtos
          </p>
        </div>

        <Button
          onClick={() => navigate("/dashboard")}
          size="lg"
          variant="secondary"
          className="group gap-2 shadow-xl transition-all hover:gap-4 hover:shadow-2xl"
        >
          Acessar Dashboard
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </Button>

        <p className="mt-8 text-sm text-primary-foreground/70">
          Gerencie produtos, estoque e descontos em um só lugar
        </p>
      </div>
    </div>
  );
};

export default Index;
