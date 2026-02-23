import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Award, Truck, FlaskConical, Zap } from "lucide-react";
import ProductCard from "@/components/ProductCard";

const categories = [
  { name: "Weight Loss Peptides", slug: "Weight Loss Peptides" },
  { name: "Performance & Recovery", slug: "Performance & Recovery" },
  { name: "Anti-Aging & Longevity", slug: "Anti-Aging & Longevity" },
  { name: "Cognitive Enhancement", slug: "Cognitive Enhancement" },
  { name: "Sexual Health", slug: "Sexual Health" },
];

const HomePage = () => {
  const [bestSellers, setBestSellers] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("products").select("*").eq("is_best_seller", true).limit(4)
      .then(({ data }) => { if (data) setBestSellers(data); });
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-36">
        <div className="absolute inset-0 gradient-dark" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(18_92%_47%/0.1),transparent_60%)]" />
        <div className="container relative z-10 text-center">
          <h1 className="mx-auto max-w-4xl text-4xl font-black tracking-tight text-foreground md:text-6xl lg:text-7xl">
            ELEVATE YOUR{" "}
            <span className="text-primary text-glow">RESEARCH.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Premium peptides for serious researchers. Pharmaceutical-grade purity. Fast shipping.
          </p>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link to="/app/shop">
              <Button size="lg" className="gradient-primary text-primary-foreground font-bold uppercase tracking-wider gap-2">
                Shop Now <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/app/best-sellers">
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold uppercase tracking-wider">
                View Best Sellers
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="border-t border-border py-20">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: Award, title: "Pharmaceutical Purity", desc: "99.9%+ HPLC-verified purity on every compound." },
              { icon: Shield, title: "Third-Party Tested", desc: "Independent lab verification for every batch." },
              { icon: FlaskConical, title: "Research-Grade Only", desc: "Compounds formulated for serious scientific research." },
            ].map(f => (
              <div key={f.title} className="rounded-lg border border-border bg-card p-8 text-center card-glow-hover">
                <f.icon className="mx-auto mb-4 h-10 w-10 text-primary" />
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-t border-border py-20">
        <div className="container">
          <h2 className="mb-10 text-center text-3xl font-black tracking-wider text-foreground">EXPLORE BY CATEGORY</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {categories.map(c => (
              <Link
                key={c.name}
                to={`/app/shop?category=${encodeURIComponent(c.slug)}`}
                className="group rounded-lg border border-border bg-card p-6 text-center card-glow-hover"
              >
                <FlaskConical className="mx-auto mb-3 h-8 w-8 text-primary transition-transform group-hover:scale-110" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">{c.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="border-t border-border py-20">
          <div className="container">
            <h2 className="mb-10 text-center text-3xl font-black tracking-wider text-foreground">
              TOP <span className="text-primary">PERFORMERS</span>
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {bestSellers.map(p => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust Bar */}
      <section className="border-t border-border py-16">
        <div className="container">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { num: "500+", label: "Products Shipped" },
              { num: "99.9%", label: "Purity Guaranteed" },
              { num: "24hr", label: "Fast Turnaround" },
              { num: "100%", label: "Research-Grade Quality" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-black text-primary text-glow">{s.num}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Research Disclaimer */}
      <section className="border-t border-border py-16">
        <div className="container max-w-3xl text-center">
          <p className="text-sm italic text-muted-foreground leading-relaxed">
            All products sold by Activtrim Peptides are intended exclusively for laboratory and research purposes. These compounds are not dietary supplements, drugs, or intended for human consumption. By purchasing, you agree to use products solely for legitimate research applications. Must be 18+ to purchase.
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
