# Deploy CCA-F Quiz to GitHub Pages

This folder is **fully self-contained** — everything needed to build and deploy is included. You can deploy directly from this zip.

## Prerequisites

- [Node.js](https://nodejs.org/) v18+ installed
- [Git](https://git-scm.com/) installed
- A [GitHub](https://github.com/) account

## Step 1 — Unzip & Install

1. Unzip the folder
2. Open a terminal inside the `cca-f-quiz` folder
3. Install dependencies:

```bash
npm install
```

## Step 2 — (Optional) Test Locally

```bash
npm run dev
```

Open the URL shown in the terminal to verify the app works.

## Step 3 — Create a GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Name it **`cca-f-quiz`** (must match the `base` in `vite.config.ts`)
3. Set visibility to **Public** (required for free GitHub Pages)
4. **Do not** initialize with README, .gitignore, or license — you already have everything

## Step 4 — Push to GitHub

Run these commands in the `cca-f-quiz` folder:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/cca-f-quiz.git
git push -u origin main
```

> Replace `YOUR_USERNAME` with your GitHub username.

## Step 5 — Enable GitHub Pages

1. Go to your repo on GitHub → **Settings** → **Pages**
2. Under **Build and deployment → Source**, select **GitHub Actions**

That's it! The included workflow (`.github/workflows/deploy.yml`) will automatically build and deploy the site.

## Step 6 — Visit Your Site

After the action completes (~1-2 min), your site will be live at:

```
https://YOUR_USERNAME.github.io/cca-f-quiz/
```

Every future push to `main` will automatically rebuild and redeploy.

---

## If Your Repo Has a Different Name

If you name the repo something other than `cca-f-quiz`, edit `vite.config.ts` before pushing:

```ts
export default defineConfig({
  base: '/YOUR-REPO-NAME/',   // ← must match your GitHub repo name
  ...
})
```

## What's Included

| File / Folder | Purpose |
|---|---|
| `src/` | React app source code |
| `public/banks/` | Pre-built question bank JSON files |
| `docs/` | Study guides and reference materials |
| `.github/workflows/deploy.yml` | Auto-deploy workflow for GitHub Pages |
| `vite.config.ts` | Build config with `base: '/cca-f-quiz/'` |
| `.gitignore` | Excludes `node_modules/`, `dist/`, `.vite/` |
| `package.json` + `package-lock.json` | Dependencies (locked versions) |
