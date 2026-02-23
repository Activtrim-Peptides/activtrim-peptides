import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";

const CartDrawer = () => {
  const { items, isOpen, setIsOpen, removeFromCart, updateQuantity, subtotal } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="flex w-full flex-col border-border bg-background sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-left text-lg font-black uppercase tracking-wider text-foreground">
            Your Cart
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground">
            <ShoppingBag className="h-12 w-12" />
            <p className="text-sm">Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto py-4">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-4 rounded-lg border border-border bg-card p-3">
                  <div className="h-16 w-16 rounded-md bg-muted flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{item.product.name}</p>
                    <p className="text-xs text-primary">${Number(item.product.price).toFixed(2)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="rounded bg-muted p-1 text-foreground hover:bg-surface-hover">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="min-w-[20px] text-center text-sm font-medium text-foreground">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="rounded bg-muted p-1 text-foreground hover:bg-surface-hover">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">${(item.quantity * Number(item.product.price)).toFixed(2)}</p>
                    <button onClick={() => removeFromCart(item.id)} className="mt-2 text-destructive hover:text-destructive/80">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Subtotal</span>
                <span className="text-lg font-black text-primary">${subtotal.toFixed(2)}</span>
              </div>
              <Button
                className="w-full gradient-primary text-primary-foreground font-bold uppercase tracking-wider"
                onClick={() => toast.info("Checkout coming soon!")}
              >
                Checkout
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
