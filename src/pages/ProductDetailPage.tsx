import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import ProductDetailSection from "@/components/ProductDetailSection";
import ProductCard from "@/components/ProductCard";
import {
  ShoppingCart, ArrowLeft, FlaskConical, Beaker, Thermometer, Syringe,
  CheckCircle2, Clock, Activity, BookOpen, TestTubes, ListChecks,
} from "lucide-react";

interface BenefitItem { title: string; description: string; }
interface ProtocolItem { name: string; dosage: string; frequency: string; duration: string; }
interface TimelineItem { timeframe: string; description: string; }
interface IndicationItem { indication: string; }
interface StepItem { step: string; }

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: details } = useQuery({
    queryKey: ["product-details", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_details" as any)
        .select("*")
        .eq("product_id", id!)
        .maybeSingle();
      if (error) throw error;
      return data as any;
    },
    enabled: !!id,
  });

  const { data: relatedProducts } = useQuery({
    queryKey: ["related-products", product?.category, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category", product!.category)
        .neq("id", id!)
        .limit(3);
      if (error) throw error;
      return data;
    },
    enabled: !!product?.category,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 p-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <FlaskConical className="mb-4 h-16 w-16 text-muted-foreground" />
        <h1 className="mb-2 text-2xl font-extrabold uppercase text-foreground">Product Not Found</h1>
        <p className="mb-6 text-muted-foreground">The peptide you're looking for doesn't exist.</p>
        <Button asChild variant="outline">
          <Link to="/app/shop">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Shop
          </Link>
        </Button>
      </div>
    );
  }

  const benefits: BenefitItem[] = details?.key_benefits ?? [];
  const protocols: ProtocolItem[] = details?.research_protocols ?? [];
  const timeline: TimelineItem[] = details?.what_to_expect ?? [];
  const indications: IndicationItem[] = details?.research_indications ?? [];
  const steps: StepItem[] = details?.quick_start_guide ?? [];

  return (
    <>
      <Helmet>
        <title>{product.name} — Activtrim Peptides</title>
        <meta name="description" content={product.description} />
      </Helmet>

      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Back link */}
        <Link to="/app/shop" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Shop
        </Link>

        <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Main content */}
          <div className="space-y-6">
            {/* Header card */}
            <div className="rounded-lg border border-border bg-card p-6 md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <Badge variant="outline" className="mb-3 border-primary/30 text-primary text-[10px]">
                    {product.category}
                  </Badge>
                  <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-wide text-foreground">
                    {product.name}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-foreground">${product.price.toFixed(2)}</div>
                  {product.is_best_seller && (
                    <Badge className="mt-2 gradient-primary border-0 text-primary-foreground text-[10px] font-bold uppercase">
                      Best Seller
                    </Badge>
                  )}
                </div>
              </div>

              {/* Quick stats */}
              <div className="mt-6 grid grid-cols-3 gap-4 rounded-md border border-border bg-secondary/50 p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Beaker className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-semibold text-foreground">Lyophilized</div>
                    <div>Dosage Form</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Syringe className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-semibold text-foreground">Subcutaneous</div>
                    <div>Administration</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Thermometer className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-semibold text-foreground">2-8°C</div>
                    <div>Storage</div>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => addToCart(product.id)}
                className="mt-6 w-full gradient-primary text-primary-foreground font-semibold text-sm uppercase tracking-wider gap-2 lg:hidden"
                size="lg"
              >
                <ShoppingCart className="h-4 w-4" /> Add to Cart
              </Button>
            </div>

            {/* Sections */}
            {details?.what_is && (
              <ProductDetailSection number={1} title={`What is ${product.name}?`}>
                <p className="text-sm">{details.what_is}</p>
              </ProductDetailSection>
            )}

            {benefits.length > 0 && (
              <ProductDetailSection number={2} title="Key Benefits">
                <div className="grid gap-4 sm:grid-cols-2">
                  {benefits.map((b, i) => (
                    <div key={i} className="rounded-md border border-border bg-secondary/40 p-4">
                      <div className="mb-1 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span className="text-sm font-bold text-foreground">{b.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{b.description}</p>
                    </div>
                  ))}
                </div>
              </ProductDetailSection>
            )}

            {details?.mechanism_of_action && (
              <ProductDetailSection number={3} title="Mechanism of Action">
                <div className="flex items-start gap-3">
                  <Activity className="mt-1 h-5 w-5 shrink-0 text-primary" />
                  <p className="text-sm">{details.mechanism_of_action}</p>
                </div>
              </ProductDetailSection>
            )}

            {steps.length > 0 && (
              <ProductDetailSection number={4} title="Quick Start Guide">
                <ol className="space-y-3">
                  {steps.map((s, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="text-sm">{s.step}</span>
                    </li>
                  ))}
                </ol>
              </ProductDetailSection>
            )}

            {indications.length > 0 && (
              <ProductDetailSection number={5} title="Research Indications">
                <ul className="grid gap-2 sm:grid-cols-2">
                  {indications.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <BookOpen className="h-4 w-4 shrink-0 text-primary" />
                      {item.indication}
                    </li>
                  ))}
                </ul>
              </ProductDetailSection>
            )}

            {protocols.length > 0 && (
              <ProductDetailSection number={6} title="Research Protocols">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs uppercase">Protocol</TableHead>
                        <TableHead className="text-xs uppercase">Dosage</TableHead>
                        <TableHead className="text-xs uppercase">Frequency</TableHead>
                        <TableHead className="text-xs uppercase">Duration</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {protocols.map((p, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-semibold text-foreground text-sm">{p.name}</TableCell>
                          <TableCell className="text-sm">{p.dosage}</TableCell>
                          <TableCell className="text-sm">{p.frequency}</TableCell>
                          <TableCell className="text-sm">{p.duration}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ProductDetailSection>
            )}

            {timeline.length > 0 && (
              <ProductDetailSection number={7} title="What to Expect">
                <div className="space-y-4">
                  {timeline.map((t, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <Clock className="h-5 w-5 text-primary" />
                        {i < timeline.length - 1 && (
                          <div className="mt-1 w-px flex-1 bg-border" />
                        )}
                      </div>
                      <div className="pb-4">
                        <div className="text-sm font-bold text-foreground">{t.timeframe}</div>
                        <p className="text-xs text-muted-foreground">{t.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ProductDetailSection>
            )}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-6 space-y-6">
              {/* Purchase card */}
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="mb-1 text-xs uppercase text-muted-foreground font-semibold tracking-wider">Price</div>
                <div className="mb-4 text-3xl font-black text-foreground">${product.price.toFixed(2)}</div>
                <Button
                  onClick={() => addToCart(product.id)}
                  className="w-full gradient-primary text-primary-foreground font-semibold text-sm uppercase tracking-wider gap-2"
                  size="lg"
                >
                  <ShoppingCart className="h-4 w-4" /> Add to Cart
                </Button>
                <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between"><span>Category</span><span className="text-foreground">{product.category}</span></div>
                  <div className="flex justify-between"><span>Status</span><span className={product.in_stock ? "text-primary" : "text-destructive"}>{product.in_stock ? "In Stock" : "Out of Stock"}</span></div>
                  <div className="flex justify-between"><span>Purity</span><span className="text-foreground">≥98%</span></div>
                </div>
              </div>

              {/* Related products */}
              {relatedProducts && relatedProducts.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-foreground">Related Products</h3>
                  <div className="space-y-3">
                    {relatedProducts.map((rp) => (
                      <Link
                        key={rp.id}
                        to={`/app/product/${rp.id}`}
                        className="flex items-center gap-3 rounded-md border border-border bg-card p-3 transition-colors hover:border-primary/40"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-muted">
                          <FlaskConical className="h-5 w-5 text-primary/40" />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-sm font-bold text-foreground">{rp.name}</div>
                          <div className="text-xs text-muted-foreground">${rp.price.toFixed(2)}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetailPage;
