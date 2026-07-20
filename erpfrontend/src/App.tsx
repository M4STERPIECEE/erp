import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import EmployeesPage from "./pages/EmployeesPage";
import DepartmentsPage from "./pages/DepartmentsPage";
import LeavesPage from "./pages/LeavesPage";
import { ROLES } from "./types/auth";
import HomeRedirect from "./components/HomeRedirect";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
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

