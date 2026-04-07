# RepairIQ — Deployment Guide (Windows)

Follow these steps in order. Each section should take about 5–10 minutes.

---

## PART 1 — Install the tools you need

### 1a. Install Node.js
1. Go to https://nodejs.org
2. Download the **LTS** version (the left button)
3. Run the installer — just click Next through everything
4. When done, open **Command Prompt** (search "cmd" in the Start menu)
5. Type this and press Enter to confirm it worked:
   ```
   node --version
   ```
   You should see something like `v20.x.x`

### 1b. Install Git
1. Go to https://git-scm.com/download/win
2. Download and run the installer — defaults are fine, just keep clicking Next
3. In Command Prompt, confirm it worked:
   ```
   git --version
   ```

---

## PART 2 — Create your GitHub repository

1. Go to https://github.com and create a free account if you don't have one
2. Click the **+** icon (top right) → **New repository**
3. Name it: `repairiq`
4. Leave it set to **Public**
5. Do NOT check "Add a README" — leave everything else unchecked
6. Click **Create repository**
7. Copy the URL shown — it will look like: `https://github.com/YOURNAME/repairiq.git`

---

## PART 3 — Upload your project to GitHub

Open Command Prompt and run these commands one at a time.
Replace `YOUR-GITHUB-URL` with the URL you copied in step 2.

```
cd Desktop
mkdir repairiq-project
cd repairiq-project
```

Now copy the project files into this folder (see note below*), then run:

```
git init
git add .
git commit -m "Initial RepairIQ build"
git branch -M main
git remote add origin YOUR-GITHUB-URL
git push -u origin main
```

> *Copy all the files from the repairiq folder you downloaded from Claude into
> the `repairiq-project` folder on your Desktop before running the git commands.

---

## PART 4 — Deploy to Vercel (this makes it live on the internet)

1. Go to https://vercel.com
2. Click **Sign Up** → choose **Continue with GitHub** — this links your accounts
3. Click **Add New Project**
4. You'll see your `repairiq` repo listed — click **Import**
5. Vercel will auto-detect it's a React app — don't change any settings
6. Click **Deploy**
7. Wait about 60 seconds — Vercel will give you a live URL like:
   `https://repairiq-yourname.vercel.app`

**That's it — your app is live.**

---

## PART 5 — Making updates in the future

Whenever you want to update the app (add repairs, change prices, etc.):
1. Edit your files locally
2. Open Command Prompt in your project folder
3. Run:
   ```
   git add .
   git commit -m "describe what you changed"
   git push
   ```
4. Vercel automatically redeploys within ~30 seconds

---

## Troubleshooting

**"git is not recognized"** — Git didn't install correctly. Restart Command Prompt and try again.

**"npm not found"** — Node.js didn't install correctly. Re-run the Node.js installer.

**Vercel shows a build error** — Reply to Claude with the error message and it can be fixed.

**App deployed but looks broken** — Usually a missing file. Reply to Claude with the error.

---

## Your live URL
Once deployed, write it here so you don't lose it:

`https://______________________________`

---

*Built with RepairIQ v0.2 · Claude by Anthropic*
