import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      navigate("/app/home");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-black tracking-wider text-foreground">
            ACTIVTRIM <span className="text-primary">PEPTIDES</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">Access your research account</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 rounded-lg border border-border bg-card p-6">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</label>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="border-border bg-muted text-foreground"
              placeholder="researcher@lab.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</label>
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="border-border bg-muted text-foreground"
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full gradient-primary text-primary-foreground font-bold uppercase tracking-wider">
            {loading ? "Signing in..." : "Sign In"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            <Link to="/forgot-password" className="font-semibold text-primary hover:underline">Forgot your password?</Link>
          </p>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-primary hover:underline">Create Account</Link>
        </p>

        <p className="text-center text-[10px] text-muted-foreground">
          For Research Use Only. All products are intended for laboratory and research purposes.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
