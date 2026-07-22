import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PageTransition from "./components/PageTransition";
import LoginPage from "./pages/login/login-page";
import DashboardPage from "./pages/dashboard/dashboard-page";
import EmployeesPage from "./pages/employees/employees-page";
import DepartmentsPage from "./pages/departments/departments-page";
import LeavesPage from "./pages/leaves/leaves-page";
import { ROLES } from "./types/auth";
import HomeRedirect from "./components/HomeRedirect";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
          <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/employees"    element={<EmployeesPage />} />
            <Route path="/departments"  element={<DepartmentsPage />} />
            <Route path="/leaves"       element={<LeavesPage />} />
            <Route path="/absences"     element={<DashboardPage />} />
            <Route path="/payroll"      element={<DashboardPage />} />
            <Route path="/settings"     element={<DashboardPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

