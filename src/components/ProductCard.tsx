import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { Badge } from "@/components/ui/badge";

export interface ProductVariant {
  id: string;
  label: string;
  price: number;
  stock_quantity: number;
  sort_order: number;
}

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  description: string;
  is_best_seller: boolean;
  image_url?: string | null;
  stock_quantity?: number;
  variants?: ProductVariant[];
}

const ProductCard = ({ id, name, slug, price, category, description, is_best_seller, image_url, stock_quantity = 0, variants = [] }: ProductCardProps) => {
  const sortedVariants = [...variants].sort((a, b) => a.sort_order - b.sort_order);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(sortedVariants[0] || null);

  const currentPrice = selectedVariant ? selectedVariant.price : price;
  const isOutOfStock = selectedVariant ? selectedVariant.stock_quantity <= 0 : stock_quantity <= 0;
  const { addToCart } = useCart();

  return (
    <div className="group relative flex flex-col sm:flex-row rounded-lg border border-border bg-card p-4 card-glow-hover gap-4">
      <Link to={`/app/product/${slug}`} className="flex w-full h-40 sm:w-28 sm:h-auto shrink-0 items-center justify-center rounded-md overflow-hidden sm:self-stretch">
        {image_url ? (
          <img src={image_url} alt={name} className="h-full w-full object-contain" />
        ) : (
          <FlaskConical className="h-10 w-10 text-primary/40" />
        )}
      </Link>

      <div className="flex flex-col flex-1 min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className="w-fit border-primary/30 text-primary text-[10px]">
            {category}
          </Badge>
          {is_best_seller && (
            <Badge className="gradient-primary border-0 text-primary-foreground text-[10px] font-bold uppercase">
              Best Seller
            </Badge>
          )}
        </div>

        <Link to={`/app/product/${slug}`} className="group/link">
          <h3 className="mb-1 text-base font-bold uppercase tracking-wide text-foreground group-hover/link:text-primary transition-colors">{name}</h3>
        </Link>
        <p className="mb-4 line-clamp-3 text-xs text-muted-foreground leading-relaxed">{description}</p>

        <div className="mt-auto flex flex-col items-start gap-2">
          {sortedVariants.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {sortedVariants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v)}
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold border transition-colors ${
                    selectedVariant?.id === v.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          )}
          <span className="text-xl font-black text-foreground">${currentPrice.toFixed(2)}</span>
          <Button
            size="sm"
            onClick={() => addToCart(id, selectedVariant?.id)}
            disabled={isOutOfStock}
            className={isOutOfStock ? "w-full font-semibold text-xs uppercase tracking-wider" : "w-full gradient-primary text-primary-foreground font-semibold text-xs uppercase tracking-wider gap-1.5"}
          >
            {isOutOfStock ? "Out of Stock" : <><ShoppingCart className="h-3.5 w-3.5" /> Add to Cart</>}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
