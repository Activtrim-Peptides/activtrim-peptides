import { Link } from "react-router-dom";
import { ArrowRight, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const categories = [
  { name: "Weight Loss Peptides", desc: "Compounds studied for metabolic support and body composition research, including GLP-1 class peptides." },
  { name: "Performance & Recovery", desc: "Peptides researched for muscle repair, endurance, and physical optimization." },
  { name: "Anti-Aging & Longevity", desc: "Compounds under research for cellular health, collagen synthesis, and longevity pathways." },
  { name: "Cognitive Enhancement", desc: "Nootropic peptides being studied for neuroprotection and cognitive function." },
  { name: "Sexual Health", desc: "Research peptides studied in the context of hormonal and sexual health pathways." },
];

const CategoriesPage = () => {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    supabase.from("products").select("category").then(({ data }) => {
      if (data) {
        const c: Record<string, number> = {};
        data.forEach(p => { c[p.category] = (c[p.category] || 0) + 1; });
        setCounts(c);
      }
    });
  }, []);

  return (
    <div className="container py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black tracking-wider text-foreground md:text-5xl">SHOP BY CATEGORY</h1>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map(cat => (
          <div key={cat.name} className="rounded-lg border border-border bg-card p-8 card-glow-hover flex flex-col">
            <FlaskConical className="mb-4 h-10 w-10 text-primary" />
            <h2 className="mb-2 text-lg font-bold uppercase tracking-wider text-foreground">{cat.name}</h2>
            <p className="mb-4 text-sm text-muted-foreground leading-relaxed flex-1">{cat.desc}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{counts[cat.name] || 0} Products</span>
              <Link to={`/app/shop?category=${encodeURIComponent(cat.name)}`}>
                <Button size="sm" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold text-xs gap-1">
                  Explore <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;
