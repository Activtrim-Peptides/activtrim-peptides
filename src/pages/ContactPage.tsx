import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Helmet } from "react-helmet-async";
import { CheckCircle, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const contactSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  phone: z.string().trim().min(1, "Phone number is required").max(30),
  inquiryType: z.enum(["General Inquiry", "Request a Product", "Discuss Partnerships"]),
  message: z.string().trim().min(1, "Message is required").max(2000),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const ContactPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      inquiryType: "General Inquiry",
      message: "",
    },
  });

  const onSubmit = async (values: ContactFormValues) => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("contact_inquiries" as any).insert({
        full_name: values.fullName,
        email: values.email,
        phone: values.phone,
        inquiry_type: values.inquiryType,
        message: values.message,
        user_id: user.id,
      } as any);

      if (error) throw error;

      // Fire-and-forget Slack notification
      supabase.functions.invoke("send-contact-to-slack", {
        body: {
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
          inquiryType: values.inquiryType,
          message: values.message,
        },
      });

      setSubmitted(true);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <>
        <Helmet>
          <title>Thank You | ActivTrim Peptides</title>
        </Helmet>
        <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
          <div className="rounded-xl border border-border bg-card p-10 shadow-sm">
            <CheckCircle className="mx-auto mb-4 h-14 w-14 text-primary" />
            <h1 className="mb-2 text-2xl font-bold text-foreground">Thank You for Reaching Out!</h1>
            <p className="text-muted-foreground">
              We've received your inquiry and will be in contact shortly.
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Contact Us | ActivTrim Peptides</title>
        <meta name="description" content="Get in touch with ActivTrim Peptides for inquiries, product requests, or partnership discussions." />
      </Helmet>
      <div className="container max-w-xl py-10">
        <h1 className="mb-6 text-2xl font-bold text-foreground">Contact Us</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="(555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="inquiryType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How Can We Help You?</FormLabel>
                  <FormControl>
                    <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col gap-3 pt-1">
                      {["General Inquiry", "Request a Product", "Discuss Partnerships"].map((opt) => (
                        <label key={opt} className="flex cursor-pointer items-center gap-2">
                          <RadioGroupItem value={opt} />
                          <span className="text-sm text-foreground">{opt}</span>
                        </label>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tell us more..." rows={5} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={loading} className="w-full gap-2">
              <Send className="h-4 w-4" />
              {loading ? "Sending…" : "Send Message"}
            </Button>
          </form>
        </Form>
      </div>
    </>
  );
};

export default ContactPage;
