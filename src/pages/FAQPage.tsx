import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_published: boolean;
}

interface FaqSection {
  id: string;
  title: string;
  sort_order: number;
  is_published: boolean;
  faq_items: FaqItem[];
}

const FAQPage = () => {
  const [sections, setSections] = useState<FaqSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      const { data } = await supabase
        .from("faq_sections")
        .select("*, faq_items(*)")
        .eq("is_published", true)
        .order("sort_order");
      if (data) {
        const filtered = (data as any[]).map(s => ({
          ...s,
          faq_items: (s.faq_items as FaqItem[])
            .filter(i => i.is_published)
            .sort((a, b) => a.sort_order - b.sort_order),
        })).filter(s => s.faq_items.length > 0);
        setSections(filtered);
      }
      setLoading(false);
    };
    fetchFaqs();
  }, []);

  if (loading) {
    return (
      <div className="container max-w-3xl py-12 flex justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black tracking-wider text-foreground md:text-5xl">PEPTIDE FAQ</h1>
        <p className="mt-3 text-muted-foreground">Everything researchers need to know</p>
      </div>

      {sections.map(section => (
        <div key={section.id} className="mb-8">
          <h2 className="mb-4 text-lg font-bold uppercase tracking-wider text-primary">{section.title}</h2>
          <Accordion type="single" collapsible className="space-y-2">
            {section.faq_items.map((item, i) => (
              <AccordionItem key={item.id} value={item.id} className="rounded-lg border border-border bg-card px-5">
                <AccordionTrigger className="text-left text-sm font-semibold text-foreground hover:text-primary [&[data-state=open]>svg]:text-primary">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ))}
    </div>
  );
};

export default FAQPage;
