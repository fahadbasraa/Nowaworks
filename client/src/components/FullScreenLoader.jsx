import { Loader2 } from "lucide-react";

export function FullScreenLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-bg">
      <Loader2 size={20} className="animate-spin text-text-3" />
    </div>
  );
}
