import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import { User } from "../models/User.js";

const DEMO_PASSWORD = "Demo123!";

const DEMO_USERS = [
  { code: "ADMIN", name: "Admin", email: "admin@novaworks.example", role: "ADMIN", specialization: "", skills: ["Company overview", "transcript creation"] },
  { code: "PM01", name: "Ayesha Khan", email: "ayesha@novaworks.example", role: "MANAGER", specialization: "Web PM", skills: ["Web projects", "client coordination"] },
  { code: "PM02", name: "Bilal Ahmed", email: "bilal@novaworks.example", role: "MANAGER", specialization: "Mobile PM", skills: ["Mobile projects", "delivery planning"] },
  { code: "PM03", name: "Hina Malik", email: "hina@novaworks.example", role: "MANAGER", specialization: "AI PM", skills: ["AI projects", "requirement review"] },
  { code: "DEV01", name: "Ali Raza", email: "ali@novaworks.example", role: "AGENT", specialization: "Full-Stack", skills: ["React", "frontend integration"] },
  { code: "DEV02", name: "Hamza Shah", email: "hamza@novaworks.example", role: "AGENT", specialization: "Full-Stack", skills: ["Node.js", "databases", "APIs"] },
  { code: "DEV03", name: "Sara Noor", email: "sara@novaworks.example", role: "AGENT", specialization: "App Developer", skills: ["Flutter", "mobile UI"] },
  { code: "DEV04", name: "Usman Tariq", email: "usman@novaworks.example", role: "AGENT", specialization: "App Developer", skills: ["Flutter", "integration", "testing"] },
  { code: "DEV05", name: "Zain Abbas", email: "zain@novaworks.example", role: "AGENT", specialization: "AI Developer", skills: ["LLMs", "extraction", "prompts"] },
  { code: "DEV06", name: "Maryam Asif", email: "maryam@novaworks.example", role: "AGENT", specialization: "AI Developer", skills: ["Retrieval", "document processing"] },
];

async function seed() {
  await connectDB();
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  for (const user of DEMO_USERS) {
    await User.findOneAndUpdate(
      { email: user.email },
      { $set: { ...user, passwordHash } },
      { upsert: true }
    );
    console.log(`Seeded ${user.code} (${user.email})`);
  }

  console.log(`Seed complete: ${DEMO_USERS.length} users.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
