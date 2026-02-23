import { Link } from "react-router-dom";

const AppFooter = () => (
  <footer className="border-t border-border bg-background py-12">
    <div className="container">
      <div className="grid gap-8 md:grid-cols-3">
        <div>
          <h3 className="mb-3 text-lg font-black tracking-wider">
            ACTIVTRIM <span className="text-primary">PEPTIDES</span>
          </h3>
          <p className="text-sm text-muted-foreground">
            Premium research-grade peptides for serious scientists. Pharmaceutical purity. Fast shipping.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-foreground">Navigation</h4>
          <div className="flex flex-col gap-2">
            {["Home", "Shop", "Best Sellers", "Categories", "Peptide FAQ"].map(l => (
              <Link key={l} to={`/app/${l.toLowerCase().replace(/ /g, "-").replace("peptide-", "")}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {l}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-foreground">Legal</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong className="text-primary">FOR RESEARCH USE ONLY</strong> — All products sold by Activtrim Peptides are intended for laboratory and research purposes only. Not for human consumption. Must be 18+ to purchase.
          </p>
        </div>
      </div>
      <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Activtrim Peptides. All rights reserved.
      </div>
    </div>
  </footer>
);

export default AppFooter;
