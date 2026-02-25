import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  variant_id: string | null;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    category: string;
  };
  variant?: {
    id: string;
    label: string;
    price: number;
  } | null;
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (productId: string, variantId?: string) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  subtotal: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType>({
  items: [],
  loading: false,
  addToCart: async () => {},
  removeFromCart: async () => {},
  updateQuantity: async () => {},
  clearCart: async () => {},
  totalItems: 0,
  subtotal: 0,
  isOpen: false,
  setIsOpen: () => {},
});

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setItems([]); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from("cart_items")
      .select("id, product_id, quantity, variant_id, products(id, name, price, image_url, category)")
      .eq("user_id", user.id);

    if (!error && data) {
      // Fetch variant details for items that have variant_id
      const variantIds = (data as any[]).filter(d => d.variant_id).map(d => d.variant_id);
      let variantMap: Record<string, { id: string; label: string; price: number }> = {};
      if (variantIds.length > 0) {
        const { data: variants } = await supabase
          .from("product_variants" as any)
          .select("id, label, price")
          .in("id", variantIds);
        if (variants) {
          for (const v of variants as any[]) {
            variantMap[v.id] = { id: v.id, label: v.label, price: Number(v.price) };
          }
        }
      }

      setItems((data as any[]).map((item) => ({
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        variant_id: item.variant_id,
        product: item.products,
        variant: item.variant_id ? variantMap[item.variant_id] || null : null,
      })));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (productId: string, variantId?: string) => {
    if (!user) {
      toast.info("Please sign in to add items to your cart");
      return;
    }
    const existing = items.find(i => i.product_id === productId && (i.variant_id || null) === (variantId || null));
    if (existing) {
      await updateQuantity(existing.id, existing.quantity + 1);
    } else {
      const insertPayload: any = { user_id: user.id, product_id: productId, quantity: 1 };
      if (variantId) insertPayload.variant_id = variantId;
      const { error } = await supabase
        .from("cart_items")
        .insert(insertPayload);
      if (!error) {
        await fetchCart();
        toast.success("Added to cart");
        setIsOpen(true);
      }
    }
  };

  const removeFromCart = async (itemId: string) => {
    await supabase.from("cart_items").delete().eq("id", itemId);
    setItems(prev => prev.filter(i => i.id !== itemId));
    toast.success("Removed from cart");
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) { await removeFromCart(itemId); return; }
    await supabase.from("cart_items").update({ quantity }).eq("id", itemId);
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, quantity } : i));
  };

  const clearCart = async () => {
    if (!user) return;
    await supabase.from("cart_items").delete().eq("user_id", user.id);
    setItems([]);
  };

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => {
    const itemPrice = i.variant ? i.variant.price : Number(i.product.price);
    return sum + i.quantity * itemPrice;
  }, 0);

  return (
    <CartContext.Provider value={{ items, loading, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, subtotal, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
