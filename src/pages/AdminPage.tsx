import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Trash2, Edit2, Plus, X, Upload, Image as ImageIcon } from "lucide-react";
import { Navigate } from "react-router-dom";

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
  stock_quantity: number;
}

interface BenefitItem { title: string; description: string }
interface ProtocolItem { name: string; dosage: string; frequency: string; duration: string }
interface StepItem { step: string }
interface IndicationItem { indication: string }
interface TimelineItem { timeframe: string; description: string }

interface ProductDetails {
  what_is: string;
  key_benefits: BenefitItem[];
  mechanism_of_action: string;
  quick_start_guide: StepItem[];
  research_indications: IndicationItem[];
  research_protocols: ProtocolItem[];
  what_to_expect: TimelineItem[];
  show_what_is: boolean;
  show_key_benefits: boolean;
  show_mechanism_of_action: boolean;
  show_quick_start_guide: boolean;
  show_research_indications: boolean;
  show_research_protocols: boolean;
  show_what_to_expect: boolean;
  show_image: boolean;
}

const emptyDetails: ProductDetails = {
  what_is: "",
  key_benefits: [],
  mechanism_of_action: "",
  quick_start_guide: [],
  research_indications: [],
  research_protocols: [],
  what_to_expect: [],
  show_what_is: true,
  show_key_benefits: true,
  show_mechanism_of_action: true,
  show_quick_start_guide: true,
  show_research_indications: true,
  show_research_protocols: true,
  show_what_to_expect: true,
  show_image: true,
};

const AdminPage = () => {
  const { isAdmin, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Basic info form
  const [form, setForm] = useState({
    name: "", slug: "", description: "", price: "", category: allCategories[0],
    is_best_seller: false, in_stock: true, stock_quantity: "0",
  });

  // Content form
  const [details, setDetails] = useState<ProductDetails>(emptyDetails);

  // Image
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("name");
    setProducts((data as Product[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  if (authLoading) return null;
  if (!isAdmin) return <Navigate to="/app/home" replace />;

  const fetchDetails = async (productId: string) => {
    const { data } = await supabase.from("product_details").select("*").eq("product_id", productId).maybeSingle();
    if (data) {
      const d = data as any;
      setDetails({
        what_is: d.what_is || "",
        key_benefits: (d.key_benefits as unknown as BenefitItem[]) || [],
        mechanism_of_action: d.mechanism_of_action || "",
        quick_start_guide: (d.quick_start_guide as unknown as StepItem[]) || [],
        research_indications: (d.research_indications as unknown as IndicationItem[]) || [],
        research_protocols: (d.research_protocols as unknown as ProtocolItem[]) || [],
        what_to_expect: (d.what_to_expect as unknown as TimelineItem[]) || [],
        show_what_is: d.show_what_is !== false,
        show_key_benefits: d.show_key_benefits !== false,
        show_mechanism_of_action: d.show_mechanism_of_action !== false,
        show_quick_start_guide: d.show_quick_start_guide !== false,
        show_research_indications: d.show_research_indications !== false,
        show_research_protocols: d.show_research_protocols !== false,
        show_what_to_expect: d.show_what_to_expect !== false,
        show_image: d.show_image !== false,
      });
    } else {
      setDetails(emptyDetails);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description,
      price: parseFloat(form.price),
      category: form.category,
      is_best_seller: form.is_best_seller,
      in_stock: form.in_stock,
      image_url: imageUrl,
      stock_quantity: parseInt(form.stock_quantity) || 0,
    };

    let productId = editing?.id;

    if (editing) {
      const { error } = await supabase.from("products").update(payload).eq("id", editing.id);
      if (error) { toast.error(error.message); setSaving(false); return; }
    } else {
      const { data, error } = await supabase.from("products").insert(payload).select("id").single();
      if (error) { toast.error(error.message); setSaving(false); return; }
      productId = data.id;
    }

    // Upsert product_details
    if (productId) {
      const { data: existing } = await supabase.from("product_details").select("id").eq("product_id", productId).maybeSingle();
      const detailsPayload = {
        product_id: productId,
        what_is: details.what_is,
        key_benefits: JSON.parse(JSON.stringify(details.key_benefits)),
        mechanism_of_action: details.mechanism_of_action,
        quick_start_guide: JSON.parse(JSON.stringify(details.quick_start_guide)),
        research_indications: JSON.parse(JSON.stringify(details.research_indications)),
        research_protocols: JSON.parse(JSON.stringify(details.research_protocols)),
        what_to_expect: JSON.parse(JSON.stringify(details.what_to_expect)),
        show_what_is: details.show_what_is,
        show_key_benefits: details.show_key_benefits,
        show_mechanism_of_action: details.show_mechanism_of_action,
        show_quick_start_guide: details.show_quick_start_guide,
        show_research_indications: details.show_research_indications,
        show_research_protocols: details.show_research_protocols,
        show_what_to_expect: details.show_what_to_expect,
        show_image: details.show_image,
      };

      if (existing) {
        await supabase.from("product_details").update(detailsPayload).eq("id", existing.id);
      } else {
        await supabase.from("product_details").insert(detailsPayload);
      }
    }

    toast.success(editing ? "Product updated" : "Product created");
    resetForm();
    fetchProducts();
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    await supabase.from("product_details").delete().eq("product_id", id);
    await supabase.from("products").delete().eq("id", id);
    toast.success("Product deleted");
    fetchProducts();
  };

  const toggleStock = async (p: Product) => {
    await supabase.from("products").update({ in_stock: !p.in_stock }).eq("id", p.id);
    fetchProducts();
  };

  const startEdit = async (p: Product) => {
    setEditing(p);
    setCreating(false);
    setForm({
      name: p.name, slug: (p as any).slug || "", description: p.description, price: p.price.toString(),
      category: p.category, is_best_seller: p.is_best_seller, in_stock: p.in_stock, stock_quantity: (p.stock_quantity ?? 0).toString(),
    });
    setImageUrl(p.image_url);
    await fetchDetails(p.id);
  };

  const resetForm = () => {
    setEditing(null);
    setCreating(false);
    setForm({ name: "", slug: "", description: "", price: "", category: allCategories[0], is_best_seller: false, in_stock: true, stock_quantity: "0" });
    setDetails(emptyDetails);
    setImageUrl(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) { toast.error("Upload failed: " + error.message); setUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(path);
    setImageUrl(publicUrl);
    setUploading(false);
    toast.success("Image uploaded");
  };

  const isFormOpen = creating || editing;

  // --- Dynamic list helpers ---
  const addBenefit = () => setDetails(d => ({ ...d, key_benefits: [...d.key_benefits, { title: "", description: "" }] }));
  const removeBenefit = (i: number) => setDetails(d => ({ ...d, key_benefits: d.key_benefits.filter((_, idx) => idx !== i) }));
  const updateBenefit = (i: number, field: keyof BenefitItem, val: string) =>
    setDetails(d => ({ ...d, key_benefits: d.key_benefits.map((b, idx) => idx === i ? { ...b, [field]: val } : b) }));

  const addProtocol = () => setDetails(d => ({ ...d, research_protocols: [...d.research_protocols, { name: "", dosage: "", frequency: "", duration: "" }] }));
  const removeProtocol = (i: number) => setDetails(d => ({ ...d, research_protocols: d.research_protocols.filter((_, idx) => idx !== i) }));
  const updateProtocol = (i: number, field: keyof ProtocolItem, val: string) =>
    setDetails(d => ({ ...d, research_protocols: d.research_protocols.map((p, idx) => idx === i ? { ...p, [field]: val } : p) }));

  const addStep = () => setDetails(d => ({ ...d, quick_start_guide: [...d.quick_start_guide, { step: "" }] }));
  const removeStep = (i: number) => setDetails(d => ({ ...d, quick_start_guide: d.quick_start_guide.filter((_, idx) => idx !== i) }));

  const addIndication = () => setDetails(d => ({ ...d, research_indications: [...d.research_indications, { indication: "" }] }));
  const removeIndication = (i: number) => setDetails(d => ({ ...d, research_indications: d.research_indications.filter((_, idx) => idx !== i) }));

  const addTimeline = () => setDetails(d => ({ ...d, what_to_expect: [...d.what_to_expect, { timeframe: "", description: "" }] }));
  const removeTimeline = (i: number) => setDetails(d => ({ ...d, what_to_expect: d.what_to_expect.filter((_, idx) => idx !== i) }));
  const updateTimeline = (i: number, field: keyof TimelineItem, val: string) =>
    setDetails(d => ({ ...d, what_to_expect: d.what_to_expect.map((t, idx) => idx === i ? { ...t, [field]: val } : t) }));

  return (
    <div className="container max-w-5xl py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-black tracking-wider text-foreground">ADMIN PANEL</h1>
        {!isFormOpen && (
          <Button onClick={() => { setCreating(true); resetForm(); setCreating(true); }}
            className="gradient-primary text-primary-foreground font-semibold gap-1">
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        )}
      </div>

      {isFormOpen && (
        <div className="mb-8 rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase text-foreground">{editing ? "Edit Product" : "New Product"}</h2>
            <button onClick={resetForm}><X className="h-4 w-4 text-muted-foreground" /></button>
          </div>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="mb-4 w-full justify-start bg-muted">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="image">Image</TabsTrigger>
            </TabsList>

            {/* === BASIC INFO === */}
            <TabsContent value="basic">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-muted text-foreground border-border" />
                <Input placeholder="Slug (e.g. dihexa)" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))} className="bg-muted text-foreground border-border" />
                <Input placeholder="Price" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="bg-muted text-foreground border-border" />
                <Input placeholder="Quantity Available" type="number" min="0" value={form.stock_quantity} onChange={e => setForm(f => ({ ...f, stock_quantity: e.target.value }))} className="bg-muted text-foreground border-border" />
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="rounded-md border border-border bg-muted px-3 py-2 text-sm text-foreground">
                  {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <Checkbox checked={form.is_best_seller} onCheckedChange={v => setForm(f => ({ ...f, is_best_seller: !!v }))} />
                    Best Seller
                  </label>
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <Switch checked={form.in_stock} onCheckedChange={v => setForm(f => ({ ...f, in_stock: v }))} />
                    Published
                  </label>
                </div>
              </div>
              <Textarea placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="mt-4 bg-muted text-foreground border-border" rows={3} />
            </TabsContent>

            {/* === CONTENT === */}
            <TabsContent value="content" className="space-y-6">
              {/* What Is */}
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-xs font-bold uppercase text-muted-foreground">What is {form.name || "this product"}?</label>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Switch checked={details.show_what_is} onCheckedChange={v => setDetails(d => ({ ...d, show_what_is: v }))} />
                    {details.show_what_is ? "Published" : "Hidden"}
                  </label>
                </div>
                <Textarea value={details.what_is} onChange={e => setDetails(d => ({ ...d, what_is: e.target.value }))} className="bg-muted text-foreground border-border" rows={3} />
              </div>

              {/* Mechanism of Action */}
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Mechanism of Action</label>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Switch checked={details.show_mechanism_of_action} onCheckedChange={v => setDetails(d => ({ ...d, show_mechanism_of_action: v }))} />
                    {details.show_mechanism_of_action ? "Published" : "Hidden"}
                  </label>
                </div>
                <Textarea value={details.mechanism_of_action} onChange={e => setDetails(d => ({ ...d, mechanism_of_action: e.target.value }))} className="bg-muted text-foreground border-border" rows={3} />
                <Textarea value={details.mechanism_of_action} onChange={e => setDetails(d => ({ ...d, mechanism_of_action: e.target.value }))} className="bg-muted text-foreground border-border" rows={3} />
              </div>

              {/* Key Benefits */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Key Benefits</label>
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Switch checked={details.show_key_benefits} onCheckedChange={v => setDetails(d => ({ ...d, show_key_benefits: v }))} />
                      {details.show_key_benefits ? "Published" : "Hidden"}
                    </label>
                  </div>
                  <Button size="sm" variant="outline" onClick={addBenefit} className="h-7 gap-1 text-xs"><Plus className="h-3 w-3" /> Add</Button>
                  <Button size="sm" variant="outline" onClick={addBenefit} className="h-7 gap-1 text-xs"><Plus className="h-3 w-3" /> Add</Button>
                </div>
                {details.key_benefits.map((b, i) => (
                  <div key={i} className="mb-2 flex gap-2">
                    <Input placeholder="Title" value={b.title} onChange={e => updateBenefit(i, "title", e.target.value)} className="bg-muted text-foreground border-border" />
                    <Input placeholder="Description" value={b.description} onChange={e => updateBenefit(i, "description", e.target.value)} className="bg-muted text-foreground border-border flex-1" />
                    <button onClick={() => removeBenefit(i)} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>

              {/* Quick Start Guide */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Quick Start Guide</label>
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Switch checked={details.show_quick_start_guide} onCheckedChange={v => setDetails(d => ({ ...d, show_quick_start_guide: v }))} />
                      {details.show_quick_start_guide ? "Published" : "Hidden"}
                    </label>
                  </div>
                  <Button size="sm" variant="outline" onClick={addStep} className="h-7 gap-1 text-xs"><Plus className="h-3 w-3" /> Add</Button>
                  <Button size="sm" variant="outline" onClick={addStep} className="h-7 gap-1 text-xs"><Plus className="h-3 w-3" /> Add</Button>
                </div>
                {details.quick_start_guide.map((s, i) => (
                  <div key={i} className="mb-2 flex gap-2">
                    <Input placeholder={`Step ${i + 1}`} value={s.step} onChange={e => setDetails(d => ({ ...d, quick_start_guide: d.quick_start_guide.map((x, idx) => idx === i ? { step: e.target.value } : x) }))} className="bg-muted text-foreground border-border flex-1" />
                    <button onClick={() => removeStep(i)} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>

              {/* Research Indications */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Research Indications</label>
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Switch checked={details.show_research_indications} onCheckedChange={v => setDetails(d => ({ ...d, show_research_indications: v }))} />
                      {details.show_research_indications ? "Published" : "Hidden"}
                    </label>
                  </div>
                  <Button size="sm" variant="outline" onClick={addIndication} className="h-7 gap-1 text-xs"><Plus className="h-3 w-3" /> Add</Button>
                  <Button size="sm" variant="outline" onClick={addIndication} className="h-7 gap-1 text-xs"><Plus className="h-3 w-3" /> Add</Button>
                </div>
                {details.research_indications.map((ind, i) => (
                  <div key={i} className="mb-2 flex gap-2">
                    <Input placeholder="Indication" value={ind.indication} onChange={e => setDetails(d => ({ ...d, research_indications: d.research_indications.map((x, idx) => idx === i ? { indication: e.target.value } : x) }))} className="bg-muted text-foreground border-border flex-1" />
                    <button onClick={() => removeIndication(i)} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>

              {/* Research Protocols */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Research Protocols</label>
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Switch checked={details.show_research_protocols} onCheckedChange={v => setDetails(d => ({ ...d, show_research_protocols: v }))} />
                      {details.show_research_protocols ? "Published" : "Hidden"}
                    </label>
                  </div>
                  <Button size="sm" variant="outline" onClick={addProtocol} className="h-7 gap-1 text-xs"><Plus className="h-3 w-3" /> Add</Button>
                  <Button size="sm" variant="outline" onClick={addProtocol} className="h-7 gap-1 text-xs"><Plus className="h-3 w-3" /> Add</Button>
                </div>
                {details.research_protocols.map((p, i) => (
                  <div key={i} className="mb-2 grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2">
                    <Input placeholder="Name" value={p.name} onChange={e => updateProtocol(i, "name", e.target.value)} className="bg-muted text-foreground border-border" />
                    <Input placeholder="Dosage" value={p.dosage} onChange={e => updateProtocol(i, "dosage", e.target.value)} className="bg-muted text-foreground border-border" />
                    <Input placeholder="Frequency" value={p.frequency} onChange={e => updateProtocol(i, "frequency", e.target.value)} className="bg-muted text-foreground border-border" />
                    <Input placeholder="Duration" value={p.duration} onChange={e => updateProtocol(i, "duration", e.target.value)} className="bg-muted text-foreground border-border" />
                    <button onClick={() => removeProtocol(i)} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>

              {/* What to Expect */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-bold uppercase text-muted-foreground">What to Expect</label>
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Switch checked={details.show_what_to_expect} onCheckedChange={v => setDetails(d => ({ ...d, show_what_to_expect: v }))} />
                      {details.show_what_to_expect ? "Published" : "Hidden"}
                    </label>
                  </div>
                  <Button size="sm" variant="outline" onClick={addTimeline} className="h-7 gap-1 text-xs"><Plus className="h-3 w-3" /> Add</Button>
                  <Button size="sm" variant="outline" onClick={addTimeline} className="h-7 gap-1 text-xs"><Plus className="h-3 w-3" /> Add</Button>
                </div>
                {details.what_to_expect.map((t, i) => (
                  <div key={i} className="mb-2 flex gap-2">
                    <Input placeholder="Timeframe (e.g. Week 1-2)" value={t.timeframe} onChange={e => updateTimeline(i, "timeframe", e.target.value)} className="bg-muted text-foreground border-border w-40" />
                    <Input placeholder="Description" value={t.description} onChange={e => updateTimeline(i, "description", e.target.value)} className="bg-muted text-foreground border-border flex-1" />
                    <button onClick={() => removeTimeline(i)} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            </TabsContent>

            {/* === IMAGE === */}
            <TabsContent value="image">
              <div className="mb-4 flex items-center justify-between">
                <label className="text-xs font-bold uppercase text-muted-foreground">Product Image</label>
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Switch checked={details.show_image} onCheckedChange={v => setDetails(d => ({ ...d, show_image: v }))} />
                  {details.show_image ? "Published" : "Hidden"}
                </label>
              </div>
              <div className="flex flex-col items-center gap-4">
                {imageUrl ? (
                  <div className="relative">
                    <img src={imageUrl} alt="Product" className="h-48 w-48 rounded-lg border border-border object-cover" />
                    <button onClick={() => setImageUrl(null)} className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex h-48 w-48 items-center justify-center rounded-lg border-2 border-dashed border-border text-muted-foreground">
                    <ImageIcon className="h-12 w-12" />
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="gap-2">
                  <Upload className="h-4 w-4" /> {uploading ? "Uploading..." : "Upload Image"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex gap-2 border-t border-border pt-4">
            <Button onClick={handleSave} disabled={saving} className="gradient-primary text-primary-foreground font-semibold">
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
          </div>
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
              <div className="flex items-center gap-3">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="h-10 w-10 rounded border border-border object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded border border-border bg-muted">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-foreground">{p.name}</p>
                    <Badge variant={p.in_stock ? "default" : "secondary"} className="text-[10px]">
                      {p.in_stock ? "Published" : "Draft"}
                    </Badge>
                    {p.is_best_seller && <span className="text-xs">⭐</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">{p.category} · ${p.price} · Qty: {p.stock_quantity ?? 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={p.in_stock} onCheckedChange={() => toggleStock(p)} />
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
