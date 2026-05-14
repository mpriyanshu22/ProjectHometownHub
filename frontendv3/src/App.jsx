import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import ApplyServiceProviderPage from "./pages/ApplyServiceProviderPage";
import CreateCommunityPage from "./pages/CreateCommunityPage";
import CreateEventPage from "./pages/CreateEventPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";
import EventsPage from "./pages/EventsPage";
import ServiceProvidersPage from "./pages/ServiceProvidersPage";
import AdminDashboard from "./pages/AdminDashboard";
import ContactProviderPage from "./pages/ContactProviderPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/create-community" element={<CreateCommunityPage />} />
            <Route path="/create-event" element={<CreateEventPage />} />
            <Route path="/apply-service-provider" element={<ApplyServiceProviderPage />} />
          </Route>

          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/service-providers" element={<ServiceProvidersPage />} />
          <Route path="/contact-provider/:id" element={<ContactProviderPage />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
