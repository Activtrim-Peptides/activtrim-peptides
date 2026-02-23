interface ProductDetailSectionProps {
  number: number;
  title: string;
  children: React.ReactNode;
}

const ProductDetailSection = ({ number, title, children }: ProductDetailSectionProps) => {
  return (
    <div className="rounded-lg border border-border bg-card p-6 md:p-8">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full gradient-primary text-primary-foreground text-sm font-bold">
          {number}
        </div>
        <h2 className="text-lg md:text-xl font-extrabold uppercase tracking-wide text-foreground">
          {title}
        </h2>
      </div>
      <div className="text-muted-foreground leading-relaxed">{children}</div>
    </div>
  );
};

export default ProductDetailSection;
