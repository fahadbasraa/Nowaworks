import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Button } from "../components/ui/Button.jsx";

export function AccessDeniedPage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-bg text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-field border border-border bg-surface-2">
        <ShieldAlert size={20} className="text-text-3" />
      </div>
      <div>
        <h1 className="font-serif italic text-2xl text-text">Access denied</h1>
        <p className="mt-1 text-sm text-text-2">You don't have permission to view this page.</p>
      </div>
      <Link to="/">
        <Button variant="secondary">Go home</Button>
      </Link>
    </div>
  );
}
