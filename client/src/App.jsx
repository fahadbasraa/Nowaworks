import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import { Layout } from "./components/Layout.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { RoleRoute } from "./components/RoleRoute.jsx";
import { FullScreenLoader } from "./components/FullScreenLoader.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { AdminHomePage } from "./pages/AdminHomePage.jsx";
import { ProjectsPage } from "./pages/ProjectsPage.jsx";
import { ProjectDetailPage } from "./pages/ProjectDetailPage.jsx";
import { MyTasksPage } from "./pages/MyTasksPage.jsx";
import { TeamPage } from "./pages/TeamPage.jsx";
import { AccessDeniedPage } from "./pages/AccessDeniedPage.jsx";
import { NotFoundPage } from "./pages/NotFoundPage.jsx";

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "ADMIN") return <Navigate to="/admin" replace />;
  if (user.role === "AGENT") return <Navigate to="/my-tasks" replace />;
  return <Navigate to="/projects" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/access-denied" element={<AccessDeniedPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/team" element={<TeamPage />} />

          <Route element={<RoleRoute roles={["ADMIN"]} />}>
            <Route path="/admin" element={<AdminHomePage />} />
          </Route>

          <Route element={<RoleRoute roles={["AGENT"]} />}>
            <Route path="/my-tasks" element={<MyTasksPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
