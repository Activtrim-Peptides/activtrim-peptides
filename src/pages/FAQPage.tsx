import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqSections = [
  {
    title: "General Research Questions",
    items: [
      { q: "What are peptides?", a: "Peptides are short chains of amino acids (typically 2-50) linked by peptide bonds. They serve as fundamental building blocks in biological research and are widely studied for their roles in cell signaling, immune response, and metabolic regulation." },
      { q: 'What does "research use only" mean?', a: "All products sold by Activtrim Peptides are manufactured and sold exclusively for in-vitro laboratory research, scientific study, and educational purposes. They are not intended for use in humans or animals outside of controlled research settings." },
      { q: "Are these products safe for human consumption?", a: "No. All products are strictly for laboratory research purposes. They are not dietary supplements, drugs, or food products and should never be ingested, injected, or applied to humans or animals outside approved research protocols." },
      { q: "Who should purchase research peptides?", a: "Our products are intended for qualified researchers, laboratories, educational institutions, and individuals conducting legitimate scientific research. Purchasers must be 18 years of age or older." },
    ],
  },
  {
    title: "Product & Quality",
    items: [
      { q: "What purity levels do your peptides have?", a: "All peptides maintain a minimum purity of 99.9% as verified by High-Performance Liquid Chromatography (HPLC) and Mass Spectrometry (MS) analysis." },
      { q: "Are products third-party tested?", a: "Yes. Every batch undergoes independent third-party testing at certified analytical laboratories. Certificates of Analysis (CoA) are available upon request for any product." },
      { q: "How are products stored and shipped?", a: "Products are stored in climate-controlled facilities and shipped in insulated packaging with cold packs when required. Lyophilized peptides are shipped at ambient temperature with desiccant." },
      { q: "What is the shelf life of research peptides?", a: "When stored properly (typically -20°C for long-term, 2-8°C for short-term), most lyophilized peptides maintain stability for 24+ months. Reconstituted peptides should be used within 30 days." },
    ],
  },
  {
    title: "Ordering & Account",
    items: [
      { q: "Do I need an account to purchase?", a: "Yes. All customers must create a verified account before browsing or purchasing products. This helps us ensure responsible distribution of research compounds." },
      { q: "What payment methods are accepted?", a: "We accept major credit cards, debit cards, and select cryptocurrency payments. All transactions are processed securely with industry-standard encryption." },
      { q: "How does shipping work?", a: "Orders are processed within 24 hours of payment confirmation. Standard shipping is 3-5 business days within the US. Express and international shipping options are available at checkout." },
      { q: "What is your return/refund policy?", a: "We offer refunds or replacements for products that arrive damaged or do not meet stated purity specifications. Contact our support team within 7 days of delivery for assistance." },
    ],
  },
  {
    title: "Research-Specific",
    items: [
      { q: "What is the difference between GLP-1 peptides and other classes?", a: "GLP-1 (Glucagon-Like Peptide-1) agonists specifically target incretin receptors involved in glucose metabolism and appetite regulation. Other peptide classes target different biological pathways such as growth hormone release, tissue repair, or neurotransmitter modulation." },
      { q: "What are the most commonly researched peptide categories?", a: "The most active areas of peptide research include metabolic regulation (GLP-1 agonists), tissue repair (BPC-157, TB-500), growth hormone secretion (CJC-1295, Ipamorelin), neuroprotection (Semax, Selank), and cellular longevity (Epitalon)." },
      { q: "Where can I learn more about peptide research?", a: "We recommend PubMed, Google Scholar, and institutional research databases for peer-reviewed literature on peptide studies. Our FAQ and product descriptions also reference key research areas for each compound." },
    ],
  },
];

const FAQPage = () => (
  <div className="container max-w-3xl py-12">
    <div className="mb-10 text-center">
      <h1 className="text-4xl font-black tracking-wider text-foreground md:text-5xl">PEPTIDE FAQ</h1>
      <p className="mt-3 text-muted-foreground">Everything researchers need to know</p>
    </div>

    {faqSections.map(section => (
      <div key={section.title} className="mb-8">
        <h2 className="mb-4 text-lg font-bold uppercase tracking-wider text-primary">{section.title}</h2>
        <Accordion type="single" collapsible className="space-y-2">
          {section.items.map((item, i) => (
            <AccordionItem key={i} value={`${section.title}-${i}`} className="rounded-lg border border-border bg-card px-5">
              <AccordionTrigger className="text-left text-sm font-semibold text-foreground hover:text-primary [&[data-state=open]>svg]:text-primary">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    ))}
  </div>
);

export default FAQPage;
