import { isValidDateOnly, parseDateOnly } from "../../utils/dates.js";

export function validatePlan(plan, directory) {
  const errors = [];
  const byCode = new Map(directory.map((u) => [u.code, u]));
  const projectNames = new Set();

  if (!Array.isArray(plan.projects) || plan.projects.length === 0) {
    errors.push({ path: "projects", message: "At least one project is required" });
  }

  (plan.projects || []).forEach((project, pIndex) => {
    const pPath = `projects[${pIndex}]`;

    if (!project.name?.trim()) {
      errors.push({ path: `${pPath}.name`, message: "Project name is required" });
    } else {
      const key = `${project.name.trim().toLowerCase()}`;
      if (projectNames.has(key)) {
        errors.push({ path: `${pPath}.name`, message: `Duplicate project name "${project.name}" in plan` });
      }
      projectNames.add(key);
    }

    if (!project.clientName?.trim()) {
      errors.push({ path: `${pPath}.clientName`, message: "Client name is required" });
    }

    const manager = byCode.get(project.managerId);
    if (!manager) {
      errors.push({ path: `${pPath}.managerId`, message: `Manager "${project.managerId}" not found in directory` });
    } else if (manager.role !== "MANAGER") {
      errors.push({ path: `${pPath}.managerId`, message: `"${project.managerId}" is not a MANAGER` });
    }

    let projectDeadline = null;
    if (!isValidDateOnly(project.deadline)) {
      errors.push({ path: `${pPath}.deadline`, message: `Invalid date "${project.deadline}"` });
    } else {
      projectDeadline = parseDateOnly(project.deadline);
    }

    if (!Array.isArray(project.tasks) || project.tasks.length === 0) {
      errors.push({ path: `${pPath}.tasks`, message: "Each project needs at least one task" });
    }

    const taskTitles = new Set();
    (project.tasks || []).forEach((task, tIndex) => {
      const tPath = `${pPath}.tasks[${tIndex}]`;

      if (!task.title?.trim()) {
        errors.push({ path: `${tPath}.title`, message: "Task title is required" });
      } else {
        const key = task.title.trim().toLowerCase();
        if (taskTitles.has(key)) {
          errors.push({
            path: `${tPath}.title`,
            message: `Duplicate task title "${task.title}" in project "${project.name}"`,
          });
        }
        taskTitles.add(key);
      }

      const assignee = byCode.get(task.assigneeId);
      if (!assignee) {
        errors.push({ path: `${tPath}.assigneeId`, message: `Assignee "${task.assigneeId}" not found in directory` });
      } else if (assignee.role !== "AGENT") {
        errors.push({ path: `${tPath}.assigneeId`, message: `"${task.assigneeId}" is not an AGENT` });
      }

      let taskDeadline = null;
      if (!isValidDateOnly(task.deadline)) {
        errors.push({ path: `${tPath}.deadline`, message: `Invalid date "${task.deadline}"` });
      } else {
        taskDeadline = parseDateOnly(task.deadline);
      }

      if (typeof task.estimatedHours !== "number" || task.estimatedHours <= 0 || task.estimatedHours > 500) {
        errors.push({
          path: `${tPath}.estimatedHours`,
          message: "estimatedHours must be greater than 0 and at most 500",
        });
      }

      if (projectDeadline && taskDeadline && taskDeadline > projectDeadline) {
        errors.push({ path: `${tPath}.deadline`, message: "Task deadline must not be after the project deadline" });
      }
    });
  });

  (plan.unresolved || []).forEach((item, index) => {
    errors.push({
      path: `unresolved[${index}]`,
      message: `Unresolved: ${item.project}${item.task ? ` / ${item.task}` : ""} — ${item.field}: ${item.reason}`,
    });
  });

  return errors;
}
