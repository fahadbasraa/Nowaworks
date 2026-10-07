import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar.jsx";

export function Layout() {
  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar />
      <main className="relative flex-1 overflow-y-auto overflow-x-hidden">
        <div className="spotlight" />
        <div className="relative mx-auto max-w-content px-6 py-10 lg:px-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
