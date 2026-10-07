import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext.jsx";
import { Input } from "../components/ui/Input.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Avatar } from "../components/ui/Avatar.jsx";
import { RolePill } from "../components/ui/Pill.jsx";
import { FullScreenLoader } from "../components/FullScreenLoader.jsx";

const DEMO_ACCOUNTS = [
  { name: "Admin", email: "admin@novaworks.example", role: "ADMIN" },
  { name: "Ayesha Khan", email: "ayesha@novaworks.example", role: "MANAGER" },
  { name: "Bilal Ahmed", email: "bilal@novaworks.example", role: "MANAGER" },
  { name: "Hina Malik", email: "hina@novaworks.example", role: "MANAGER" },
  { name: "Ali Raza", email: "ali@novaworks.example", role: "AGENT" },
  { name: "Hamza Shah", email: "hamza@novaworks.example", role: "AGENT" },
  { name: "Sara Noor", email: "sara@novaworks.example", role: "AGENT" },
  { name: "Usman Tariq", email: "usman@novaworks.example", role: "AGENT" },
  { name: "Zain Abbas", email: "zain@novaworks.example", role: "AGENT" },
  { name: "Maryam Asif", email: "maryam@novaworks.example", role: "AGENT" },
];

const DEMO_PASSWORD = "Demo123!";

function TranscriptPreview() {
  return (
    <div className="mt-10 flex flex-col items-center">
      <div className="w-72 rounded-card border border-border bg-surface p-4 shadow-card">
        <div className="mb-3 text-[10px] uppercase tracking-wide text-text-3">Meeting transcript</div>
        <div className="space-y-2">
          <div className="h-2 w-full rounded bg-text-3/20" />
          <div className="h-2 w-5/6 rounded bg-text-3/20" />
          <div className="h-2 w-4/6 rounded bg-text-3/20" />
        </div>
      </div>

      <div className="relative h-12 w-px">
        <div className="absolute inset-0 border-l border-dashed border-border-strong" />
        <motion.div
          className="absolute left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-accent"
          animate={{ y: [0, 48] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="flex flex-col gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex w-64 items-center gap-2 rounded-field border border-border bg-surface-2 px-3 py-2.5"
          >
            <div className="h-2 w-2 shrink-0 rounded-full bg-accent/70" />
            <div className="h-2 flex-1 rounded bg-text-3/20" />
            <div className="h-2 w-8 rounded bg-text-3/20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function LoginPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <FullScreenLoader />;
  if (user) return <Navigate to="/" replace />;

  function fillDemoAccount(account) {
    setEmail(account.email);
    setPassword(DEMO_PASSWORD);
    setError("");
    toast(`Filled credentials for ${account.name}`);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error?.message || "Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-bg">
      <div className="relative hidden w-[55%] flex-col items-center justify-center overflow-hidden border-r border-border px-12 lg:flex">
        <div className="spotlight" />
        <div className="relative max-w-md text-center">
          <h1 className="font-serif italic text-4xl leading-tight text-text">
            From meeting to execution.
          </h1>
          <p className="mt-3 text-sm text-text-2">
            Paste a transcript. NovaWorks turns it into real projects and tasks.
          </p>
          <TranscriptPreview />
        </div>
      </div>

      <div className="flex w-full flex-col items-center justify-center px-6 lg:w-[45%]">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-[380px]"
        >
          <div className="mb-2 flex items-center gap-2 lg:hidden">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent text-xs font-semibold text-[#0B0B0F]">
              N
            </div>
            <span className="text-sm font-medium text-text">NovaWorks</span>
          </div>
          <h2 className="text-xl font-semibold text-text">Sign in</h2>
          <p className="mt-1 text-sm text-text-2">Use one of the demo accounts below.</p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="text-xs text-danger">{error}</p>}
            <Button type="submit" className="w-full" loading={submitting}>
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
          </form>

          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs text-text-3">Demo accounts</span>
              <span className="font-mono text-[11px] text-text-3">pw: Demo123!</span>
            </div>
            <div className="max-h-64 space-y-1 overflow-y-auto pr-1">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => fillDemoAccount(account)}
                  className="flex w-full items-center gap-2.5 rounded-field px-2 py-1.5 text-left transition-colors duration-150 hover:bg-hover"
                >
                  <Avatar name={account.name} size="sm" />
                  <span className="flex-1 truncate text-sm text-text-2">{account.name}</span>
                  <RolePill role={account.role} />
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
