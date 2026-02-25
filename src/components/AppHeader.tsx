import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, LogOut, LogIn, Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const navLinks = [
  { to: "/app/home", label: "Home" },
  { to: "/app/best-sellers", label: "Best Sellers" },
  { to: "/app/shop", label: "Shop" },
  { to: "/app/categories", label: "Categories" },
  { to: "/app/faq", label: "Peptide FAQ" },
  { to: "/app/contact", label: "Contact Us" },
];

const AppHeader = () => {
  const { user, signOut, isAdmin } = useAuth();
  const { totalItems, setIsOpen } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  const handleCartClick = () => {
    if (!user) {
      toast.info("Please sign in to use your cart");
      navigate("/login");
      return;
    }
    setIsOpen(true);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/app/home" className="text-lg font-black tracking-wider text-foreground">
          ACTIVTRIM <span className="text-primary">PEPTIDES</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === link.to ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user && isAdmin && (
            <Link to="/app/admin">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                <Shield className="h-5 w-5" />
              </Button>
            </Link>
          )}
          <button
            onClick={handleCartClick}
            className="relative rounded-md p-2 text-muted-foreground transition-colors hover:text-primary"
          >
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {totalItems}
              </span>
            )}
          </button>
          {user ? (
            <Button variant="ghost" size="icon" onClick={signOut} className="text-muted-foreground hover:text-primary">
              <LogOut className="h-5 w-5" />
            </Button>
          ) : (
            <Link to="/login">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                <LogIn className="h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
