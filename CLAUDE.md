# NovaWorks AI Project Manager: Architecture & Build Guide

> Claude Code: this file is the source of truth. Follow the architecture, folder structure,
> conventions and build phases below. The challenge brief is in `docs/challenge.pdf`.

---

## 1. What we are building

A small project-management CRM for NovaWorks Technologies.
**Core flow:** Admin logs in → pastes a meeting transcript → clicks **Create from Transcript** →
the AI extracts projects and tasks using the company directory → the server validates and saves
everything atomically → users see projects and tasks filtered by role.

Expected result for the supplied transcript: **3 projects, 12 tasks** (answer key in section 9 of the PDF).

**Out of scope (do NOT build):** signup, forgot password, email verification, user management,
cost calculation, progress tracking, charts, timesheets.

---

## 2. System architecture

```
┌──────────────────────────────┐        HTTPS (httpOnly JWT cookie)
│  React SPA (Vite + Router)    │ ─────────────────────────────────────┐
│  pages → hooks → api client  │                                      │
└──────────────────────────────┘                                      ▼
                                     ┌──────────────────────────────────────────────┐
                                     │ Express API (Node 20)                        │
                                     │                                              │
                                     │ middleware: helmet, cors, cookieParser,      │
                                     │   rateLimit(auth, transcript), requireAuth,  │
                                     │   requireRole, errorHandler                  │
                                     │                                              │
                                     │ routes → controllers → services → models     │
                                     │                                              │
                                     │ services/                                    │
                                     │   auth.service       (login, JWT)            │
                                     │   access.service     (role scoping)  ◄─ ALL  │
                                     │   transcript.service (AI pipeline)     reads │
                                     └───────┬─────────────────────────┬────────────┘
                                             │ Mongoose                │ HTTPS
                                             ▼                         ▼
                                   ┌───────────────────┐     ┌──────────────────────┐
                                   │ MongoDB Atlas     │     │ OpenAI API            │
                                   │ (replica set →    │     │ (forced tool call →   │
                                   │  transactions)    │     │  structured JSON)     │
                                   └───────────────────┘     └──────────────────────┘
```

In production, Express serves the built React app (`client/dist`) from the **same origin**,
so there are no CORS or cookie issues. It runs as one Render web service with Atlas as the database.

### Transcript pipeline (the heart of the app)

```
POST /api/transcript (ADMIN)
  1. validate input          → non-empty, ≤ 50k chars
  2. build directory         → users: code, name, role, specialization, skills (NO passwords)
  3. call LLM                → forced tool call "submit_plan" with a JSON schema
  4. parse (zod)             → shape check
  5. business validation     → roles, dates, hours, deadlines, unresolved[] (pure function)
  6. resolve references      → user codes ("PM01") → ObjectIds
  7. duplicate guard         → project with same name + client already exists → 409
  8. persist (transaction)   → insert projects + tasks, all or nothing
  9. respond                 → created projects + task counts + total hours
  any failure → nothing saved, readable error list returned
```

---

## 3. Tech stack

| Layer      | Choice |
|------------|--------|
| Frontend   | React 18, Vite, React Router v6, Tailwind CSS, axios |
| Backend    | Node 20, Express 4 (ES modules), Mongoose 8 |
| Validation | zod (request bodies + AI output) |
| Auth       | bcryptjs + jsonwebtoken in an httpOnly cookie |
| AI         | `openai` SDK, function calling with forced `tool_choice` |
| Security   | helmet, cors, express-rate-limit, cookie-parser |
| Database   | MongoDB Atlas (free M0 cluster, a replica set, so transactions work) |
| Deploy     | Render (single web service) + Atlas |

---

## 4. Folder structure (monorepo)

```
novaworks-pm/
├── CLAUDE.md
├── README.md
├── package.json                 # root: build + start scripts for deployment
├── docs/
│   ├── challenge.pdf
│   └── transcripts/
│       ├── original.txt         # supplied transcript
│       └── modified.txt         # QuickServe integration = 12h, 23 Oct
├── server/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── app.js               # express app (no listen) – testable
│       ├── server.js            # connect DB + listen
│       ├── config/
│       │   ├── env.js           # zod-validated env vars
│       │   └── db.js
│       ├── models/
│       │   ├── User.js
│       │   ├── Project.js
│       │   └── Task.js
│       ├── middleware/
│       │   ├── requireAuth.js
│       │   ├── requireRole.js
│       │   ├── rateLimits.js
│       │   └── errorHandler.js
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── project.routes.js
│       │   ├── task.routes.js
│       │   ├── team.routes.js
│       │   └── transcript.routes.js
│       ├── controllers/         # thin: read req → call service → send res
│       ├── services/
│       │   ├── auth.service.js
│       │   ├── access.service.js
│       │   └── transcript/
│       │       ├── index.js           # orchestrates the pipeline
│       │       ├── prompt.js          # system prompt + tool schema
│       │       ├── llmClient.js       # OpenAI call, timeout, 1 retry
│       │       ├── schema.js          # zod schema for AI output
│       │       ├── validatePlan.js    # pure business rules → errors[]
│       │       └── persistPlan.js     # mongoose transaction
│       ├── utils/
│       │   ├── AppError.js
│       │   └── dates.js
│       └── scripts/
│           ├── seed.js          # upsert 10 demo users (idempotent)
│           ├── reset.js         # delete projects + tasks, keep users
│           ├── verify.js        # compare DB to the answer key
│           └── testAccess.js    # role-isolation checks
└── client/
    ├── package.json
    ├── .env.example
    └── src/
        ├── main.jsx
        ├── App.jsx              # routes
        ├── api/
        │   ├── client.js        # axios instance (withCredentials)
        │   ├── auth.js
        │   ├── projects.js
        │   ├── tasks.js
        │   ├── team.js
        │   └── transcript.js
        ├── context/AuthContext.jsx
        ├── components/
        │   ├── Layout.jsx  Navbar.jsx  ProtectedRoute.jsx  RoleRoute.jsx
        │   ├── ProjectCard.jsx  TaskTable.jsx  RoleBadge.jsx
        │   ├── Spinner.jsx  EmptyState.jsx  ErrorBox.jsx
        │   └── TranscriptForm.jsx
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── AdminHomePage.jsx      # project cards + TranscriptForm
        │   ├── ProjectsPage.jsx
        │   ├── ProjectDetailPage.jsx
        │   ├── MyTasksPage.jsx
        │   ├── TeamPage.jsx
        │   └── NotFoundPage.jsx
        └── utils/format.js        # dates, hours
```

---

## 5. Data model (Mongoose)

```js
User {
  code:           String, unique, required   // "ADMIN", "PM01".."PM03", "DEV01".."DEV06"
  name:           String, required
  email:          String, unique, lowercase, required
  passwordHash:   String, required, select: false
  role:           enum ["ADMIN","MANAGER","AGENT"], required
  specialization: String
  skills:         [String]
}

Project {
  name:        String, required
  clientName:  String, required
  description: String
  manager:     ObjectId → User (must be a MANAGER), required, index
  deadline:    Date, required
  createdBy:   ObjectId → User
  timestamps
}
index: { name: 1, clientName: 1 } unique   // duplicate guard

Task {
  project:        ObjectId → Project, required, index
  title:          String, required
  description:    String
  assignee:       ObjectId → User (must be an AGENT), required, index
  deadline:       Date, required
  estimatedHours: Number, required, min 0.1
  timestamps
}
index: { assignee: 1, project: 1 }
```

Dates are stored as UTC midnight (`new Date("2026-10-20T00:00:00Z")`) and displayed as `YYYY-MM-DD`
or "20 Oct 2026". Never let timezones shift a date.

---

## 6. API contract

All responses are JSON. Errors are always shaped as `{ error: { code, message, details? } }`.

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | /api/auth/login | public | `{email,password}` → sets cookie, returns user |
| POST | /api/auth/logout | any | clears cookie |
| GET  | /api/auth/me | any | current user or 401 |
| GET  | /api/team | any | directory: code, name, role, specialization, skills |
| GET  | /api/projects | any | scoped list + taskCount + totalHours + manager name |
| GET  | /api/projects/:id | any | scoped project + scoped tasks; 404 if out of scope |
| GET  | /api/tasks/mine | AGENT | own tasks with project name, manager + project deadline |
| POST | /api/transcript | ADMIN | `{transcript}` → 201 created summary / 422 / 409 / 502 |
| GET  | /api/health | public | `{ok:true}` |

Return **404 (not 403)** for out-of-scope project IDs so they don't leak whether a project exists.
Invalid ObjectId → 404.

---

## 7. Access control (enforced only in `access.service.js`)

| Role | Projects | Tasks within a project | Transcript |
|------|----------|------------------------|------------|
| ADMIN | all | all | ✅ |
| MANAGER | `manager == me` | all tasks of own projects | ❌ |
| AGENT | projects containing ≥1 task assigned to me | **only my tasks** | ❌ |

Rules:
- The current user always comes from the verified JWT → DB lookup. Never trust role or id from the body or query.
- Every data controller calls `access.service`; no controller queries Project or Task directly.
- An agent may see a related project's name, client, manager and deadline, but never other agents' tasks.

---

## 8. AI layer

### Directory sent to the model
`[{ code, name, role, specialization, skills }]`. No emails, no passwords, no ObjectIds.

### Structured output: forced tool call
Use OpenAI function calling with `tool_choice: { type: "function", function: { name: "submit_plan" } }`
so the model must return JSON that matches the schema (no fence stripping needed). Tool parameters schema:

```json
{
  "projects": [{
    "name": "string", "clientName": "string", "description": "string",
    "managerId": "PM01", "deadline": "YYYY-MM-DD",
    "tasks": [{
      "title": "string", "description": "string",
      "assigneeId": "DEV01", "deadline": "YYYY-MM-DD", "estimatedHours": 12
    }]
  }],
  "unresolved": [{ "project": "string", "task": "string (omitted for project-level issues)", "field": "string", "reason": "string" }]
}
```

### System prompt rules (prompt.js)
1. You convert a meeting transcript into projects and tasks for NovaWorks.
2. Use ONLY people from the provided directory, referenced by their `code`. Managers must have role MANAGER; task assignees must have role AGENT.
3. When a value is changed later in the meeting (deadline, hours, owner), use the FINAL agreed value. An explicit final recap overrides earlier statements.
4. Do not create tasks for features that were rejected, excluded or deferred to future work.
5. People who are not in the directory (clients, end users, outsiders) are never assigned work.
6. One task per distinct piece of work discussed. Do not merge tasks with the same owner, and do not split a task into sub-tasks.
7. `estimatedHours` = developer effort hours as stated, not calendar days. No management hours.
8. Dates are `YYYY-MM-DD`. Use the meeting year if no year is given.
9. If a required value cannot be determined, do NOT guess. Add it to `unresolved`.
10. Descriptions: 1–2 sentences, include scope boundaries mentioned (e.g. "demo cart, no real payments").

User message: `MEETING DATE: <from transcript or today>\n\nDIRECTORY:\n<json>\n\nTRANSCRIPT:\n<text>`

Model and temperature come from env (`OPENAI_MODEL`, temperature 0). Timeout 60s, 1 retry on network/5xx.

### Business validation (validatePlan.js, pure function, unit-testable)
Returns `errors[]` of `{ path, message }`. Checks:
- ≥ 1 project; each project has ≥ 1 task
- required strings are non-empty
- `managerId` exists and role = MANAGER
- `assigneeId` exists and role = AGENT
- dates are real calendar dates in `YYYY-MM-DD`
- task.deadline ≤ project.deadline
- estimatedHours > 0 and ≤ 500
- no duplicate task titles within a project; no duplicate project names in the plan
- `unresolved` is non-empty → each becomes an error

If there are any errors, return **422** `{ error: { code: "PLAN_INVALID", message, details: errors, draft } }`. Nothing is saved.

### Persist (persistPlan.js)
```js
const session = await mongoose.startSession();
await session.withTransaction(async () => {
  for (const p of plan.projects) {
    const [proj] = await Project.create([{ ...p, manager: ids[p.managerId], createdBy: admin._id }], { session });
    await Task.insertMany(p.tasks.map(t => ({ ...t, project: proj._id, assignee: ids[t.assigneeId] })), { session });
  }
});
```
Before the transaction: if any `{name, clientName}` already exists, return **409 DUPLICATE_PROJECT**
(tell the admin to run reset for a clean demo).

---

## 9. Frontend architecture

- **AuthContext:** on mount calls `/api/auth/me`; exposes `user, login, logout, loading`.
- **Routing:**
  - `/login` (public)
  - `/admin` → RoleRoute ADMIN
  - `/projects`, `/projects/:id`, `/team` → any logged in
  - `/my-tasks` → RoleRoute AGENT
  - `/` → redirect by role (ADMIN→/admin, MANAGER→/projects, AGENT→/my-tasks)
- **API layer:** one axios instance (`withCredentials: true`, baseURL `VITE_API_URL || "/api"`),
  with an interceptor that sends 401 → logout → /login.
- **TranscriptForm states:** idle → submitting (button disabled + spinner + "AI is reading the
  meeting…") → success (summary list of projects with task counts and hours, refresh cards) →
  invalid (422: show `details` as a list, keep the textarea content, allow resubmit) → error (502/500 message).
  Include a "Load sample transcript" button that fetches `docs/transcripts/original.txt` content (bundled).
- **UI:** Tailwind, clean cards, role badges (Admin = purple, Manager = blue, Agent = green), tables with
  hours right-aligned, total hours per project, empty and loading states everywhere.
- The login page shows the demo accounts table, and clicking a row fills the form.

---

## 10. Security checklist
- bcrypt cost 10; `passwordHash` has `select: false`; never return it.
- JWT holds only `{ sub: userId }`, expires in 8h; cookie `httpOnly`, `sameSite: "lax"`, `secure` in production.
- helmet; CORS only for `CLIENT_URL` in dev (same-origin in prod).
- Rate limit: login 20 per 15 min per IP; transcript 10 per min.
- Body limit 100kb. Validate all inputs with zod.
- Secrets only in `.env`; commit `.env.example` only.

---

## 11. Environment variables

server/.env
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/novaworks
JWT_SECRET=<long random string>
OPENAI_API_KEY=<key>
OPENAI_MODEL=<model id>
CLIENT_URL=http://localhost:5173
```
If `mongodb+srv://` connections hang or intermittently fail (flaky DNS TXT-record lookups on some
networks), use Atlas's standard (non-SRV) connection string instead — found in the Atlas UI under
Connect → Drivers → "Standard connection string". It lists the shard hosts directly and skips SRV/TXT
DNS resolution entirely, at the cost of needing to be refreshed if Atlas ever rotates shard hostnames.
client/.env
```
VITE_API_URL=http://localhost:5000/api
```

---

## 12. Scripts

| Where | Command | Purpose |
|-------|---------|---------|
| server | `npm run dev` | nodemon |
| server | `npm run seed` | upsert 10 demo users (safe to rerun) |
| server | `npm run reset` | delete all projects + tasks |
| server | `npm run verify` | check DB against the answer key (12 PASS lines) |
| server | `npm run test:access` | role isolation checks |
| client | `npm run dev` | Vite on :5173 |
| root | `npm run build` | install both + build client |
| root | `npm start` | start server (serves client/dist in prod) |

---

## 13. Build phases (do them in order, commit after each)

1. **Scaffold:** monorepo folders, package.json files, env.js with zod, db.js, app.js with middleware + health route + errorHandler + AppError.
2. **Models + seed + reset:** the three models with indexes; idempotent seed of the 10 users from the PDF.
3. **Auth:** auth.service, routes, requireAuth, requireRole, rate limits.
4. **Access layer + read APIs:** access.service, projects/tasks/team routes, `testAccess.js`.
5. **Transcript pipeline:** prompt, llmClient, schema, validatePlan, persistPlan, route. Save both transcripts into `docs/transcripts/`. Write `verify.js`.
6. **Frontend shell:** Vite + Tailwind + router, AuthContext, api layer, Login, Layout/Navbar, route guards.
7. **Frontend pages:** Admin home + TranscriptForm, Projects, ProjectDetail, MyTasks, Team.
8. **Hardening:** error and empty states, double-click guard, date display, run the full demo from section 8 of the PDF.
9. **Deploy:** Express serves client/dist; root scripts; Render setup; seed Atlas.
10. **README:** follow section 10 of the PDF exactly.

## 14. Conventions for Claude Code
- ES modules everywhere; async/await; no callbacks.
- Controllers are thin; business logic lives in services; services never touch `req` or `res`.
- Throw `AppError(status, code, message, details)`; the central errorHandler formats every error.
- Never hardcode the expected 12 tasks anywhere in app code. They appear only in `verify.js`.
- Keep functions small; validatePlan must stay pure (no DB calls; pass the directory in).
- After each phase: run it, fix errors, then summarize what changed.
