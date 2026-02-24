import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight, FlaskConical, Shield, Truck, Award, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Helmet } from "react-helmet-async";
import heroBg from "@/assets/hero-bg.png";

const categories = [
  { name: "Weight Loss Peptides", desc: "Compounds studied for metabolic support and body composition research, including GLP-1 class peptides." },
  { name: "Performance & Recovery", desc: "Peptides researched for muscle repair, endurance, and physical optimization." },
  { name: "Anti-Aging & Longevity", desc: "Compounds under research for cellular health, collagen synthesis, and longevity pathways." },
  { name: "Cognitive Enhancement", desc: "Nootropic peptides being studied for neuroprotection and cognitive function." },
  { name: "Sexual Health", desc: "Research peptides studied in the context of hormonal and sexual health pathways." },
];

const LandingPage = () => {
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("products").select("name, category, price").eq("is_best_seller", true).eq("in_stock", true).limit(6)
      .then(({ data }) => { if (data) setTopProducts(data); });
  }, []);

  return (
    <>
      <Helmet>
        <title>Research Peptides for Sale | Activtrim Peptides</title>
        <meta name="description" content="Activtrim Peptides offers pharmaceutical-grade research peptides including BPC-157, Semaglutide, Tirzepatide, TB-500 and more. For research use only." />
        <meta property="og:title" content="Research Peptides for Sale | Activtrim Peptides" />
        <meta property="og:description" content="Pharmaceutical-grade research peptides. 99.9% purity. Fast shipping. For research use only." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://activtrim-peptides.com" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Activtrim Peptides",
          "url": "https://activtrim-peptides.com",
          "description": "Research-grade peptides for laboratory and scientific research.",
          "sameAs": ["https://activtrim.com"]
        })}</script>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Research Banner */}
        <div className="gradient-primary py-1.5 text-center text-xs font-semibold tracking-wide text-primary-foreground">
          ⚗️ FOR RESEARCH USE ONLY — All products are strictly for scientific research.
        </div>

        {/* Header */}
        <header className="border-b border-border bg-background/95 backdrop-blur">
          <div className="container flex h-16 items-center justify-between">
            <span className="text-lg font-black tracking-wider text-foreground">
              ACTIVTRIM <span className="text-primary">PEPTIDES</span>
            </span>
            <div className="flex gap-3">
              <Link to="/login">
                <Button variant="outline" size="sm" className="border-border text-foreground hover:text-primary">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="gradient-primary text-primary-foreground font-semibold">Create Account</Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="relative overflow-hidden py-24 md:py-36">
          <img src={heroBg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-0 hero-bg-fade pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/50 to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(18_92%_47%/0.08),transparent_70%)]" />
          <div className="container relative z-10 text-center">
            <h1 className="mx-auto max-w-4xl text-4xl font-black tracking-tight text-foreground md:text-6xl lg:text-7xl">
              RESEARCH-GRADE PEPTIDES.{" "}
              <span className="text-primary text-glow">UNCOMPROMISING PURITY.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Activtrim Peptides supplies pharmaceutical-grade research compounds for serious scientists and researchers.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link to="/register">
                <Button size="lg" className="gradient-primary text-primary-foreground font-bold uppercase tracking-wider gap-2">
                  Access the Store <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">For Research Use Only. Account Required.</p>
          </div>
        </section>

        {/* Why Activtrim */}
        <section className="border-t border-border py-20">
          <div className="container">
            <h2 className="mb-12 text-center text-3xl font-black tracking-wider text-foreground">WHY ACTIVTRIM PEPTIDES</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                { icon: Shield, title: "Third-Party Tested", desc: "Every batch independently verified for purity and potency by certified laboratories." },
                { icon: Award, title: "99.9%+ Purity", desc: "Pharmaceutical-grade compounds with HPLC-verified purity exceeding 99.9%." },
                { icon: Truck, title: "Fast Fulfillment", desc: "Orders processed within 24 hours. Secure packaging with temperature-controlled shipping." },
              ].map(f => (
                <div key={f.title} className="rounded-lg border border-border bg-card p-8 text-center card-glow-hover">
                  <f.icon className="mx-auto mb-4 h-10 w-10 text-primary" />
                  <h3 className="mb-2 text-lg font-bold uppercase text-foreground">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="border-t border-border py-20">
          <div className="container">
            <h2 className="mb-12 text-center text-3xl font-black tracking-wider text-foreground">RESEARCH CATEGORIES</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map(c => (
                <div key={c.name} className="rounded-lg border border-border bg-card p-6 card-glow-hover">
                  <FlaskConical className="mb-3 h-8 w-8 text-primary" />
                  <h3 className="mb-2 text-sm font-bold uppercase text-foreground">{c.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link to="/register">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold uppercase tracking-wider whitespace-normal text-center h-auto py-3">
                  <span className="hidden sm:inline">Create a Free Account to Browse All Products</span>
                  <span className="sm:hidden">Create Account to Browse</span>
                  <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Top Compounds */}
        {topProducts.length > 0 && (
          <section className="border-t border-border py-20">
            <div className="container">
              <h2 className="mb-12 text-center text-3xl font-black tracking-wider text-foreground">TOP RESEARCH COMPOUNDS</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {topProducts.map(p => (
                  <div key={p.name} className="rounded-lg border border-border bg-card p-6 card-glow-hover">
                    <Badge variant="outline" className="mb-3 border-primary/30 text-primary text-[10px]">{p.category}</Badge>
                    <h3 className="mb-2 text-base font-bold uppercase text-foreground">{p.name}</h3>
                    <div className="relative mt-4 flex items-center gap-2">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground blur-sm select-none">${p.price}</span>
                      <span className="text-xs text-primary font-semibold">Login to View Pricing</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQ Teaser */}
        <section className="border-t border-border py-20">
          <div className="container max-w-3xl">
            <h2 className="mb-12 text-center text-3xl font-black tracking-wider text-foreground">FREQUENTLY ASKED</h2>
            {[
              { q: "What are peptides?", a: "Peptides are short chains of amino acids that serve as building blocks for proteins. They are widely studied in biomedical research." },
              { q: 'What does "research use only" mean?', a: "All products are sold exclusively for laboratory and scientific research purposes. They are not intended for human consumption." },
              { q: "What purity levels do your peptides have?", a: "All our peptides undergo rigorous third-party testing and maintain purity levels of 99.9% or higher, verified by HPLC analysis." },
            ].map(faq => (
              <div key={faq.q} className="mb-4 rounded-lg border border-border bg-card p-6">
                <h3 className="mb-2 text-sm font-bold uppercase text-foreground">{faq.q}</h3>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
            <div className="mt-8 text-center">
              <Link to="/login">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold">
                  View Full Research FAQ <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-12">
          <div className="container text-center">
            <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              <strong className="text-primary">FOR RESEARCH USE ONLY</strong> — All products sold by Activtrim Peptides are intended for laboratory and research purposes only. Not for human consumption. Must be 18+ to purchase.
            </p>
            <div className="mt-6 flex justify-center gap-6 text-sm text-muted-foreground">
              <Link to="/login" className="hover:text-primary">Login</Link>
              <Link to="/register" className="hover:text-primary">Register</Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">© {new Date().getFullYear()} Activtrim Peptides. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default LandingPage;
