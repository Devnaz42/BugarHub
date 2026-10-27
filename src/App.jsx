import { Navigate, Route, Routes } from "react-router-dom";
import { getStaffSession } from "./utils/staffSession";
import MembershipRequiredRoute from "./components/MembershipRequiredRoute";

// Public pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import OTPVerificationPage from "./pages/OTPVerificationPage";

// Member pages
import MemberDashboard from "./pages/MemberDashboard";
import BookPTPage from "./pages/BookPTPage";
import JadwalKelasPage from "./pages/JadwalKelasPage";
import LatihanPage from "./pages/LatihanPage";
import JadwalSayaPage from "./pages/JadwalSayaPage";
import MemberProfilePage from "./pages/MemberProfilePage";
import MemberSettingsPage from "./pages/MemberSettingsPage";
import { MembershipPage, MembershipPaymentPage, MembershipQrisPage, MembershipVirtualAccountPage, MembershipSuccessPage } from "./pages/MembershipPages";

// Staff pages
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminMembersPage from "./pages/admin/AdminMembersPage";
import AdminTrainersPage from "./pages/admin/AdminTrainersPage";
import AdminClassSchedulePage from "./pages/admin/AdminClassSchedulePage";
import AdminReportsPage from "./pages/admin/AdminReportsPage";
import AdminProfilePage from "./pages/admin/AdminProfilePage";
import TrainerDashboardPage from "./pages/TrainerDashboardPage";
import TrainerSchedulePage from "./pages/trainer/TrainerSchedulePage";
import TrainerBookingsPage from "./pages/trainer/TrainerBookingsPage";
import TrainerClassesPage from "./pages/trainer/TrainerClassesPage";
import TrainerStatisticsPage from "./pages/trainer/TrainerStatisticsPage";
import TrainerProfilePage from "./pages/TrainerProfilePage";

function RequireStaffRole({ role, children }) {
  const session = getStaffSession();

  if (!session) return <Navigate to="/admin/login" replace />;
  if (session.role !== role) {
    return <Navigate to={session.role === "trainer" ? "/trainer/dashboard" : "/admin/dashboard"} replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-otp" element={<OTPVerificationPage />} />

      {/* Member pages - existing demo behavior retained for this stage */}
      <Route path="/dashboard" element={<MemberDashboard />} />
      <Route path="/book-pt" element={<MembershipRequiredRoute><BookPTPage /></MembershipRequiredRoute>} />
      <Route path="/jadwal" element={<MembershipRequiredRoute><JadwalKelasPage /></MembershipRequiredRoute>} />
      <Route path="/jadwal-saya" element={<JadwalSayaPage />} />
      {/* Legacy URL redirects to dashboard because Cek Progres has been removed. */}
      <Route path="/progres" element={<Navigate to="/dashboard" replace />} />
      <Route path="/latihan" element={<MembershipRequiredRoute><LatihanPage /></MembershipRequiredRoute>} />
      <Route path="/profile" element={<MemberProfilePage />} />
      <Route path="/settings" element={<MemberSettingsPage />} />
      <Route path="/membership" element={<MembershipPage />} />
      <Route path="/membership/payment" element={<MembershipPaymentPage />} />
      <Route path="/membership/payment/qris" element={<MembershipQrisPage />} />
      <Route path="/membership/payment/va" element={<MembershipVirtualAccountPage />} />
      <Route path="/membership/success" element={<MembershipSuccessPage />} />

      {/* One shared staff login for Admin and PT/Coach */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      {/* Backward-compatible path: old PT/Coach login URLs now use the shared staff form. */}
      <Route path="/trainer/login" element={<Navigate to="/admin/login" replace />} />

      {/* Admin-only workspace */}
      <Route path="/admin/dashboard" element={<RequireStaffRole role="admin"><AdminDashboardPage /></RequireStaffRole>} />
      <Route path="/admin/jadwal-kelas" element={<RequireStaffRole role="admin"><AdminClassSchedulePage /></RequireStaffRole>} />
      <Route path="/admin/members" element={<RequireStaffRole role="admin"><AdminMembersPage /></RequireStaffRole>} />
      <Route path="/admin/trainers" element={<RequireStaffRole role="admin"><AdminTrainersPage /></RequireStaffRole>} />
      <Route path="/admin/reports" element={<RequireStaffRole role="admin"><AdminReportsPage /></RequireStaffRole>} />
      <Route path="/admin/profile" element={<RequireStaffRole role="admin"><AdminProfilePage /></RequireStaffRole>} />

      {/* PT/Coach-only workspace */}
      <Route path="/trainer/dashboard" element={<RequireStaffRole role="trainer"><TrainerDashboardPage /></RequireStaffRole>} />
      <Route path="/trainer/schedule" element={<RequireStaffRole role="trainer"><TrainerSchedulePage /></RequireStaffRole>} />
      <Route path="/trainer/bookings" element={<RequireStaffRole role="trainer"><TrainerBookingsPage /></RequireStaffRole>} />
      <Route path="/trainer/classes" element={<RequireStaffRole role="trainer"><TrainerClassesPage /></RequireStaffRole>} />
      <Route path="/trainer/statistics" element={<RequireStaffRole role="trainer"><TrainerStatisticsPage /></RequireStaffRole>} />
      <Route path="/trainer/profile" element={<RequireStaffRole role="trainer"><TrainerProfilePage /></RequireStaffRole>} />

      {/* Unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
