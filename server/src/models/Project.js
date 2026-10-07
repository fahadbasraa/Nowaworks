import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    clientName: { type: String, required: true },
    description: { type: String },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    deadline: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

projectSchema.index({ name: 1, clientName: 1 }, { unique: true });

export const Project = mongoose.model("Project", projectSchema);
