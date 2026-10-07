import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { User } from "../models/User.js";
import { Project } from "../models/Project.js";
import { Task } from "../models/Task.js";
import { getProjects, getProjectById, getMyTasks } from "../services/access.service.js";

let failed = false;
function check(label, cond) {
  console.log(`${cond ? "PASS" : "FAIL"}: ${label}`);
  if (!cond) failed = true;
}

async function run() {
  await connectDB();

  const admin = await User.findOne({ role: "ADMIN" });
  const managers = await User.find({ role: "MANAGER" });
  const agents = await User.find({ role: "AGENT" });

  if (!admin || managers.length === 0 || agents.length === 0) {
    console.error("Seed the database first: npm run seed");
    process.exit(1);
  }

  const adminProjects = await getProjects(admin);
  const totalProjects = await Project.countDocuments({});
  check(`ADMIN sees all ${totalProjects} project(s)`, adminProjects.length === totalProjects);

  for (const manager of managers) {
    const projects = await getProjects(manager);
    const expectedCount = await Project.countDocuments({ manager: manager._id });
    const allOwnedByManager = projects.every((p) => String(p.manager.id) === String(manager._id));
    check(`MANAGER ${manager.code} sees exactly their ${expectedCount} project(s)`, projects.length === expectedCount);
    check(`MANAGER ${manager.code} project list is all their own`, allOwnedByManager);
  }

  for (const agent of agents) {
    const myTasks = await getMyTasks(agent);
    const expectedTaskCount = await Task.countDocuments({ assignee: agent._id });
    check(`AGENT ${agent.code} sees exactly their ${expectedTaskCount} task(s)`, myTasks.length === expectedTaskCount);

    const myProjects = await getProjects(agent);
    const expectedProjectIds = (await Task.distinct("project", { assignee: agent._id })).map(String).sort();
    const myProjectIds = myProjects.map((p) => String(p.id)).sort();
    check(
      `AGENT ${agent.code} sees exactly the ${expectedProjectIds.length} project(s) containing their tasks`,
      JSON.stringify(myProjectIds) === JSON.stringify(expectedProjectIds)
    );

    for (const project of myProjects) {
      const detail = await getProjectById(agent, project.id);
      const expectedTasksInProject = await Task.countDocuments({ project: project.id, assignee: agent._id });
      check(
        `AGENT ${agent.code} project "${project.name}" detail shows exactly their ${expectedTasksInProject} task(s)`,
        detail.tasks.length === expectedTasksInProject
      );
    }
  }

  const allProjects = await Project.find({}).lean();

  for (const agent of agents) {
    const inScopeIds = new Set((await Task.distinct("project", { assignee: agent._id })).map(String));
    const outOfScope = allProjects.find((p) => !inScopeIds.has(String(p._id)));
    if (outOfScope) {
      const result = await getProjectById(agent, outOfScope._id);
      check(`AGENT ${agent.code} cannot fetch out-of-scope project "${outOfScope.name}"`, result === null);
    }
  }

  for (const manager of managers) {
    const otherProject = await Project.findOne({ manager: { $ne: manager._id } }).lean();
    if (otherProject) {
      const result = await getProjectById(manager, otherProject._id);
      check(`MANAGER ${manager.code} cannot fetch another manager's project "${otherProject.name}"`, result === null);
    }
  }

  console.log(failed ? "\nSOME CHECKS FAILED" : "\nALL CHECKS PASSED");
  await mongoose.disconnect();
  process.exit(failed ? 1 : 0);
}

run().catch((err) => {
  console.error("testAccess failed:", err);
  process.exit(1);
});
