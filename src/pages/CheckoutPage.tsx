import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Loader2, ShoppingBag, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const shippingSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  address: z.string().trim().min(1, "Address is required").max(200),
  city: z.string().trim().min(1, "City is required").max(100),
  state: z.string().trim().min(1, "State is required").max(100),
  zip: z.string().trim().min(1, "ZIP code is required").max(20),
});

type ShippingFormValues = z.infer<typeof shippingSchema>;

const CheckoutPage = () => {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: { name: "", email: "", address: "", city: "", state: "", zip: "" },
  });

  const onSubmit = async (values: ShippingFormValues) => {
    if (!user || items.length === 0) return;
    setSubmitting(true);

    try {
      // Insert order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          subtotal,
          shipping_name: values.name,
          shipping_email: values.email,
          shipping_address: values.address,
          shipping_city: values.city,
          shipping_state: values.state,
          shipping_zip: values.zip,
        })
        .select("id")
        .single();

      if (orderError || !order) throw orderError;

      // Insert order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_time: Number(item.product.price),
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      // Clear cart
      await clearCart();

      navigate(`/app/order-confirmation/${order.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-24">
        <ShoppingBag className="h-16 w-16 text-muted-foreground" />
        <p className="text-lg text-muted-foreground">Your cart is empty</p>
        <Button asChild variant="outline">
          <Link to="/app/shop">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/app/shop" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Shop
      </Link>

      <h1 className="mb-8 text-3xl font-black uppercase tracking-wider text-foreground">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-5">
        {/* Shipping Form */}
        <div className="lg:col-span-3">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg font-bold uppercase tracking-wider text-foreground">
                Shipping Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" id="checkout-form">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Full Name</FormLabel>
                      <FormControl><Input placeholder="John Doe" className="bg-background border-border" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Email</FormLabel>
                      <FormControl><Input type="email" placeholder="john@example.com" className="bg-background border-border" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="address" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Street Address</FormLabel>
                      <FormControl><Input placeholder="123 Main St" className="bg-background border-border" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid gap-4 sm:grid-cols-3">
                    <FormField control={form.control} name="city" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">City</FormLabel>
                        <FormControl><Input placeholder="New York" className="bg-background border-border" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="state" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">State</FormLabel>
                        <FormControl><Input placeholder="NY" className="bg-background border-border" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="zip" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">ZIP Code</FormLabel>
                        <FormControl><Input placeholder="10001" className="bg-background border-border" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-2">
          <Card className="border-border bg-card sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg font-bold uppercase tracking-wider text-foreground">
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    ${(item.quantity * Number(item.product.price)).toFixed(2)}
                  </p>
                </div>
              ))}
              <Separator className="bg-border" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Subtotal</span>
                <span className="text-lg font-black text-primary">${subtotal.toFixed(2)}</span>
              </div>
              <Button
                type="submit"
                form="checkout-form"
                disabled={submitting}
                className="w-full gradient-primary text-primary-foreground font-bold uppercase tracking-wider"
              >
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Placing Order...</> : "Place Order"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
