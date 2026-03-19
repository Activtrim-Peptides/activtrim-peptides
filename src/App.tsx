import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppLayout from "@/components/AppLayout";

import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import HomePage from "@/pages/HomePage";
import BestSellersPage from "@/pages/BestSellersPage";
import ShopPage from "@/pages/ShopPage";
import CategoriesPage from "@/pages/CategoriesPage";
import FAQPage from "@/pages/FAQPage";
import ContactPage from "@/pages/ContactPage";
import AdminPage from "@/pages/AdminPage";
import ProductDetailPage from "@/pages/ProductDetailPage";
import CheckoutPage from "@/pages/CheckoutPage";
import OrderConfirmationPage from "@/pages/OrderConfirmationPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <CartProvider>
              <Routes>
                {/* Redirect root to the store */}
                <Route path="/" element={<Navigate to="/app/home" replace />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                {/* Public app routes */}
                <Route path="/app" element={<AppLayout />}>
                  <Route index element={<Navigate to="/app/home" replace />} />
                  <Route path="home" element={<HomePage />} />
                  <Route path="best-sellers" element={<BestSellersPage />} />
                  <Route path="shop" element={<ShopPage />} />
                  <Route path="categories" element={<CategoriesPage />} />
                  <Route path="faq" element={<FAQPage />} />
                  <Route path="contact" element={<ContactPage />} />
                  <Route path="product/:slug" element={<ProductDetailPage />} />
                  <Route path="checkout" element={<CheckoutPage />} />
                  <Route path="order-confirmation/:orderId" element={<OrderConfirmationPage />} />
                  {/* Admin stays protected */}
                  <Route path="admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
