import { Table, TableHead, Th, TableRow, Td } from "../ui/Table.jsx";

function fieldError(errors, path) {
  return errors.find((e) => e.path === path)?.message;
}

const EDITABLE_FIELD_RE = /\.tasks\[\d+\]\.(assigneeId|deadline|estimatedHours)$/;

export function PlanReviewTable({ plan, team, errors, onChangeTask }) {
  const agents = team.filter((u) => u.role === "AGENT");
  const byCode = new Map(team.map((u) => [u.code, u]));
  const generalErrors = errors.filter((e) => !EDITABLE_FIELD_RE.test(e.path));

  return (
    <div className="space-y-5">
      {generalErrors.length > 0 && (
        <div className="rounded-field border border-danger/20 bg-danger/[0.06] p-4">
          <div className="text-sm font-medium text-danger">Fix these before saving</div>
          <ul className="mt-2 space-y-1">
            {generalErrors.map((e, i) => (
              <li key={i} className="font-mono text-xs text-text-2 font-tabular">
                <span className="text-danger">{e.path}</span> — {e.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {plan.projects.map((project, pIndex) => {
        const manager = byCode.get(project.managerId);
        const totalHours = project.tasks.reduce((sum, t) => sum + (Number(t.estimatedHours) || 0), 0);

        return (
          <div key={pIndex} className="rounded-card border border-border bg-surface p-5">
            <div className="flex items-baseline justify-between">
              <h3 className="text-sm font-semibold text-text">{project.name}</h3>
              <span className="text-xs text-text-3">{project.clientName}</span>
            </div>
            <p className="mt-1 text-xs text-text-2">
              Manager: {manager?.name ?? project.managerId} · Deadline: {project.deadline} · {project.tasks.length}{" "}
              tasks · {totalHours}h
            </p>
            {project.description && <p className="mt-1 text-xs text-text-3">{project.description}</p>}

            <Table className="mt-3">
              <TableHead>
                <Th>Task</Th>
                <Th>Assignee</Th>
                <Th>Deadline</Th>
                <Th align="right">Hours</Th>
              </TableHead>
              <tbody>
                {project.tasks.map((task, tIndex) => {
                  const base = `projects[${pIndex}].tasks[${tIndex}]`;
                  const assigneeErr = fieldError(errors, `${base}.assigneeId`);
                  const deadlineErr = fieldError(errors, `${base}.deadline`);
                  const hoursErr = fieldError(errors, `${base}.estimatedHours`);

                  return (
                    <TableRow key={tIndex}>
                      <Td>
                        <div className="font-medium text-text">{task.title}</div>
                        {task.description && (
                          <div className="mt-0.5 line-clamp-1 text-xs text-text-3">{task.description}</div>
                        )}
                      </Td>
                      <Td>
                        <select
                          value={task.assigneeId}
                          onChange={(e) => onChangeTask(pIndex, tIndex, "assigneeId", e.target.value)}
                          className={`h-8 rounded-field border bg-surface-2 px-2 text-xs text-text outline-none ${
                            assigneeErr ? "border-danger/50" : "border-border"
                          }`}
                        >
                          {!byCode.get(task.assigneeId) && <option value={task.assigneeId}>{task.assigneeId}</option>}
                          {agents.map((a) => (
                            <option key={a.code} value={a.code}>
                              {a.name} ({a.code})
                            </option>
                          ))}
                        </select>
                        {assigneeErr && <div className="mt-1 text-[11px] text-danger">{assigneeErr}</div>}
                      </Td>
                      <Td>
                        <input
                          type="date"
                          value={task.deadline}
                          onChange={(e) => onChangeTask(pIndex, tIndex, "deadline", e.target.value)}
                          className={`h-8 rounded-field border bg-surface-2 px-2 text-xs text-text outline-none ${
                            deadlineErr ? "border-danger/50" : "border-border"
                          }`}
                        />
                        {deadlineErr && <div className="mt-1 text-[11px] text-danger">{deadlineErr}</div>}
                      </Td>
                      <Td align="right">
                        <input
                          type="number"
                          min="0.1"
                          step="0.5"
                          value={task.estimatedHours}
                          onChange={(e) => onChangeTask(pIndex, tIndex, "estimatedHours", Number(e.target.value))}
                          className={`h-8 w-20 rounded-field border bg-surface-2 px-2 text-right text-xs text-text font-tabular outline-none ${
                            hoursErr ? "border-danger/50" : "border-border"
                          }`}
                        />
                        {hoursErr && <div className="mt-1 text-[11px] text-danger">{hoursErr}</div>}
                      </Td>
                    </TableRow>
                  );
                })}
              </tbody>
            </Table>
          </div>
        );
      })}
    </div>
  );
}
