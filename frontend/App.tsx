import { BrowserRouter as Router, Routes, Route } from "react-router";
import HomePage from "@/pages/Home";
import AuthCallbackPage from "@/pages/AuthCallback";
import ExpertDashboard from "@/pages/ExpertDashboard";
import UserProfile from "@/pages/UserProfile";
import ServicesPage from "@/pages/Services";
import { I18nProvider } from "@/providers/I18nProvider";
import { UserRoleProvider } from "@/providers/UserRoleProvider";

export default function App() {
  return (
    <I18nProvider>
        <UserRoleProvider>
          <Router>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth/callback" element={<AuthCallbackPage />} />
              <Route path="/expert/dashboard" element={<ExpertDashboard />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/services" element={<ServicesPage />} />
            </Routes>
          </Router>
        </UserRoleProvider>
    </I18nProvider>
  );
}
