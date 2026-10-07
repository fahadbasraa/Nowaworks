import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Calendar, FolderX } from "lucide-react";
import { getProject } from "../api/projects.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Skeleton } from "../components/ui/Skeleton.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { Avatar } from "../components/ui/Avatar.jsx";
import { RolePill } from "../components/ui/Pill.jsx";
import { Table, TableHead, Th, TableRow, Td } from "../components/ui/Table.jsx";
import { formatDate, daysLeft, formatHours } from "../utils/format.js";

export function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(undefined);

  useEffect(() => {
    setProject(undefined);
    getProject(id)
      .then(setProject)
      .catch(() => setProject(null));
  }, [id]);

  if (project === undefined) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-80" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (project === null) {
    return (
      <EmptyState
        icon={FolderX}
        title="Project not found"
        description="It may not exist, or you don't have access to it."
      />
    );
  }

  const left = daysLeft(project.deadline);
  const totalHours = project.tasks.reduce((sum, t) => sum + t.estimatedHours, 0);

  return (
    <div>
      <div className="mb-1 text-xs text-text-3">
        <Link to="/projects" className="hover:text-text-2">
          Projects
        </Link>{" "}
        / {project.name}
      </div>
      <h1 className="font-serif italic text-3xl text-text">{project.name}</h1>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-text-2">
        <span>{project.clientName}</span>
        <span className="text-border-strong">·</span>
        <span className="flex items-center gap-1.5">
          Managed by {project.manager?.name}
          <RolePill role="MANAGER" />
        </span>
        <span className="text-border-strong">·</span>
        <span className="flex items-center gap-1.5 font-mono text-xs font-tabular">
          <Calendar size={13} />
          {formatDate(project.deadline)}
          <span className={left <= 7 ? "text-warning" : "text-text-3"}>({left}d left)</span>
        </span>
      </div>
      {project.description && <p className="mt-3 max-w-2xl text-sm text-text-2">{project.description}</p>}

      <div className="my-8 grid grid-cols-3 gap-4">
        <div className="rounded-card border border-border bg-surface px-5 py-4 shadow-card">
          <div className="font-mono text-xl font-medium text-text font-tabular">{project.tasks.length}</div>
          <div className="mt-1 text-xs text-text-2">Tasks</div>
        </div>
        <div className="rounded-card border border-border bg-surface px-5 py-4 shadow-card">
          <div className="font-mono text-xl font-medium text-text font-tabular">{totalHours}h</div>
          <div className="mt-1 text-xs text-text-2">Total hours</div>
        </div>
        <div className="rounded-card border border-border bg-surface px-5 py-4 shadow-card">
          <div className="font-mono text-xl font-medium text-text font-tabular">{formatDate(project.deadline)}</div>
          <div className="mt-1 text-xs text-text-2">Deadline</div>
        </div>
      </div>

      {user?.role === "AGENT" && (
        <p className="mb-3 text-xs text-text-3">Showing only tasks assigned to you.</p>
      )}

      {project.tasks.length === 0 ? (
        <EmptyState title="No tasks" description="This project has no tasks yet." />
      ) : (
        <Table>
          <TableHead>
            <Th>Task</Th>
            <Th>Assignee</Th>
            <Th>Deadline</Th>
            <Th align="right">Hours</Th>
          </TableHead>
          <tbody>
            {project.tasks.map((task) => (
              <TableRow key={task.id}>
                <Td>
                  <div className="font-medium text-text">{task.title}</div>
                  {task.description && (
                    <div className="mt-0.5 line-clamp-1 text-xs text-text-3">{task.description}</div>
                  )}
                </Td>
                <Td>
                  <div className="flex items-center gap-2">
                    <Avatar name={task.assignee?.name} size="sm" />
                    <span className="text-text-2">{task.assignee?.name}</span>
                  </div>
                </Td>
                <Td>
                  <span className="font-mono text-xs text-text-3 font-tabular">{formatDate(task.deadline)}</span>
                </Td>
                <Td align="right">
                  <span className="font-mono text-text font-tabular">{formatHours(task.estimatedHours)}</span>
                </Td>
              </TableRow>
            ))}
            <tr>
              <Td className="font-medium text-text-2">Total</Td>
              <Td></Td>
              <Td></Td>
              <Td align="right">
                <span className="font-mono font-medium text-text font-tabular">{formatHours(totalHours)}</span>
              </Td>
            </tr>
          </tbody>
        </Table>
      )}
    </div>
  );
}
