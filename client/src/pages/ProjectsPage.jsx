import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, FolderKanban } from "lucide-react";
import { getProjects } from "../api/projects.js";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { Skeleton } from "../components/ui/Skeleton.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { ProjectCard } from "../components/ProjectCard.jsx";

export function ProjectsPage() {
  const [projects, setProjects] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    getProjects().then(setProjects);
  }, []);

  const filtered = useMemo(() => {
    if (!projects) return [];
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter(
      (p) => p.name.toLowerCase().includes(q) || p.clientName.toLowerCase().includes(q)
    );
  }, [projects, query]);

  return (
    <div>
      <PageHeader breadcrumb="NovaWorks" title="Projects" subtitle="All projects you have access to." />

      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="relative w-full max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-3" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or client…"
            className="h-9 w-full rounded-field border border-border bg-surface-2 pl-9 pr-3 text-sm text-text placeholder:text-text-3 outline-none transition-colors duration-150 hover:border-border-strong focus:border-border-strong"
          />
        </div>
        {projects !== null && (
          <span className="shrink-0 font-mono text-xs text-text-3 font-tabular">
            {filtered.length} {filtered.length === 1 ? "result" : "results"}
          </span>
        )}
      </div>

      {projects === null ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description={query ? "Try a different search." : "No projects have been created yet."}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.04 }}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
