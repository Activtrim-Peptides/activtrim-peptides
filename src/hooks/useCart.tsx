import { createContext, useContext, ReactNode, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    category: string;
  };
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (productId: string) => Promise<void>;
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
      .select("id, product_id, quantity, products(id, name, price, image_url, category)")
      .eq("user_id", user.id);

    if (!error && data) {
      setItems(data.map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        product: item.products,
      })));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (productId: string) => {
    if (!user) return;
    const existing = items.find(i => i.product_id === productId);
    if (existing) {
      await updateQuantity(existing.id, existing.quantity + 1);
    } else {
      const { error } = await supabase
        .from("cart_items")
        .insert({ user_id: user.id, product_id: productId, quantity: 1 });
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
  const subtotal = items.reduce((sum, i) => sum + i.quantity * Number(i.product.price), 0);

  return (
    <CartContext.Provider value={{ items, loading, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, subtotal, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
