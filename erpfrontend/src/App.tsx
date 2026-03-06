import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import EmployeesPage from "./pages/EmployeesPage";
import DepartmentsPage from "./pages/DepartmentsPage";
import KeycloakPage from "./pages/KeycloakPage";
import EmployeeLayout from "./components/EmployeeLayout";
import EmployeeDashboardPage from "./pages/employee/EmployeeDashboardPage";
import MyProfilePage from "./pages/employee/MyProfilePage";
import MyLeavesPage from "./pages/employee/MyLeavesPage";
import MyAbsencesPage from "./pages/employee/MyAbsencesPage";
import MyPayslipsPage from "./pages/employee/MyPayslipsPage";
import { ROLES } from "./types/auth";
import HomeRedirect from "./components/HomeRedirect";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.RH, ROLES.EMPLOYE]} />}>
            <Route path="/" element={<HomeRedirect />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.RH]} />}>
            <Route path="/employees"    element={<EmployeesPage />} />
            <Route path="/departments"  element={<DepartmentsPage />} />
            <Route path="/leaves"       element={<DashboardPage />} />
            <Route path="/absences"     element={<DashboardPage />} />
            <Route path="/payroll"      element={<DashboardPage />} />
            <Route path="/settings"     element={<DashboardPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
            <Route path="/admin/keycloak" element={<KeycloakPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={[ROLES.EMPLOYE, ROLES.RH, ROLES.ADMIN]} />}>
            <Route path="/my-space" element={<EmployeeLayout activePage="dashboard" />}>
              <Route index element={<EmployeeDashboardPage />} />
            </Route>
            <Route path="/my-space/profile" element={<EmployeeLayout activePage="profile" />}>
              <Route index element={<MyProfilePage />} />
            </Route>
            <Route path="/my-space/leaves" element={<EmployeeLayout activePage="leaves" />}>
              <Route index element={<MyLeavesPage />} />
            </Route>
            <Route path="/my-space/absences" element={<EmployeeLayout activePage="absences" />}>
              <Route index element={<MyAbsencesPage />} />
            </Route>
            <Route path="/my-space/payslips" element={<EmployeeLayout activePage="payslips" />}>
              <Route index element={<MyPayslipsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

