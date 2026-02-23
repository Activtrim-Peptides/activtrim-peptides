import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Check your email to verify your account!");
      navigate("/login");
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
          <p className="mt-2 text-sm text-muted-foreground">Create your research account</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 rounded-lg border border-border bg-card p-6">
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
              minLength={6}
              className="border-border bg-muted text-foreground"
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full gradient-primary text-primary-foreground font-bold uppercase tracking-wider">
            {loading ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">Sign In</Link>
        </p>

        <p className="text-center text-[10px] text-muted-foreground">
          For Research Use Only. Must be 18+ to register.
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
