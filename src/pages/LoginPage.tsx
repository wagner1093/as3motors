import { useState } from "react";
import { Car } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
            <Car className="w-8 h-8 text-accent-foreground" />
          </div>
          <h1 className="text-2xl font-bold">AutoCRM</h1>
          <p className="text-sm text-muted-foreground mt-1">Faça login para continuar</p>
        </div>

        <div className="stat-card space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Email</label>
            <Input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Senha</label>
            <Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <Button className="w-full">Entrar</Button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
