import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Trash2, Edit2, Plus, X } from "lucide-react";
import { Navigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";

const allCategories = [
  "Weight Loss Peptides",
  "Performance & Recovery",
  "Anti-Aging & Longevity",
  "Cognitive Enhancement",
  "Sexual Health",
];

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  is_best_seller: boolean;
  in_stock: boolean;
  image_url: string | null;
}

const AdminPage = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", price: "", category: allCategories[0], is_best_seller: false });

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("name");
    setProducts((data as Product[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  if (authLoading) return null;
  if (!isAdmin) return <Navigate to="/app/home" replace />;

  const handleSave = async () => {
    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      category: form.category,
      is_best_seller: form.is_best_seller,
    };

    if (editing) {
      const { error } = await supabase.from("products").update(payload).eq("id", editing.id);
      if (error) toast.error(error.message); else toast.success("Product updated");
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) toast.error(error.message); else toast.success("Product created");
    }
    setEditing(null);
    setCreating(false);
    setForm({ name: "", description: "", price: "", category: allCategories[0], is_best_seller: false });
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await supabase.from("products").delete().eq("id", id);
    toast.success("Product deleted");
    fetchProducts();
  };

  const startEdit = (p: Product) => {
    setEditing(p);
    setCreating(false);
    setForm({ name: p.name, description: p.description, price: p.price.toString(), category: p.category, is_best_seller: p.is_best_seller });
  };

  const isFormOpen = creating || editing;

  return (
    <div className="container max-w-4xl py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-black tracking-wider text-foreground">ADMIN PANEL</h1>
        {!isFormOpen && (
          <Button onClick={() => { setCreating(true); setForm({ name: "", description: "", price: "", category: allCategories[0], is_best_seller: false }); }}
            className="gradient-primary text-primary-foreground font-semibold gap-1">
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        )}
      </div>

      {isFormOpen && (
        <div className="mb-8 rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase text-foreground">{editing ? "Edit Product" : "New Product"}</h2>
            <button onClick={() => { setEditing(null); setCreating(false); }}><X className="h-4 w-4 text-muted-foreground" /></button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-muted text-foreground border-border" />
            <Input placeholder="Price" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="bg-muted text-foreground border-border" />
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground">
              {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <Checkbox checked={form.is_best_seller} onCheckedChange={v => setForm(f => ({ ...f, is_best_seller: !!v }))} />
              Best Seller
            </label>
          </div>
          <textarea placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="mt-4 w-full rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground" rows={3} />
          <Button onClick={handleSave} className="mt-4 gradient-primary text-primary-foreground font-semibold">Save</Button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-2">
          {products.map(p => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
              <div>
                <p className="text-sm font-bold text-foreground">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.category} · ${p.price} {p.is_best_seller && "⭐"}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(p)} className="text-muted-foreground hover:text-primary"><Edit2 className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(p.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
