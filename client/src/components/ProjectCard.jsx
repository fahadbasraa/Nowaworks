import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";
import { Card } from "./ui/Card.jsx";
import { Avatar } from "./ui/Avatar.jsx";
import { Pill } from "./ui/Pill.jsx";
import { formatDate, daysLeft } from "../utils/format.js";

export function ProjectCard({ project }) {
  const left = daysLeft(project.deadline);
  const urgent = left <= 7;

  return (
    <Link to={`/projects/${project.id}`} className="block">
      <Card hover className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-base font-semibold text-text">{project.name}</div>
            <div className="mt-0.5 truncate text-sm text-text-2">{project.clientName}</div>
          </div>
          <Pill variant={urgent ? "warning" : "neutral"} className="shrink-0">
            {left >= 0 ? `${left}d left` : "overdue"}
          </Pill>
        </div>

        <div className="my-4 h-px bg-border" />

        <div className="flex items-center justify-between gap-3 text-sm">
          <div className="flex min-w-0 items-center gap-2">
            <Avatar name={project.manager?.name} size="sm" />
            <span className="truncate text-text-2">{project.manager?.name}</span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 font-mono text-xs text-text-3 font-tabular">
            <Calendar size={13} />
            {formatDate(project.deadline)}
          </div>
        </div>

        <div className="mt-3 font-mono text-xs text-text-3 font-tabular">
          {project.taskCount} {project.taskCount === 1 ? "task" : "tasks"} · {project.totalHours}h
        </div>
      </Card>
    </Link>
  );
}
