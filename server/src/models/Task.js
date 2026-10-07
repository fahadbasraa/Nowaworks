import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    deadline: { type: Date, required: true },
    estimatedHours: { type: Number, required: true, min: 0.1 },
  },
  { timestamps: true }
);

taskSchema.index({ assignee: 1, project: 1 });

export const Task = mongoose.model("Task", taskSchema);
