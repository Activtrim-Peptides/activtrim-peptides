import { Link } from "react-router-dom";
import { ShoppingCart, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  is_best_seller: boolean;
  image_url?: string | null;
}

const ProductCard = ({ id, name, price, category, description, is_best_seller }: ProductCardProps) => {
  const { addToCart } = useCart();

  return (
    <div className="group relative flex flex-col rounded-lg border border-border bg-card p-5 card-glow-hover">
      {is_best_seller && (
        <Badge className="absolute right-3 top-3 gradient-primary border-0 text-primary-foreground text-[10px] font-bold uppercase">
          Best Seller
        </Badge>
      )}

      <Link to={`/app/product/${id}`} className="block group/link">
        <div className="mb-4 flex h-32 items-center justify-center rounded-md bg-muted transition-colors group-hover/link:bg-muted/80">
          <FlaskConical className="h-12 w-12 text-primary/40" />
        </div>

        <Badge variant="outline" className="mb-2 w-fit border-primary/30 text-primary text-[10px]">
          {category}
        </Badge>

        <h3 className="mb-1 text-base font-bold uppercase tracking-wide text-foreground group-hover/link:text-primary transition-colors">{name}</h3>
      </Link>
      <p className="mb-4 line-clamp-2 text-xs text-muted-foreground leading-relaxed">{description}</p>

      <div className="mt-auto flex items-center justify-between">
        <span className="text-xl font-black text-foreground">${price.toFixed(2)}</span>
        <Button
          size="sm"
          onClick={() => addToCart(id)}
          className="gradient-primary text-primary-foreground font-semibold text-xs uppercase tracking-wider gap-1.5"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
