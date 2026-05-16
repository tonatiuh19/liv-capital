import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import { store } from "@/store/store";
import SiteGate from "@/components/SiteGate";
import Index from "./pages/Index";
import ScheduleVisit from "./pages/ScheduleVisit";
import ModelDetail from "./pages/ModelDetail";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminVisits from "./pages/admin/AdminVisits";
import AdminContacts from "./pages/admin/AdminContacts";
import AdminModels from "./pages/admin/AdminModels";
import AdminAdmins from "./pages/admin/AdminAdmins";
import AdminAmenities from "./pages/admin/AdminAmenities";
import AdminClients from "./pages/admin/AdminClients";
import AdminPOI from "./pages/admin/AdminPOI";
import AdminGallery from "./pages/admin/AdminGallery";
import AdminGuard from "./components/admin/AdminGuard";
import AdminLayout from "./components/admin/AdminLayout";

const queryClient = new QueryClient();

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Admin routes — bypass SiteGate */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={<Navigate to="/admin/dashboard" replace />}
            />
            <Route
              path="/admin/*"
              element={
                <AdminGuard>
                  <AdminLayout />
                </AdminGuard>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="visitas" element={<AdminVisits />} />
              <Route path="contactos" element={<AdminContacts />} />
              <Route path="modelos" element={<AdminModels />} />
              <Route path="amenidades" element={<AdminAmenities />} />
              <Route path="ubicacion" element={<AdminPOI />} />
              <Route path="administradores" element={<AdminAdmins />} />
              <Route path="clientes" element={<AdminClients />} />
              <Route path="galeria" element={<AdminGallery />} />
            </Route>

            {/* Public routes — behind SiteGate */}
            <Route
              path="/*"
              element={
                <SiteGate>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/agendar-visita" element={<ScheduleVisit />} />
                    <Route path="/modelos/:slug" element={<ModelDetail />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </SiteGate>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(<App />);
}
