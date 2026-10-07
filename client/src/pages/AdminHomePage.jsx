import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Check, Loader2, Circle, FolderKanban } from "lucide-react";
import { getProjects } from "../api/projects.js";
import { createFromTranscript, loadSampleTranscript } from "../api/transcript.js";
import { useAuth } from "../context/AuthContext.jsx";
import { StatTile } from "../components/ui/StatTile.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Textarea } from "../components/ui/Textarea.jsx";
import { Skeleton } from "../components/ui/Skeleton.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { ProjectCard } from "../components/ProjectCard.jsx";

const STEPS = [
  "Reading transcript",
  "Matching team directory",
  "Applying final decisions",
  "Validating dates & hours",
  "Saving",
];

const MAX_LENGTH = 50_000;

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function StepList({ activeIndex, done }) {
  return (
    <div className="flex flex-col gap-2.5">
      {STEPS.map((label, i) => {
        const isDone = done || i < activeIndex;
        const isActive = !done && i === activeIndex;
        return (
          <div key={label} className="flex items-center gap-2.5 text-sm">
            {isDone ? (
              <Check size={15} className="text-success" />
            ) : isActive ? (
              <Loader2 size={15} className="animate-spin text-accent" />
            ) : (
              <Circle size={9} className="text-text-3" />
            )}
            <span className={isDone || isActive ? "text-text" : "text-text-3"}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function AdminHomePage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState("idle"); // idle | submitting | success | invalid | error
  const [stepIndex, setStepIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [issues, setIssues] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const intervalRef = useRef(null);
  const submittingRef = useRef(false);

  function loadProjects() {
    getProjects().then(setProjects);
  }

  useEffect(() => {
    loadProjects();
    return () => clearInterval(intervalRef.current);
  }, []);

  async function handleLoadSample() {
    const sample = await loadSampleTranscript();
    setTranscript(sample);
  }

  async function handleSubmit() {
    if (!transcript.trim() || submittingRef.current) return;
    submittingRef.current = true;

    setStatus("submitting");
    setStepIndex(0);
    setIssues([]);
    setErrorMessage("");

    intervalRef.current = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    }, 900);

    try {
      const data = await createFromTranscript(transcript);
      clearInterval(intervalRef.current);
      setStepIndex(STEPS.length);
      setTimeout(() => {
        setResult(data);
        setStatus("success");
        setTranscript("");
        loadProjects();
        submittingRef.current = false;
      }, 400);
    } catch (err) {
      clearInterval(intervalRef.current);
      const body = err.response?.data?.error;
      if (err.response?.status === 422) {
        setIssues(body?.details ?? []);
        setStatus("invalid");
      } else {
        setErrorMessage(body?.message || "Something went wrong talking to the AI service.");
        setStatus("error");
      }
      submittingRef.current = false;
    }
  }

  function reset() {
    submittingRef.current = false;
    setStatus("idle");
    setResult(null);
    setIssues([]);
    setErrorMessage("");
  }

  const totalTasks = projects?.reduce((sum, p) => sum + p.taskCount, 0) ?? 0;
  const totalHours = projects?.reduce((sum, p) => sum + p.totalHours, 0) ?? 0;
  const isProcessing = status === "submitting";

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <h1 className="font-serif italic text-3xl text-text">{greeting()}, {user?.name?.split(" ")[0]}</h1>
        <p className="mt-1 text-sm text-text-2">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
      </motion.div>

      <div className="mt-8 grid grid-cols-3 gap-4">
        <StatTile label="Projects" value={projects?.length ?? "—"} />
        <StatTile label="Tasks" value={totalTasks || "—"} />
        <StatTile label="Estimated hours" value={totalHours ? `${totalHours}h` : "—"} />
      </div>

      <div className={`relative mt-6 rounded-card ${isProcessing ? "overflow-hidden p-px" : ""}`}>
        {isProcessing && (
          <div
            className="absolute -inset-full animate-[spin_3s_linear_infinite]"
            style={{
              background:
                "conic-gradient(from 0deg, var(--color-accent), transparent 25%, transparent 75%, var(--color-accent))",
            }}
          />
        )}
        <div
          className={`relative rounded-card border bg-surface p-6 shadow-card ${
            isProcessing ? "border-transparent" : "border-border"
          }`}
        >
        <h2 className="text-base font-semibold text-text">Create from Transcript</h2>
        <p className="mt-1 text-sm text-text-2">
          Paste the meeting transcript below. The AI will extract projects, tasks, owners and deadlines.
        </p>

        <AnimatePresence mode="wait">
          {status === "success" ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-5 rounded-card border border-success/20 bg-success/[0.06] p-5"
            >
              <div className="text-sm font-medium text-success">
                {result.projects.length} {result.projects.length === 1 ? "project" : "projects"} · {result.totalTasks} tasks created
              </div>
              <ul className="mt-3 space-y-1.5">
                {result.projects.map((p) => (
                  <li key={p.id} className="flex items-center justify-between text-sm text-text-2">
                    <span>{p.name}</span>
                    <span className="font-mono text-xs font-tabular">
                      {p.taskCount} tasks · {p.totalHours}h
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center gap-2">
                <Link to="/projects">
                  <Button variant="secondary" size="sm">
                    View projects
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={reset}>
                  Create another
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-5">
              <div className="relative">
                <Textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value.slice(0, MAX_LENGTH))}
                  placeholder="Paste the meeting transcript here…"
                  className="min-h-[220px]"
                  disabled={isProcessing}
                  readOnly={isProcessing}
                />
                <span className="pointer-events-none absolute bottom-3 right-3 font-mono text-[11px] text-text-3 font-tabular">
                  {transcript.length} / {MAX_LENGTH}
                </span>
              </div>

              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4 rounded-field border border-border bg-surface-2 p-4"
                >
                  <StepList activeIndex={stepIndex} done={stepIndex >= STEPS.length} />
                </motion.div>
              )}

              {status === "invalid" && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 rounded-field border border-danger/20 bg-danger/[0.06] p-4"
                >
                  <div className="text-sm font-medium text-danger">Nothing was saved, fix these and try again</div>
                  <ul className="mt-2 space-y-1">
                    {issues.map((issue, i) => (
                      <li key={i} className="font-mono text-xs text-text-2 font-tabular">
                        <span className="text-danger">{issue.path}</span> — {issue.message}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {status === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 rounded-field border border-danger/20 bg-danger/[0.06] p-4 text-sm text-danger"
                >
                  {errorMessage}
                </motion.div>
              )}

              <div className="mt-4 flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleLoadSample} disabled={isProcessing}>
                  Load sample
                </Button>
                <Button
                  data-testid="transcript-submit"
                  icon={Sparkles}
                  onClick={handleSubmit}
                  loading={isProcessing}
                  disabled={!transcript.trim()}
                  className="ml-auto"
                >
                  {isProcessing ? "Reading meeting…" : "Create from Transcript"}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="mb-4 text-sm font-semibold text-text">Projects</h2>
        {projects === null ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <EmptyState icon={FolderKanban} title="No projects yet" description="Create your first projects from a transcript above." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.04 }}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
