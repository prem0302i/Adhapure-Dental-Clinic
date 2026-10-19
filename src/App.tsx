import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation, Outlet } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

import { Hero } from "@/components/sections/Hero";
import { TreatmentsOverview } from "@/components/sections/TreatmentsOverview";
import { ClinicIntro } from "@/components/sections/ClinicIntro";
import { TeamPreview } from "@/components/sections/TeamPreview";
import { GalleryPreview } from "@/components/sections/GalleryPreview";
import { TestimonialsPreview } from "@/components/sections/TestimonialsPreview";
import { LocationPreview } from "@/components/sections/LocationPreview";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { PageMeta } from "@/components/ui/PageMeta";

import AboutPage from "@/pages/AboutPage";
import ServicesPage from "@/pages/ServicesPage";
import DoctorsPage from "@/pages/DoctorsPage";
import GalleryPage from "@/pages/GalleryPage";
import AppointmentPage from "@/pages/AppointmentPage";
import ContactPage from "@/pages/ContactPage";
import PrivacyPage from "@/pages/PrivacyPage";

// Admin Portal Components
import { AdminAuthProvider } from "@/context/AdminAuthContext";
import { AdminLayout } from "@/components/admin/AdminLayout";
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminDoctorsPage from "@/pages/admin/AdminDoctorsPage";
import AdminTreatmentsPage from "@/pages/admin/AdminTreatmentsPage";
import AdminGalleryPage from "@/pages/admin/AdminGalleryPage";
import AdminAboutPage from "@/pages/admin/AdminAboutPage";
import AdminSettingsPage from "@/pages/admin/AdminSettingsPage";
import AdminHoursPage from "@/pages/admin/AdminHoursPage";
import AdminEnquiriesPage from "@/pages/admin/AdminEnquiriesPage";

import { pageMeta } from "@/lib/clinic-config";

function Home() {
  const meta = pageMeta["/"];
  return (
    <>
      <PageMeta title={meta.title} description={meta.description} />
      <Hero />
      <TreatmentsOverview />
      <ClinicIntro />
      <TeamPreview />
      <GalleryPreview />
      <TestimonialsPreview />
      <LocationPreview />
      <FinalCTA />
    </>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function NotFound() {
  return (
    <div className="container-wide section-gap text-center">
      <h1 className="text-3xl md:text-4xl">Page not found</h1>
      <p className="mt-4 text-muted">The page you were looking for does not exist.</p>
      <a href="/" className="mt-6 inline-block text-teal-deep hover:text-teal">
        Return to home
      </a>
    </div>
  );
}

function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-pill focus:bg-navy focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AdminAuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Admin Login Route (Unauthenticated entry) */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="enquiries" element={<AdminEnquiriesPage />} />
            <Route path="doctors" element={<AdminDoctorsPage />} />
            <Route path="treatments" element={<AdminTreatmentsPage />} />
            <Route path="gallery" element={<AdminGalleryPage />} />
            <Route path="about" element={<AdminAboutPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="hours" element={<AdminHoursPage />} />
          </Route>

          {/* Public Website Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/doctors" element={<DoctorsPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/appointment" element={<AppointmentPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AdminAuthProvider>
  );
}
