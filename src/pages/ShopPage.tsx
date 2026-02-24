import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";
import { Checkbox } from "@/components/ui/checkbox";

const allCategories = [
  "Weight Loss Peptides",
  "Performance & Recovery",
  "Anti-Aging & Longevity",
  "Cognitive Enhancement",
  "Sexual Health",
];

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("name");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const cat = searchParams.get("category");
    return cat ? [cat] : [];
  });

  useEffect(() => {
    setLoading(true);
    let query = supabase.from("products").select("*").eq("in_stock", true);

    if (selectedCategories.length > 0) {
      query = query.in("category", selectedCategories);
    }

    if (sort === "price-asc") query = query.order("price", { ascending: true });
    else if (sort === "price-desc") query = query.order("price", { ascending: false });
    else if (sort === "newest") query = query.order("created_at", { ascending: false });
    else query = query.order("name");

    query.then(async ({ data }) => {
      const products = data || [];
      // Fetch variants for all products
      if (products.length > 0) {
        const productIds = products.map(p => p.id);
        const { data: variants } = await supabase
          .from("product_variants" as any)
          .select("*")
          .in("product_id", productIds)
          .order("sort_order");
        
        const variantMap: Record<string, any[]> = {};
        if (variants) {
          for (const v of variants as any[]) {
            if (!variantMap[v.product_id]) variantMap[v.product_id] = [];
            variantMap[v.product_id].push(v);
          }
        }
        
        setProducts(products.map(p => ({ ...p, variants: variantMap[p.id] || [] })));
      } else {
        setProducts([]);
      }
      setLoading(false);
    });
  }, [sort, selectedCategories]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  return (
    <div className="container py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black tracking-wider text-foreground md:text-5xl">ALL PRODUCTS</h1>
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        {/* Sidebar */}
        <aside className="w-full shrink-0 md:w-56">
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-foreground">Categories</h3>
            <div className="space-y-3">
              {allCategories.map(cat => (
                <label key={cat} className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                  <Checkbox
                    checked={selectedCategories.includes(cat)}
                    onCheckedChange={() => toggleCategory(cat)}
                  />
                  <span className="text-xs">{cat}</span>
                </label>
              ))}
            </div>

            <h3 className="mb-3 mt-6 text-xs font-bold uppercase tracking-wider text-foreground">Sort By</h3>
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="w-full rounded-md border border-border bg-muted px-3 py-2 text-xs text-foreground"
            >
              <option value="name">Name A-Z</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : products.length === 0 ? (
            <p className="py-20 text-center text-muted-foreground">No products found.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {products.map(p => <ProductCard key={p.id} {...p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
