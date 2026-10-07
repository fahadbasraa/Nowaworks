import { useEffect, useMemo, useState } from "react";
import { ListChecks } from "lucide-react";
import { getMyTasks } from "../api/tasks.js";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { Card } from "../components/ui/Card.jsx";
import { Pill } from "../components/ui/Pill.jsx";
import { Skeleton } from "../components/ui/Skeleton.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { formatDate, daysLeft, formatHours } from "../utils/format.js";

export function MyTasksPage() {
  const [tasks, setTasks] = useState(null);

  useEffect(() => {
    getMyTasks().then(setTasks);
  }, []);

  const groups = useMemo(() => {
    if (!tasks) return [];
    const sorted = [...tasks].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    const byProject = new Map();
    for (const task of sorted) {
      const key = task.project.id;
      if (!byProject.has(key)) byProject.set(key, { project: task.project, tasks: [] });
      byProject.get(key).tasks.push(task);
    }
    return [...byProject.values()];
  }, [tasks]);

  const totalHours = tasks?.reduce((sum, t) => sum + t.estimatedHours, 0) ?? 0;

  return (
    <div>
      <PageHeader
        breadcrumb="NovaWorks"
        title="My Tasks"
        subtitle={
          tasks && (
            <span className="font-mono text-sm font-tabular">
              {tasks.length} {tasks.length === 1 ? "task" : "tasks"} · {totalHours}h
            </span>
          )
        }
      />

      {tasks === null ? (
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState icon={ListChecks} title="No tasks assigned" description="You have no assigned tasks yet." />
      ) : (
        <div className="space-y-8">
          {groups.map(({ project, tasks: projectTasks }) => (
            <div key={project.id}>
              <div className="mb-3 flex items-baseline gap-2">
                <h2 className="text-sm font-semibold text-text">{project.name}</h2>
                <span className="text-xs text-text-3">
                  managed by {project.manager?.name} · due {formatDate(project.deadline)}
                </span>
              </div>
              <div className="space-y-2">
                {projectTasks.map((task) => {
                  const left = daysLeft(task.deadline);
                  const urgent = left <= 5;
                  return (
                    <Card key={task.id} className="flex items-center justify-between gap-4 px-4 py-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-text">{task.title}</div>
                        {task.description && (
                          <div className="mt-0.5 line-clamp-1 text-xs text-text-3">{task.description}</div>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className={`font-mono text-xs font-tabular ${urgent ? "text-warning" : "text-text-3"}`}>
                          {formatDate(task.deadline)}
                        </span>
                        <Pill variant="neutral">{formatHours(task.estimatedHours)}</Pill>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
