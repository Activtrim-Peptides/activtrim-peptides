import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Loader2 } from "lucide-react";

interface OrderData {
  id: string;
  status: string;
  subtotal: number;
  shipping_name: string;
  shipping_email: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  created_at: string;
}

interface OrderItemData {
  id: string;
  quantity: number;
  price_at_time: number;
  products: { name: string } | null;
}

const OrderConfirmationPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [items, setItems] = useState<OrderItemData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      const [orderRes, itemsRes] = await Promise.all([
        supabase.from("orders").select("*").eq("id", orderId).single(),
        supabase.from("order_items").select("id, quantity, price_at_time, products(name)").eq("order_id", orderId),
      ]);
      if (orderRes.data) setOrder(orderRes.data as OrderData);
      if (itemsRes.data) setItems(itemsRes.data as unknown as OrderItemData[]);
      setLoading(false);
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-muted-foreground">
        <p>Order not found.</p>
        <Button asChild variant="outline"><Link to="/app/shop">Back to Shop</Link></Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <CheckCircle className="h-16 w-16 text-primary" />
        <h1 className="text-3xl font-black uppercase tracking-wider text-foreground">Order Confirmed</h1>
        <p className="text-sm text-muted-foreground">Order ID: {order.id.slice(0, 8).toUpperCase()}</p>
      </div>

      <Card className="border-border bg-card mb-6">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground">Items Ordered</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">{item.products?.name ?? "Unknown"}</p>
                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-semibold text-foreground">
                ${(item.quantity * Number(item.price_at_time)).toFixed(2)}
              </p>
            </div>
          ))}
          <Separator className="bg-border" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Total</span>
            <span className="text-lg font-black text-primary">${Number(order.subtotal).toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card mb-8">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground">Shipping Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-foreground">
          <p className="font-medium">{order.shipping_name}</p>
          <p className="text-muted-foreground">{order.shipping_email}</p>
          <p>{order.shipping_address}</p>
          <p>{order.shipping_city}, {order.shipping_state} {order.shipping_zip}</p>
        </CardContent>
      </Card>

      <div className="text-center">
        <Button asChild className="gradient-primary text-primary-foreground font-bold uppercase tracking-wider">
          <Link to="/app/shop">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
