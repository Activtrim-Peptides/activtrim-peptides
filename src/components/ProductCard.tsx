import { Link } from "react-router-dom";
import { ShoppingCart, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { Badge } from "@/components/ui/badge";

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
}

const ProductCard = ({ id, name, slug, price, category, description, is_best_seller, image_url, stock_quantity = 0 }: ProductCardProps) => {
  const isOutOfStock = stock_quantity <= 0;
  const { addToCart } = useCart();

  return (
    <div className="group relative flex flex-row rounded-lg border border-border bg-card p-4 card-glow-hover gap-4">
      {is_best_seller && (
        <Badge className="absolute right-3 top-3 gradient-primary border-0 text-primary-foreground text-[10px] font-bold uppercase z-10">
          Best Seller
        </Badge>
      )}

      <Link to={`/app/product/${slug}`} className="flex w-28 shrink-0 items-center justify-center rounded-md bg-muted overflow-hidden self-stretch transition-colors hover:bg-muted/80">
        {image_url ? (
          <img src={image_url} alt={name} className="h-full w-full object-contain" />
        ) : (
          <FlaskConical className="h-10 w-10 text-primary/40" />
        )}
      </Link>

      <div className="flex flex-col flex-1 min-w-0">
        <Badge variant="outline" className="mb-2 w-fit border-primary/30 text-primary text-[10px]">
          {category}
        </Badge>

        <Link to={`/app/product/${slug}`} className="group/link">
          <h3 className="mb-1 text-base font-bold uppercase tracking-wide text-foreground group-hover/link:text-primary transition-colors">{name}</h3>
        </Link>
        <p className="mb-4 line-clamp-2 text-xs text-muted-foreground leading-relaxed">{description}</p>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-xl font-black text-foreground">${price.toFixed(2)}</span>
          <Button
            size="sm"
            onClick={() => addToCart(id)}
            disabled={isOutOfStock}
            className={isOutOfStock ? "font-semibold text-xs uppercase tracking-wider" : "gradient-primary text-primary-foreground font-semibold text-xs uppercase tracking-wider gap-1.5"}
          >
            {isOutOfStock ? "Out of Stock" : <><ShoppingCart className="h-3.5 w-3.5" /> Add to Cart</>}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
