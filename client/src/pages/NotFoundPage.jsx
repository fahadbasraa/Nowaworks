import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { Button } from "../components/ui/Button.jsx";

export function NotFoundPage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-bg text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-field border border-border bg-surface-2">
        <Compass size={20} className="text-text-3" />
      </div>
      <div>
        <h1 className="font-serif italic text-2xl text-text">Page not found</h1>
        <p className="mt-1 text-sm text-text-2">The page you're looking for doesn't exist.</p>
      </div>
      <Link to="/">
        <Button variant="secondary">Go home</Button>
      </Link>
    </div>
  );
}
