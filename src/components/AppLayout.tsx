import { Outlet } from "react-router-dom";
import ResearchBanner from "./ResearchBanner";
import AppHeader from "./AppHeader";
import AppFooter from "./AppFooter";
import CartDrawer from "./CartDrawer";

const AppLayout = () => (
  <div className="flex min-h-screen flex-col bg-background">
    <ResearchBanner />
    <AppHeader />
    <main className="flex-1">
      <Outlet />
    </main>
    <AppFooter />
    <CartDrawer />
  </div>
);

export default AppLayout;
