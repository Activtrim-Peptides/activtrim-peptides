import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";

const BestSellersPage = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [sort, setSort] = useState("name");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    let query = supabase.from("products").select("*").eq("is_best_seller", true).eq("in_stock", true);
    if (sort === "price-asc") query = query.order("price", { ascending: true });
    else if (sort === "price-desc") query = query.order("price", { ascending: false });
    else if (sort === "newest") query = query.order("created_at", { ascending: false });
    else query = query.order("name");

    query.then(async ({ data }) => {
      const products = data || [];
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
  }, [sort]);

  return (
    <div className="container py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black tracking-wider text-foreground md:text-5xl">BEST SELLERS</h1>
        <p className="mt-3 text-muted-foreground">Our most trusted compounds for serious research</p>
      </div>

      <div className="mb-6 flex justify-end">
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground"
        >
          <option value="name">Name A-Z</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map(p => <ProductCard key={p.id} {...p} />)}
        </div>
      )}
    </div>
  );
};

export default BestSellersPage;
