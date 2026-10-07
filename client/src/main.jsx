import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider, useTheme, getInitialTheme } from "./context/ThemeContext.jsx";

// Applied synchronously, before React renders anything, to avoid a flash of the wrong theme.
// Lives in the bundled script (not an inline <script> in index.html) so it isn't blocked by
// helmet's production CSP (script-src 'self').
document.documentElement.setAttribute("data-theme", getInitialTheme());

function ThemedToaster() {
  const { theme } = useTheme();
  return (
    <Toaster
      theme={theme}
      position="top-right"
      toastOptions={{
        style:
          theme === "light"
            ? { background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.08)", color: "#18181B" }
            : { background: "#16161A", border: "1px solid rgba(255,255,255,0.07)", color: "#EDEDEF" },
      }}
    />
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
          <ThemedToaster />
          <div className="noise-overlay" />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
