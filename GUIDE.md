# Workflow Automate — Local Setup Guide

This guide is for **new users who are not developers**. You can use the **Claude desktop app** (easiest — no terminal required) or **Claude Code in the terminal** to walk through every step. You do **not** need prior experience with GitHub or Node.js to get started.

**Already have the project folder?** Pick one:

| Method | What to do |
|--------|------------|
| **Claude desktop app** (recommended for beginners) | Open the app → **Code** tab → **Local** → **Select folder** → choose `workflow-automate` → say **Guide me through local setup** |
| **Terminal** | `cd` into the folder → run `claude` → say **Guide me through local setup** |

Claude will use this project’s **guide-me** skill (in `.claude/skills/`), read `GUIDE.md`, and ask what you’re missing.

> **Note:** The regular [claude.ai](https://claude.ai) **web chat** cannot run commands on your computer. For local project work you need the **Claude desktop app (Code tab)** or the **terminal** `claude` command — both are Claude Code.

---

## What this app does

**Workflow Automate** is a small website you run on your computer that:

1. Searches Costco products by keyword  
2. Builds an Excel report (with pivot charts)  
3. Updates a PowerPoint slide  
4. Shows progress and downloads in your browser  

You can try the live version without installing anything: [https://workflow-automate.vercel.app](https://workflow-automate.vercel.app)

---

## What you actually need (honest list)

| Thing | Required to **run** the app? | Required to **send changes** (PR)? |
|-------|-------------------------------|-------------------------------------|
| Computer + internet | Yes | Yes |
| **Node.js** | **Yes** | Yes |
| **Claude desktop app** or **Claude Code (terminal)** | Recommended (your helper) | Recommended |
| Anthropic account (Pro/Max/Teams/API) | For Claude Code features | For Claude Code features |
| **GitHub account** | **No** | **Yes** |
| **Git** | **No** (you can download a ZIP) | **Yes** (easier with Git) |
| Free **Neon** database account | Yes | Yes |
| Costco API credentials | No (mock mode works) | No (mock mode works) |

**Bottom line:** You can get the app running **without GitHub**. You only need GitHub later if you want to propose changes to the project (Pull Request).

---

## Phase 0 — Install tools (start here if you’re new)

Do these in order. If something is already installed, skip that step.

### 0A — Install Node.js (required)

Node.js runs this app. You need version **20 or newer** (22 is fine).

1. Go to [https://nodejs.org](https://nodejs.org)  
2. Download the big green **LTS** button (not “Current” unless your team says so)  
3. Run the installer — accept defaults  
4. **Close and reopen** your terminal app when done  

**Check it worked** — open **Terminal** (Mac) or **PowerShell** (Windows) and type:

```bash
node -v
```

You should see something like `v22.x.x`. If you see “command not found”, restart the computer and try again.

`npm` is included with Node.js. Check:

```bash
npm -v
```

---

### 0B — Install Claude (recommended)

Claude can read this guide, edit project files, and run setup commands with you.

**You need a paid Anthropic plan** (Claude Pro, Max, Teams, Enterprise) or API credits. The free claude.ai chat-only plan does **not** include local coding features.

#### Option 1 — Claude desktop app (best if you dislike the terminal)

1. Download from [https://claude.com/download](https://claude.com/download) (Mac or Windows)  
2. Install and sign in with your Anthropic account  
3. Open the **Code** tab (not just regular chat)  
4. You’ll use **Local** mode and **Select folder** in Phase 2  

Docs: [Claude Code desktop quickstart](https://code.claude.com/docs/en/desktop-quickstart)

> On **Windows**, the desktop app’s **Local** mode needs **Git** installed ([Git for Windows](https://git-scm.com/download/win)). Mac usually includes Git already.

#### Option 2 — Claude Code in the terminal

Pick **one** install method:

**Mac or Linux:**

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

**Windows (PowerShell):**

```powershell
irm https://claude.ai/install.ps1 | iex
```

**Other:** Homebrew `brew install --cask claude-code`, WinGet `winget install Anthropic.ClaudeCode`, or [setup docs](https://code.claude.com/docs/en/setup).

Check: `claude --version` — first run will ask you to log in.

**Desktop app and terminal share the same project config** — skills in `.claude/skills/`, rules in `.claude/`, and `CLAUDE.MD` work in both.

---

### 0C — Install Git (optional for now)

**Skip this** if you only want to run the app today. You can download the project as a ZIP (Phase 1, Option B).

Install Git when you want easier updates or plan to open a Pull Request:

| System | How |
|--------|-----|
| **Mac** | Install [Xcode Command Line Tools](https://developer.apple.com/xcode/resources/) — in Terminal run `xcode-select --install` |
| **Windows** | [Git for Windows](https://git-scm.com/download/win) — accept defaults |
| **Linux** | `sudo apt install git` (Ubuntu/Debian) or ask your IT team |

Check:

```bash
git --version
```

---

### 0D — GitHub account (only for contributing later)

You do **not** need GitHub to run the app locally.

Create a free account at [https://github.com/signup](https://github.com/signup) when you’re ready to:

- Clone with `git` instead of ZIP  
- Open a **Pull Request** so a teammate can review your changes  

Ask your team lead to **invite you** to the repository when you need write access.

---

## Phase 1 — Get the project on your computer

### Option A — Download ZIP (no GitHub account needed)

1. Open: [https://github.com/znosgnoh/workflow-automate](https://github.com/znosgnoh/workflow-automate)  
2. Click the green **Code** button → **Download ZIP**  
3. Unzip the file (double-click on Mac; right-click → Extract on Windows)  
4. Move the folder somewhere easy to find, e.g.  
   - Mac: `Documents/workflow-automate`  
   - Windows: `C:\Users\YourName\Documents\workflow-automate`  
5. Remember this path — you’ll open it in the terminal next  

> ZIP downloads are a **snapshot**. To get newer code later, download a fresh ZIP or install Git (Phase 0C) and use `git pull`.

### Option B — Git clone (if you have Git + repo access)

```bash
cd ~/Documents
git clone https://github.com/znosgnoh/workflow-automate.git
cd workflow-automate
```

---

## Phase 2 — Open the project in Claude

### Option A — Claude desktop app (no terminal needed)

1. Open the **Claude** desktop app and sign in  
2. Click the **Code** tab  
3. Click **+ New session** (or start a new chat in Code)  
4. Set **Environment** to **Local** (runs on your computer, not cloud)  
5. Click **Select folder** and choose your `workflow-automate` folder (the unzipped or cloned directory)  
6. In the chat box, type:

> Guide me through local setup

Claude can run terminal commands inside the app, edit files, and walk through the rest of this guide.

**If Local mode is greyed out on Windows:** install [Git for Windows](https://git-scm.com/download/win) and restart the app.

### Option B — Terminal (`claude` command)

1. Open **Terminal** (Mac/Linux) or **PowerShell** (Windows)  
2. Go into the project folder:

```bash
cd ~/Documents/workflow-automate
```

Windows example:

```powershell
cd C:\Users\YourName\Documents\workflow-automate
```

3. Start Claude Code:

```bash
claude
```

4. Say: **Guide me through local setup**

Both options use the same **guide-me** skill and project rules. You can switch between desktop and terminal on the same folder.

**Tips:** Ask in plain English — *“I don’t have Node installed yet”* or *“Help me create the .env.local file.”*

---

## Phase 3 — Install app dependencies

Inside the project folder (you or Claude can run this):

```bash
npm install
```

First run takes 1–3 minutes. You need internet.

If you see errors about `node` or `npm` not found, go back to **Phase 0A**.

---

## Phase 4 — Environment file (`.env.local`)

The app stores private settings in **`.env.local`** on your computer. This file is **never** uploaded to GitHub.

### Create the file

**Mac / Linux:**

```bash
cp .env.example .env.local
```

**Windows (PowerShell):**

```powershell
Copy-Item .env.example .env.local
```

### Beginner-friendly settings (mock Costco)

Open `.env.local` in any text editor (Notepad, TextEdit, VS Code) and set:

```env
DATABASE_URL="postgresql://..."        # Phase 5 — you will fill this in
STORAGE_MODE="local"
COSTCO_USE_MOCK="true"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
PPT_TEMPLATE_PATH="templates/costco-ongoing-products.pptx"
```

Leave these **empty** for local mock mode:

- `BLOB_READ_WRITE_TOKEN`  
- `COSTCO_CLIENT_IDENTIFIER`  
- `COSTCO_VISITOR_ID`  

### Real Costco search (optional)

Only if your team gave you credentials:

```env
COSTCO_USE_MOCK="false"
COSTCO_CLIENT_IDENTIFIER="..."
COSTCO_VISITOR_ID="..."
```

Ask your **team lead** for these values. They expire — you may need fresh ones later.

---

## Phase 5 — Database (required)

The app needs a cloud PostgreSQL database. **Neon** has a free tier.

1. Sign up at [https://neon.tech](https://neon.tech)  
2. Create a project (name it `workflow-automate-dev`)  
3. Copy the **connection string** (starts with `postgresql://`)  
4. Paste into `.env.local`:

```env
DATABASE_URL="postgresql://user:password@ep-xxxx.aws.neon.tech/neondb?sslmode=require"
```

**Or** ask your team lead for a shared `DATABASE_URL`.

Tell Claude: *“Here is my DATABASE_URL”* (paste it in chat only if you trust the session) **or** say *“I created Neon, help me add it to .env.local”* and Claude can edit the file for you.

---

## Phase 6 — One-time setup commands

Run once after `npm install` and after `DATABASE_URL` is set:

```bash
npm run generate:ppt-template
npm run db:migrate
```

| Command | What it does |
|---------|----------------|
| `generate:ppt-template` | Creates the PowerPoint template file |
| `db:migrate` | Creates database tables (press Enter if it asks for a migration name) |

If `db:migrate` fails, your `DATABASE_URL` is probably wrong or the Neon project is paused.

---

## Phase 7 — Start the app

```bash
npm run dev
```

When you see `Ready` or `localhost:3000`:

1. Open [http://localhost:3000](http://localhost:3000) in Chrome, Safari, or Edge  
2. Open **Costco Product Report**  
3. Search for `coconut` and click **Run report**

### Health check

Visit [http://localhost:3000/api/health](http://localhost:3000/api/health)

Good result: `"ok": true` and `"db": "connected"`.

### Downloaded files

With `STORAGE_MODE=local`, files are also saved in:

```
workflow-automate/output/
```

---

## Information to ask your team lead

If you don’t have something, **ask before guessing**.

| What | Needed for |
|------|------------|
| `DATABASE_URL` | Always — or create your own Neon DB |
| `COSTCO_USE_MOCK=true` | Easiest — no Costco login |
| `COSTCO_CLIENT_IDENTIFIER` + `COSTCO_VISITOR_ID` | Real Costco searches only |
| GitHub repo invite | Contributing via Pull Request |
| Vercel access | Deploying to production (maintainers only) |

**Never** post secrets in public Slack, email threads, or GitHub issues. Only put them in `.env.local`.

---

## Troubleshooting

| Problem | What to try |
|---------|-------------|
| `node` / `npm` not found | Install Node.js (Phase 0A), restart terminal |
| `claude` not found | Install Claude Code (Phase 0B), restart terminal |
| `command not found: cp` on Windows | Use `Copy-Item .env.example .env.local` |
| Database errors | Fix `DATABASE_URL`, wake Neon project in dashboard |
| Costco not configured | Set `COSTCO_USE_MOCK=true` in `.env.local` |
| Port 3000 busy | Run `npm run dev -- -p 3001`, open `http://localhost:3001` |
| Weird errors after updating code | `npm run dev:reset` |
| Claude can’t find the project | `cd` into the unzipped/cloned folder first |

More detail: [`README.md`](./README.md)

---

## Contributing — Pull Request (when you’re ready)

A **Pull Request (PR)** proposes changes for review. You need **Git**, a **GitHub account**, and repo access (or a fork).

If you’re not there yet, you can still:

- Run the app locally  
- Edit files and test  
- Ask your team lead to apply changes for you  

### When you have Git + GitHub

Tell Claude:

> Help me make a Pull Request for [describe your change]

Typical flow:

```
Create branch → Edit files → Commit → Push → Open PR on GitHub → Review → Merge
```

1. **Branch:** `git checkout -b my-change-name`  
2. **Edit** with Claude’s help  
3. **Commit:** ask Claude *“Commit my changes”* (never commit `.env.local`)  
4. **Push:** `git push -u origin my-change-name`  
5. **On GitHub:** click **Compare & pull request** → fill title/description → **Create pull request**

### No GitHub yet?

1. Make your edits locally and test with `npm run dev`  
2. Zip your changed files or describe changes to your team lead  
3. Set up GitHub when you’re ready for the official PR workflow  

---

## Quick command reference

| Command | When |
|---------|------|
| `claude` | Start AI helper in project folder |
| `npm run dev` | Start the website |
| `npm run dev:reset` | Fix odd errors after updates |
| `npm run db:studio` | Browse database in browser |

---

## What to say to Claude (desktop app or terminal)

| Goal | Example message |
|------|-----------------|
| Full setup | **Guide me through local setup** |
| No Node yet | **I need to install Node.js first** |
| No project yet | **Help me download the project without GitHub** |
| Env file help | **Help me set up .env.local with mock Costco** |
| Database help | **Walk me through creating a Neon database** |
| Something broke | **I’m on Phase X of GUIDE.md — here’s the error:** … |
| Contribute | **Help me open a Pull Request for …** |

---

## Next steps

1. Complete Phases 0–7  
2. Run a test search at [http://localhost:3000/workflows/costco](http://localhost:3000/workflows/costco)  
3. Open the Excel download and check **Data**, **Summary**, and **Pivot** sheets  
4. Read [`README.md`](./README.md) when you want technical details  

Welcome to the project.
