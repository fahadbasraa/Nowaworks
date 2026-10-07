import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import "../models/User.js"; // registers the User schema so Project/Task .populate() can resolve it
import { Project } from "../models/Project.js";
import { Task } from "../models/Task.js";
import { formatDateOnly } from "../utils/dates.js";

const PROJECT_KEY = [
  { name: "UrbanCart Website", manager: "Ayesha Khan", deadline: "2026-10-20" },
  { name: "QuickServe Mobile App", manager: "Bilal Ahmed", deadline: "2026-10-24" },
  { name: "HelpDeskPro AI Assistant", manager: "Hina Malik", deadline: "2026-10-22" },
];

const TASK_KEY = [
  { project: "UrbanCart Website", title: "Product catalog UI", owner: "Ali Raza", deadline: "2026-10-12", hours: 12 },
  { project: "UrbanCart Website", title: "Demo cart UI", owner: "Ali Raza", deadline: "2026-10-15", hours: 8 },
  { project: "UrbanCart Website", title: "Product and cart APIs", owner: "Hamza Shah", deadline: "2026-10-14", hours: 14 },
  { project: "UrbanCart Website", title: "Website integration and testing", owner: "Ali Raza", deadline: "2026-10-19", hours: 6 },
  { project: "QuickServe Mobile App", title: "Login and profile screens", owner: "Sara Noor", deadline: "2026-10-12", hours: 8 },
  { project: "QuickServe Mobile App", title: "Service booking screens", owner: "Sara Noor", deadline: "2026-10-17", hours: 12 },
  { project: "QuickServe Mobile App", title: "Booking and account APIs", owner: "Hamza Shah", deadline: "2026-10-16", hours: 16 },
  { project: "QuickServe Mobile App", title: "Mobile integration and testing", owner: "Usman Tariq", deadline: "2026-10-22", hours: 10 },
  { project: "HelpDeskPro AI Assistant", title: "FAQ document processing", owner: "Maryam Asif", deadline: "2026-10-13", hours: 10 },
  { project: "HelpDeskPro AI Assistant", title: "Assistant answer generation", owner: "Zain Abbas", deadline: "2026-10-17", hours: 14 },
  { project: "HelpDeskPro AI Assistant", title: "Human escalation flow", owner: "Zain Abbas", deadline: "2026-10-18", hours: 6 },
  { project: "HelpDeskPro AI Assistant", title: "Assistant evaluation and testing", owner: "Maryam Asif", deadline: "2026-10-21", hours: 8 },
];

let failed = false;
function report(label, cond) {
  console.log(`${cond ? "PASS" : "FAIL"}: ${label}`);
  if (!cond) failed = true;
}

async function run() {
  await connectDB();

  report("Exactly 3 projects exist", (await Project.countDocuments({})) === 3);

  for (const expected of PROJECT_KEY) {
    const project = await Project.findOne({ name: expected.name }).populate("manager", "name");
    if (!project) {
      report(`Project "${expected.name}" exists`, false);
      continue;
    }
    report(`Project "${expected.name}" manager is ${expected.manager}`, project.manager?.name === expected.manager);
    report(
      `Project "${expected.name}" deadline is ${expected.deadline}`,
      formatDateOnly(project.deadline) === expected.deadline
    );
  }

  report("Exactly 12 tasks exist", (await Task.countDocuments({})) === 12);

  for (const expected of TASK_KEY) {
    const project = await Project.findOne({ name: expected.project });
    if (!project) {
      report(`${expected.project} / ${expected.title}`, false);
      continue;
    }
    const task = await Task.findOne({ project: project._id, title: expected.title }).populate("assignee", "name");
    if (!task) {
      report(`${expected.project} / ${expected.title} exists`, false);
      continue;
    }
    const ok =
      task.assignee?.name === expected.owner &&
      formatDateOnly(task.deadline) === expected.deadline &&
      task.estimatedHours === expected.hours;
    report(
      `${expected.project} / ${expected.title} -> ${expected.owner}, ${expected.deadline}, ${expected.hours}h`,
      ok
    );
  }

  console.log(failed ? "\nSOME CHECKS FAILED" : "\nALL CHECKS PASSED");
  await mongoose.disconnect();
  process.exit(failed ? 1 : 0);
}

run().catch((err) => {
  console.error("verify failed:", err);
  process.exit(1);
});
