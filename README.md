# NovaWorks AI Project Manager

The Infinity Hack '26 — AI Project Manager: Meeting to Execution
Team: _[fill in team name]_

A small project-management CRM for NovaWorks Technologies. An admin pastes a meeting transcript,
the AI extracts projects and tasks from the company directory, the server validates and saves everything
atomically, and users see projects/tasks filtered by role.

---

## Stack

| Layer      | Choice |
|------------|--------|
| Frontend   | React 18, Vite, React Router v6, Tailwind CSS, axios |
| Backend    | Node 20, Express 4 (ES modules), Mongoose 8 |
| Validation | zod (request bodies + AI output) |
| Auth       | bcryptjs + jsonwebtoken, httpOnly cookie |
| AI         | OpenAI SDK, forced function/tool call → structured JSON |
| Security   | helmet, cors, express-rate-limit, cookie-parser |
| Database   | MongoDB (replica set, so multi-document transactions work) |

## Working Features

- Login/logout with seeded demo accounts (no signup, no password reset).
- Admin home: all project cards + **Create from Transcript**.
- Read-only team directory (names, roles, specializations, skills).
- Projects list and project detail (client, manager, deadline, tasks).
- Task rows: title, description, assignee, deadline, estimated hours.
- Role-scoped data: Manager sees only their projects; Agent sees only their assigned tasks and the
  related project — enforced server-side in `access.service.js`, not just hidden in the UI.
- AI transcript → projects/tasks pipeline: directory-grounded extraction, zod schema validation,
  business-rule validation (dates, roles, duplicate titles, unresolved fields), all-or-nothing save
  in a Mongo transaction, 409 on duplicate project, 422 with a readable error list on invalid input.
- Persistent storage — projects/tasks survive a refresh.

**Out of scope** (per the challenge brief): signup, forgot password, email verification, user
management, cost calculation, progress tracking, charts, timesheets.

---

## Setup and Run (local)

Requires Node 20+ and a MongoDB connection string that points at a **replica set** (transactions
require it — see [Database setup](#database-setup) below).

```bash
# 1. clone and enter the repo
git clone <this-repo-url>
cd novaworks-pm

# 2. install dependencies
npm install --prefix server
npm install --prefix client

# 3. configure environment
cp server/.env.example server/.env
cp client/.env.example client/.env
# then fill in server/.env — see Environment Variables below

# 4. seed the 10 demo users (safe to re-run, upserts by email)
npm run seed --prefix server

# 5. run backend and frontend in two terminals
npm run dev --prefix server      # http://localhost:5000
npm run dev --prefix client      # http://localhost:5173
```

Open `http://localhost:5173` and log in with any demo account below.

### Other server scripts

| Command | Purpose |
|---|---|
| `npm run seed --prefix server` | Upsert the 10 demo users (by email) |
| `npm run reset --prefix server` | Delete all projects + tasks, keep users |
| `npm run verify --prefix server` | Compare DB against the answer key (expects 3 projects / 12 tasks) |
| `npm run test:access --prefix server` | Role-isolation checks |

### Production build (single-service mode)

From the repo root:

```bash
npm run build   # installs both + builds client/dist
npm start       # starts Express, which serves client/dist on the same origin
```

---

## Database Setup

Any MongoDB **replica set** works (local `mongod --replSet` or a hosted cluster) — plain standalone
Mongo will fail on the transactional project+task save. The easiest free hosted option is
**MongoDB Atlas** (M0 free tier is already provisioned as a replica set):

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a database user and allow network access (or `0.0.0.0/0` for a demo).
3. Atlas UI → **Connect → Drivers** → copy the connection string into `MONGODB_URI`.
   - If the `mongodb+srv://` string hangs or fails intermittently (flaky SRV/TXT DNS lookups on
     some networks), use the **standard (non-SRV) connection string** instead, listed in the same
     Atlas "Connect → Drivers" panel — it lists the shard hosts directly.
4. Run `npm run seed --prefix server` once against that URI to create the 10 demo users.

---

## Environment Variables

`server/.env` (see `server/.env.example`):

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/novaworks
JWT_SECRET=<long random string>
OPENAI_API_KEY=<key>
OPENAI_MODEL=<model id>
CLIENT_URL=http://localhost:5173
```

`client/.env` (see `client/.env.example`):

```
VITE_API_URL=http://localhost:5000/api
```

No secrets are committed — only `.env.example` files are tracked.

---

## Demo Accounts

Seeded by `npm run seed --prefix server`. Password for every account: **`Demo123!`**

| Code | Name | Email | Role / Specialization |
|---|---|---|---|
| ADMIN | Admin | admin@novaworks.example | Administrator |
| PM01 | Ayesha Khan | ayesha@novaworks.example | Manager / Web PM |
| PM02 | Bilal Ahmed | bilal@novaworks.example | Manager / Mobile PM |
| PM03 | Hina Malik | hina@novaworks.example | Manager / AI PM |
| DEV01 | Ali Raza | ali@novaworks.example | Agent / Full-Stack |
| DEV02 | Hamza Shah | hamza@novaworks.example | Agent / Full-Stack |
| DEV03 | Sara Noor | sara@novaworks.example | Agent / App Developer |
| DEV04 | Usman Tariq | usman@novaworks.example | Agent / App Developer |
| DEV05 | Zain Abbas | zain@novaworks.example | Agent / AI Developer |
| DEV06 | Maryam Asif | maryam@novaworks.example | Agent / AI Developer |

These are fictional demo credentials only — not real inboxes.

---

## Transcript Testing Steps

1. Log in as **ADMIN** (`admin@novaworks.example` / `Demo123!`).
2. On the Admin home page, click **Load sample transcript** (loads `docs/transcripts/original.txt`),
   or paste your own.
3. Click **Create from Transcript**. Expect a loading state, then a success summary.
4. Verify the result: **3 projects, 12 tasks** — UrbanCart Website (4 tasks, 40h), QuickServe Mobile
   App (4 tasks, 46h), HelpDeskPro AI Assistant (4 tasks, 38h). Run `npm run verify --prefix server`
   to check this automatically against the answer key.
5. Open a project to see client, manager, deadline, and its tasks with hours.
6. Log out and log in as **PM01 (Ayesha)** — only UrbanCart should be visible.
7. Log in as **DEV01 (Ali)** — only his 3 tasks and the related project should be visible; other
   agents' tasks must not be reachable even via direct API calls.
8. Log in as **DEV02 (Hamza)** — his 2 tasks span UrbanCart and QuickServe.
9. Refresh the page — projects/tasks should persist.
10. To prove genuine AI conversion (not a hardcoded answer), reset (`npm run reset --prefix server`)
    and submit `docs/transcripts/modified.txt`, which changes QuickServe's integration task to
    **12 hours, due 23 October** — the generated task should reflect the new values while every
    other task stays the same.

---

## Live Deployment

- **Live link:** _[fill in after deploying, e.g. https://novaworks-pm.onrender.com]_
- **Demo video:** _[fill in demo video link]_
- **Demo credentials:** same as the [Demo Accounts](#demo-accounts) table above.

### Deployment platform

- **Backend + frontend:** [Render](https://render.com) — a single Node 20 web service. Express
  serves the built React app (`client/dist`) from the same origin in production, so there are no
  CORS or cross-site cookie issues. Defined in [`render.yaml`](render.yaml) (Render "Blueprint").
- **Database:** [MongoDB Atlas](https://www.mongodb.com/atlas) free M0 cluster (replica set, so
  transactions work).

### Deployment steps

1. Push this repo to GitHub.
2. Create an Atlas M0 cluster, a database user, and network access; copy the connection string
   (standard, non-SRV form recommended — see [Database setup](#database-setup)).
3. In Render: **New → Blueprint**, connect the GitHub repo. Render reads `render.yaml` and creates
   the web service with `npm run build` / `npm start`.
4. Set the prompted environment variables: `MONGODB_URI`, `OPENAI_API_KEY` (`JWT_SECRET` is
   auto-generated by the blueprint, `OPENAI_MODEL` defaults in `render.yaml`).
5. Once deployed, open a Render **Shell** on the service and run `npm run seed --prefix server`
   once to create the 10 demo users.
6. Verify `https://<service>.onrender.com/api/health` returns `{"ok":true}`, then log in at the
   root URL.

---

## Known Limitations

- Editing created projects/tasks after AI creation is not implemented (noted as optional in the brief).
- No automated test suite beyond `verify.js` (DB-state check) and `testAccess.js` (role-isolation
  checks); no CI pipeline.
- The LLM call has a 60s timeout and a single retry on network/5xx errors; a sustained OpenAI outage
  surfaces as a 502 with no further retry.
- Free-tier hosting (Render free web service, Atlas M0) may cold-start after idling.
