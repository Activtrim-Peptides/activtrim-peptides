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
import { Trash2, Edit2, Plus, X, Upload, Image as ImageIcon, ChevronDown, ChevronRight } from "lucide-react";
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

interface QuickStatItem { heading: string; details: string; description: string; is_published: boolean }

interface ProductVariantForm {
  id?: string;
  label: string;
  strength_mg: string;
  price: string;
  stock_quantity: string;
  sort_order: string;
}

interface ProductDetails {
  what_is: string;
  key_benefits: BenefitItem[];
  mechanism_of_action: string;
  quick_start_guide: StepItem[];
  research_indications: IndicationItem[];
  research_protocols: ProtocolItem[];
  what_to_expect: TimelineItem[];
  quick_stats: QuickStatItem[];
  show_what_is: boolean;
  show_key_benefits: boolean;
  show_mechanism_of_action: boolean;
  show_quick_start_guide: boolean;
  show_research_indications: boolean;
  show_research_protocols: boolean;
  show_what_to_expect: boolean;
  show_image: boolean;
}

const defaultQuickStats: QuickStatItem[] = [
  { heading: "Typical Dosage", details: "Lyophilized", description: "Powdered form for reconstitution", is_published: true },
  { heading: "Administration", details: "Subcutaneous", description: "Injection method", is_published: true },
  { heading: "Storage", details: "2-8°C", description: "Refrigerated storage required", is_published: true },
];

const emptyDetails: ProductDetails = {
  what_is: "",
  key_benefits: [],
  mechanism_of_action: "",
  quick_start_guide: [],
  research_indications: [],
  research_protocols: [],
  what_to_expect: [],
  quick_stats: defaultQuickStats,
  show_what_is: true,
  show_key_benefits: true,
  show_mechanism_of_action: true,
  show_quick_start_guide: true,
  show_research_indications: true,
  show_research_protocols: true,
  show_what_to_expect: true,
  show_image: true,
};

// ── FAQ types ──
interface FaqItem {
  id: string;
  section_id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_published: boolean;
}

interface FaqSection {
  id: string;
  title: string;
  sort_order: number;
  is_published: boolean;
  faq_items: FaqItem[];
}

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

  // Variants
  const [productVariants, setProductVariants] = useState<ProductVariantForm[]>([]);

  // ── FAQ state ──
  const [faqSections, setFaqSections] = useState<FaqSection[]>([]);
  const [faqLoading, setFaqLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [editingFaqSection, setEditingFaqSection] = useState<string | null>(null);
  const [editingFaqItem, setEditingFaqItem] = useState<string | null>(null);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [addingSectionItem, setAddingSectionItem] = useState<string | null>(null);
  const [newItemQuestion, setNewItemQuestion] = useState("");
  const [newItemAnswer, setNewItemAnswer] = useState("");

  // ── Top-level tab ──
  const [adminTab, setAdminTab] = useState<"products" | "faq">("products");

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*").order("name");
    setProducts((data as Product[]) || []);
    setLoading(false);
  };

  const fetchFaqSections = async () => {
    setFaqLoading(true);
    const { data } = await supabase
      .from("faq_sections")
      .select("*, faq_items(*)")
      .order("sort_order");
    if (data) {
      const sections = (data as any[]).map(s => ({
        ...s,
        faq_items: (s.faq_items as FaqItem[]).sort((a, b) => a.sort_order - b.sort_order),
      }));
      setFaqSections(sections);
    }
    setFaqLoading(false);
  };

  useEffect(() => { fetchProducts(); fetchFaqSections(); }, []);

  if (authLoading) return null;
  if (!isAdmin) return <Navigate to="/app/home" replace />;

  // ── Product helpers (unchanged) ──
  const fetchDetails = async (productId: string) => {
    const { data } = await supabase.from("product_details").select("*").eq("product_id", productId).maybeSingle();
    if (data) {
      const d = data as any;
      const qs = (d.quick_stats as unknown as QuickStatItem[]);
      setDetails({
        what_is: d.what_is || "",
        key_benefits: (d.key_benefits as unknown as BenefitItem[]) || [],
        mechanism_of_action: d.mechanism_of_action || "",
        quick_start_guide: (d.quick_start_guide as unknown as StepItem[]) || [],
        research_indications: (d.research_indications as unknown as IndicationItem[]) || [],
        research_protocols: (d.research_protocols as unknown as ProtocolItem[]) || [],
        what_to_expect: (d.what_to_expect as unknown as TimelineItem[]) || [],
        quick_stats: qs && qs.length > 0 ? qs : defaultQuickStats,
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
        quick_stats: JSON.parse(JSON.stringify(details.quick_stats)),
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

      // Save variants
      // Delete existing variants and re-insert
      await supabase.from("product_variants" as any).delete().eq("product_id", productId);
      if (productVariants.length > 0) {
        const variantPayloads = productVariants.map(v => ({
          product_id: productId,
          label: v.label,
          strength_mg: parseInt(v.strength_mg) || 0,
          price: parseFloat(v.price) || 0,
          stock_quantity: parseInt(v.stock_quantity) || 0,
          sort_order: parseInt(v.sort_order) || 0,
        }));
        await supabase.from("product_variants" as any).insert(variantPayloads);
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

  const fetchVariants = async (productId: string) => {
    const { data } = await supabase.from("product_variants" as any).select("*").eq("product_id", productId).order("sort_order");
    if (data) {
      setProductVariants((data as any[]).map(v => ({
        id: v.id,
        label: v.label,
        strength_mg: String(v.strength_mg),
        price: String(v.price),
        stock_quantity: String(v.stock_quantity),
        sort_order: String(v.sort_order),
      })));
    } else {
      setProductVariants([]);
    }
  };

  const startEdit = async (p: Product) => {
    setEditing(p);
    setCreating(false);
    setForm({
      name: p.name, slug: (p as any).slug || "", description: p.description, price: p.price.toString(),
      category: p.category, is_best_seller: p.is_best_seller, in_stock: p.in_stock, stock_quantity: (p.stock_quantity ?? 0).toString(),
    });
    setImageUrl(p.image_url);
    await Promise.all([fetchDetails(p.id), fetchVariants(p.id)]);
  };

  const resetForm = () => {
    setEditing(null);
    setCreating(false);
    setForm({ name: "", slug: "", description: "", price: "", category: allCategories[0], is_best_seller: false, in_stock: true, stock_quantity: "0" });
    setDetails(emptyDetails);
    setImageUrl(null);
    setProductVariants([]);
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

  // ── FAQ helpers ──
  const toggleSectionExpand = (id: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAddSection = async () => {
    if (!newSectionTitle.trim()) return;
    const maxOrder = faqSections.reduce((m, s) => Math.max(m, s.sort_order), -1);
    const { error } = await supabase.from("faq_sections").insert({
      title: newSectionTitle.trim(),
      sort_order: maxOrder + 1,
    } as any);
    if (error) { toast.error(error.message); return; }
    setNewSectionTitle("");
    toast.success("Section added");
    fetchFaqSections();
  };

  const handleDeleteSection = async (id: string) => {
    if (!confirm("Delete this section and all its items?")) return;
    const { error } = await supabase.from("faq_sections").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Section deleted");
    fetchFaqSections();
  };

  const handleUpdateSection = async (id: string, updates: Partial<{ title: string; sort_order: number; is_published: boolean }>) => {
    const { error } = await supabase.from("faq_sections").update(updates as any).eq("id", id);
    if (error) { toast.error(error.message); return; }
    fetchFaqSections();
  };

  const handleAddItem = async (sectionId: string) => {
    if (!newItemQuestion.trim() || !newItemAnswer.trim()) return;
    const section = faqSections.find(s => s.id === sectionId);
    const maxOrder = section ? section.faq_items.reduce((m, i) => Math.max(m, i.sort_order), -1) : -1;
    const { error } = await supabase.from("faq_items").insert({
      section_id: sectionId,
      question: newItemQuestion.trim(),
      answer: newItemAnswer.trim(),
      sort_order: maxOrder + 1,
    } as any);
    if (error) { toast.error(error.message); return; }
    setNewItemQuestion("");
    setNewItemAnswer("");
    setAddingSectionItem(null);
    toast.success("Item added");
    fetchFaqSections();
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm("Delete this FAQ item?")) return;
    const { error } = await supabase.from("faq_items").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Item deleted");
    fetchFaqSections();
  };

  const handleUpdateItem = async (id: string, updates: Partial<{ question: string; answer: string; sort_order: number; is_published: boolean }>) => {
    const { error } = await supabase.from("faq_items").update(updates as any).eq("id", id);
    if (error) { toast.error(error.message); return; }
    fetchFaqSections();
  };

  // ── Render ──
  return (
    <div className="container max-w-5xl py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-black tracking-wider text-foreground">ADMIN PANEL</h1>
      </div>

      {/* Top-level tab switcher */}
      <Tabs value={adminTab} onValueChange={v => setAdminTab(v as any)} className="w-full">
        <TabsList className="mb-6 w-full justify-start bg-muted">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
        </TabsList>

        {/* ════════ PRODUCTS TAB ════════ */}
        <TabsContent value="products">
          {!isFormOpen && (
            <div className="mb-4 flex justify-end">
              <Button onClick={() => { setCreating(true); resetForm(); setCreating(true); }}
                className="gradient-primary text-primary-foreground font-semibold gap-1">
                <Plus className="h-4 w-4" /> Add Product
              </Button>
            </div>
          )}

          {isFormOpen && (
            <div className="mb-8 rounded-lg border border-border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase text-foreground">{editing ? "Edit Product" : "New Product"}</h2>
                <button onClick={resetForm}><X className="h-4 w-4 text-muted-foreground" /></button>
              </div>

              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="mb-4 w-full justify-start bg-muted">
                   <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="variants">Variants</TabsTrigger>
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

                {/* === VARIANTS === */}
                <TabsContent value="variants" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Strength Variants</label>
                    <Button size="sm" variant="outline" onClick={() => setProductVariants(v => [...v, { label: "", strength_mg: "", price: "", stock_quantity: "0", sort_order: String(v.length) }])} className="h-7 gap-1 text-xs">
                      <Plus className="h-3 w-3" /> Add Variant
                    </Button>
                  </div>
                  {productVariants.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-4 text-center">No variants. Product will use base price.</p>
                  ) : (
                    productVariants.map((v, i) => (
                      <div key={i} className="rounded-md border border-border bg-muted/50 p-3">
                        <div className="grid gap-2 sm:grid-cols-5">
                          <div>
                            <label className="text-xs text-muted-foreground">Label</label>
                            <Input placeholder="e.g. 5mg" value={v.label} onChange={e => setProductVariants(vs => vs.map((x, idx) => idx === i ? { ...x, label: e.target.value } : x))} className="bg-muted text-foreground border-border" />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Strength (mg)</label>
                            <Input type="number" placeholder="5" value={v.strength_mg} onChange={e => setProductVariants(vs => vs.map((x, idx) => idx === i ? { ...x, strength_mg: e.target.value } : x))} className="bg-muted text-foreground border-border" />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Price</label>
                            <Input type="number" placeholder="49.99" value={v.price} onChange={e => setProductVariants(vs => vs.map((x, idx) => idx === i ? { ...x, price: e.target.value } : x))} className="bg-muted text-foreground border-border" />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground">Stock</label>
                            <Input type="number" placeholder="0" value={v.stock_quantity} onChange={e => setProductVariants(vs => vs.map((x, idx) => idx === i ? { ...x, stock_quantity: e.target.value } : x))} className="bg-muted text-foreground border-border" />
                          </div>
                          <div className="flex items-end">
                            <button onClick={() => setProductVariants(vs => vs.filter((_, idx) => idx !== i))} className="mb-1 text-muted-foreground hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>

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
                    </div>
                    {details.what_to_expect.map((t, i) => (
                      <div key={i} className="mb-2 flex gap-2">
                        <Input placeholder="Timeframe (e.g. Week 1-2)" value={t.timeframe} onChange={e => updateTimeline(i, "timeframe", e.target.value)} className="bg-muted text-foreground border-border w-40" />
                        <Input placeholder="Description" value={t.description} onChange={e => updateTimeline(i, "description", e.target.value)} className="bg-muted text-foreground border-border flex-1" />
                        <button onClick={() => removeTimeline(i)} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4" /></button>
                      </div>
                    ))}
                  </div>

                  {/* Quick Stats */}
                  <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground">Quick Stats</label>
                    <div className="mt-2 space-y-4">
                      {details.quick_stats.map((qs, i) => (
                        <div key={i} className="rounded-md border border-border bg-muted/50 p-4">
                          <div className="mb-3 flex items-center justify-between">
                            <span className="text-sm font-semibold text-foreground">Quick Stat {i + 1}</span>
                            <label className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Switch checked={qs.is_published} onCheckedChange={v => setDetails(d => ({ ...d, quick_stats: d.quick_stats.map((q, idx) => idx === i ? { ...q, is_published: v } : q) }))} />
                              {qs.is_published ? "Published" : "Hidden"}
                            </label>
                          </div>
                          <div className="grid gap-2">
                            <div>
                              <label className="text-xs text-muted-foreground">Heading</label>
                              <Input value={qs.heading} onChange={e => setDetails(d => ({ ...d, quick_stats: d.quick_stats.map((q, idx) => idx === i ? { ...q, heading: e.target.value } : q) }))} className="bg-muted text-foreground border-border" />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Details</label>
                              <Input value={qs.details} onChange={e => setDetails(d => ({ ...d, quick_stats: d.quick_stats.map((q, idx) => idx === i ? { ...q, details: e.target.value } : q) }))} className="bg-muted text-foreground border-border" />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Description</label>
                              <Input value={qs.description} onChange={e => setDetails(d => ({ ...d, quick_stats: d.quick_stats.map((q, idx) => idx === i ? { ...q, description: e.target.value } : q) }))} className="bg-muted text-foreground border-border" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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
        </TabsContent>

        {/* ════════ FAQ TAB ════════ */}
        <TabsContent value="faq">
          {/* Add section */}
          <div className="mb-6 flex gap-2">
            <Input
              placeholder="New section title…"
              value={newSectionTitle}
              onChange={e => setNewSectionTitle(e.target.value)}
              className="bg-muted text-foreground border-border"
              onKeyDown={e => e.key === "Enter" && handleAddSection()}
            />
            <Button onClick={handleAddSection} className="gradient-primary text-primary-foreground font-semibold gap-1">
              <Plus className="h-4 w-4" /> Add Section
            </Button>
          </div>

          {faqLoading ? (
            <div className="flex justify-center py-10">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : faqSections.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">No FAQ sections yet.</p>
          ) : (
            <div className="space-y-3">
              {faqSections.map(section => {
                const isExpanded = expandedSections.has(section.id);
                return (
                  <div key={section.id} className="rounded-lg border border-border bg-card">
                    {/* Section header */}
                    <div className="flex items-center gap-3 p-4">
                      <button onClick={() => toggleSectionExpand(section.id)} className="text-muted-foreground hover:text-foreground">
                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>

                      {editingFaqSection === section.id ? (
                        <Input
                          autoFocus
                          defaultValue={section.title}
                          className="bg-muted text-foreground border-border h-8 text-sm"
                          onBlur={e => { handleUpdateSection(section.id, { title: e.target.value }); setEditingFaqSection(null); }}
                          onKeyDown={e => { if (e.key === "Enter") { handleUpdateSection(section.id, { title: (e.target as HTMLInputElement).value }); setEditingFaqSection(null); } }}
                        />
                      ) : (
                        <span className="text-sm font-bold text-foreground flex-1">{section.title}</span>
                      )}

                      <Badge variant={section.is_published ? "default" : "secondary"} className="text-[10px]">
                        {section.is_published ? "Published" : "Draft"}
                      </Badge>

                      <Input
                        type="number"
                        value={section.sort_order}
                        onChange={e => handleUpdateSection(section.id, { sort_order: parseInt(e.target.value) || 0 })}
                        className="bg-muted text-foreground border-border h-8 w-16 text-xs text-center"
                        title="Sort order"
                      />

                      <Switch
                        checked={section.is_published}
                        onCheckedChange={v => handleUpdateSection(section.id, { is_published: v })}
                      />

                      <button onClick={() => setEditingFaqSection(section.id)} className="text-muted-foreground hover:text-primary">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeleteSection(section.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Section items */}
                    {isExpanded && (
                      <div className="border-t border-border px-4 pb-4 pt-2 space-y-2">
                        {section.faq_items.map(item => (
                          <div key={item.id} className="rounded border border-border bg-muted/50 p-3">
                            {editingFaqItem === item.id ? (
                              <div className="space-y-2">
                                <Input
                                  defaultValue={item.question}
                                  placeholder="Question"
                                  className="bg-muted text-foreground border-border text-sm"
                                  onBlur={e => handleUpdateItem(item.id, { question: e.target.value })}
                                />
                                <Textarea
                                  defaultValue={item.answer}
                                  placeholder="Answer"
                                  className="bg-muted text-foreground border-border text-sm"
                                  rows={3}
                                  onBlur={e => handleUpdateItem(item.id, { answer: e.target.value })}
                                />
                                <Button size="sm" variant="outline" onClick={() => setEditingFaqItem(null)} className="text-xs">Done</Button>
                              </div>
                            ) : (
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-foreground">{item.question}</p>
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.answer}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <Input
                                    type="number"
                                    value={item.sort_order}
                                    onChange={e => handleUpdateItem(item.id, { sort_order: parseInt(e.target.value) || 0 })}
                                    className="bg-muted text-foreground border-border h-7 w-14 text-xs text-center"
                                    title="Sort order"
                                  />
                                  <Switch
                                    checked={item.is_published}
                                    onCheckedChange={v => handleUpdateItem(item.id, { is_published: v })}
                                  />
                                  <button onClick={() => setEditingFaqItem(item.id)} className="text-muted-foreground hover:text-primary">
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </button>
                                  <button onClick={() => handleDeleteItem(item.id)} className="text-muted-foreground hover:text-destructive">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}

                        {/* Add item form */}
                        {addingSectionItem === section.id ? (
                          <div className="rounded border border-border bg-muted/50 p-3 space-y-2">
                            <Input
                              placeholder="Question"
                              value={newItemQuestion}
                              onChange={e => setNewItemQuestion(e.target.value)}
                              className="bg-muted text-foreground border-border text-sm"
                            />
                            <Textarea
                              placeholder="Answer"
                              value={newItemAnswer}
                              onChange={e => setNewItemAnswer(e.target.value)}
                              className="bg-muted text-foreground border-border text-sm"
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <Button size="sm" onClick={() => handleAddItem(section.id)} className="gradient-primary text-primary-foreground text-xs">Save</Button>
                              <Button size="sm" variant="outline" onClick={() => { setAddingSectionItem(null); setNewItemQuestion(""); setNewItemAnswer(""); }} className="text-xs">Cancel</Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => { setAddingSectionItem(section.id); setNewItemQuestion(""); setNewItemAnswer(""); }}
                            className="h-7 gap-1 text-xs"
                          >
                            <Plus className="h-3 w-3" /> Add Item
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
