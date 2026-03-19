import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Check your email for a password reset link!");
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
          <p className="mt-2 text-sm text-muted-foreground">Reset your password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            Enter the email associated with your account and we'll send you a link to reset your password.
          </p>
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
          <Button type="submit" disabled={loading} className="w-full gradient-primary text-primary-foreground font-bold uppercase tracking-wider">
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link to="/login" className="font-semibold text-primary hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
