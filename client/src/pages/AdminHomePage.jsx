import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Sparkles, Check, Loader2, Circle, FolderKanban, FileText, FileDiff, Trash2 } from "lucide-react";
import { getProjects } from "../api/projects.js";
import { getTeam } from "../api/team.js";
import { previewTranscript, commitPlan, loadSampleTranscript, loadModifiedTranscript } from "../api/transcript.js";
import { resetDemoData } from "../api/demo.js";
import { useAuth } from "../context/AuthContext.jsx";
import { StatTile } from "../components/ui/StatTile.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Textarea } from "../components/ui/Textarea.jsx";
import { Skeleton } from "../components/ui/Skeleton.jsx";
import { EmptyState } from "../components/ui/EmptyState.jsx";
import { ConfirmDialog } from "../components/ui/ConfirmDialog.jsx";
import { ProjectCard } from "../components/ProjectCard.jsx";
import { AIDecisionsPanel } from "../components/transcript/AIDecisionsPanel.jsx";
import { PlanReviewTable } from "../components/transcript/PlanReviewTable.jsx";

const STEPS = ["Reading transcript", "Matching team directory", "Applying final decisions", "Validating dates & hours"];

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
  const [team, setTeam] = useState([]);
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState("idle"); // idle | previewing | review | saving | success | error
  const [stepIndex, setStepIndex] = useState(0);
  const [plan, setPlan] = useState(null);
  const [decisions, setDecisions] = useState([]);
  const [errors, setErrors] = useState([]);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const intervalRef = useRef(null);
  const busyRef = useRef(false);

  function loadProjects() {
    getProjects().then(setProjects);
  }

  useEffect(() => {
    loadProjects();
    getTeam().then(setTeam);
    return () => clearInterval(intervalRef.current);
  }, []);

  const idleLike = status === "idle" || status === "error";

  async function handleLoadSample() {
    const sample = await loadSampleTranscript();
    setTranscript(sample);
  }

  async function handleLoadModified() {
    const modified = await loadModifiedTranscript();
    setTranscript(modified);
  }

  async function handlePreview() {
    if (!transcript.trim() || busyRef.current) return;
    busyRef.current = true;

    setStatus("previewing");
    setStepIndex(0);
    setErrorMessage("");

    intervalRef.current = setInterval(() => {
      setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
    }, 700);

    try {
      const data = await previewTranscript(transcript);
      clearInterval(intervalRef.current);
      setPlan(data.plan);
      setDecisions(data.decisions ?? []);
      setErrors(data.errors ?? []);
      setStatus("review");
    } catch (err) {
      clearInterval(intervalRef.current);
      const body = err.response?.data?.error;
      setErrorMessage(body?.message || "Something went wrong talking to the AI service.");
      setStatus("error");
    } finally {
      busyRef.current = false;
    }
  }

  function handleChangeTask(pIndex, tIndex, field, value) {
    setPlan((prev) => {
      const nextProjects = prev.projects.map((p, pi) => {
        if (pi !== pIndex) return p;
        const nextTasks = p.tasks.map((t, ti) => (ti === tIndex ? { ...t, [field]: value } : t));
        return { ...p, tasks: nextTasks };
      });
      return { ...prev, projects: nextProjects };
    });
  }

  async function handleCommit() {
    if (busyRef.current || !plan) return;
    busyRef.current = true;
    setStatus("saving");

    try {
      const data = await commitPlan(plan);
      setResult(data);
      setStatus("success");
      setTranscript("");
      setPlan(null);
      setDecisions([]);
      setErrors([]);
      loadProjects();
    } catch (err) {
      const body = err.response?.data?.error;
      if (err.response?.status === 422) {
        setErrors(body?.details ?? []);
        if (body?.draft) setPlan(body.draft);
        toast.error("Fix the highlighted fields and try again");
        setStatus("review");
      } else if (err.response?.status === 409) {
        toast.error(body?.message || "A matching project already exists.");
        setStatus("review");
      } else {
        setErrorMessage(body?.message || "Something went wrong saving the plan.");
        setStatus("error");
      }
    } finally {
      busyRef.current = false;
    }
  }

  function handleDiscard() {
    setPlan(null);
    setDecisions([]);
    setErrors([]);
    setStatus("idle");
  }

  function reset() {
    busyRef.current = false;
    setStatus("idle");
    setResult(null);
    setErrors([]);
    setErrorMessage("");
  }

  async function handleResetDemoConfirmed() {
    setResetting(true);
    try {
      await resetDemoData();
      toast.success("Demo data reset — all projects and tasks deleted.");
      setResetOpen(false);
      reset();
      setPlan(null);
      setDecisions([]);
      loadProjects();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Failed to reset demo data.");
    } finally {
      setResetting(false);
    }
  }

  const totalTasks = projects?.reduce((sum, p) => sum + p.taskCount, 0) ?? 0;
  const totalHours = projects?.reduce((sum, p) => sum + p.totalHours, 0) ?? 0;
  const isPreviewing = status === "previewing";
  const isReview = status === "review";
  const isSaving = status === "saving";
  const isBusyGlow = isPreviewing || isSaving;

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

      <div className={`relative mt-6 rounded-card ${isBusyGlow ? "overflow-hidden p-px" : ""}`}>
        {isBusyGlow && (
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
            isBusyGlow ? "border-transparent" : "border-border"
          }`}
        >
          {!isReview && (
            <>
              <h2 className="text-base font-semibold text-text">Create from Transcript</h2>
              <p className="mt-1 text-sm text-text-2">
                Paste the meeting transcript below. The AI will extract projects, tasks, owners and deadlines for you
                to review before anything is saved.
              </p>
            </>
          )}

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
            ) : isReview ? (
              <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-text">Review before saving</h2>
                    <p className="mt-1 text-sm text-text-2">
                      Nothing is saved yet. Edit assignees, deadlines or hours, then confirm.
                    </p>
                  </div>
                </div>

                <div className="mt-5">
                  <AIDecisionsPanel decisions={decisions} />
                </div>

                <div className="mt-5">
                  <PlanReviewTable plan={plan} team={team} errors={errors} onChangeTask={handleChangeTask} />
                </div>

                <div className="mt-5 flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={handleDiscard} disabled={isSaving}>
                    Discard
                  </Button>
                  <Button icon={Sparkles} onClick={handleCommit} loading={isSaving} className="ml-auto">
                    {isSaving ? "Saving…" : "Confirm & Save"}
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
                    disabled={isPreviewing}
                    readOnly={isPreviewing}
                  />
                  <span className="pointer-events-none absolute bottom-3 right-3 font-mono text-[11px] text-text-3 font-tabular">
                    {transcript.length} / {MAX_LENGTH}
                  </span>
                </div>

                {isPreviewing && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-4 rounded-field border border-border bg-surface-2 p-4"
                  >
                    <StepList activeIndex={stepIndex} done={stepIndex >= STEPS.length} />
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

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Button variant="ghost" size="sm" icon={FileText} onClick={handleLoadSample} disabled={!idleLike}>
                    Load sample transcript
                  </Button>
                  <Button variant="ghost" size="sm" icon={FileDiff} onClick={handleLoadModified} disabled={!idleLike}>
                    Load modified transcript
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    onClick={() => setResetOpen(true)}
                    disabled={!idleLike}
                    className="text-danger hover:text-danger"
                  >
                    Reset demo data
                  </Button>
                  <Button
                    data-testid="transcript-submit"
                    icon={Sparkles}
                    onClick={handlePreview}
                    loading={isPreviewing}
                    disabled={!transcript.trim()}
                    className="ml-auto"
                  >
                    {isPreviewing ? "Reading meeting…" : "Create from Transcript"}
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

      <ConfirmDialog
        open={resetOpen}
        title="Reset demo data?"
        description="This permanently deletes all projects and tasks. Users are kept. This can't be undone."
        confirmLabel="Delete everything"
        danger
        loading={resetting}
        onConfirm={handleResetDemoConfirmed}
        onCancel={() => setResetOpen(false)}
      />
    </div>
  );
}
