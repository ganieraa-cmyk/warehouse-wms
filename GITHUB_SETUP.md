# 🚀 GitHub Pages Deployment Guide

## Step 1 — GitHub Account

Go to https://github.com → Sign up (free)

---

## Step 2 — Create Repository

1. Click **"New"** (green button, top left)
2. Repository name: `warehouse-wms`
3. Set to **Public**
4. ❌ Don't tick "Add README"
5. Click **"Create repository"**

---

## Step 3 — Upload Files

### Option A — Drag & Drop (Easiest, no Git needed)

1. Open your new repo page
2. Click **"uploading an existing file"** link
3. Drag the entire `warehouse-app` folder contents:
   - `index.html`
   - `css/` folder
   - `js/` folder
   - `.nojekyll`
4. Scroll down → Click **"Commit changes"**

### Option B — Git Commands (Terminal)

```bash
# Install Git if not installed:
# Windows → https://git-scm.com/download/win
# Mac → brew install git
# Ubuntu → sudo apt install git

cd warehouse-app

git init
git add .
git commit -m "Initial warehouse WMS deploy"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/warehouse-wms.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

---

## Step 4 — Enable GitHub Pages

1. Go to your repo → **Settings** tab
2. Left sidebar → **Pages**
3. Under "Branch" → select **main** → folder **/ (root)**
4. Click **Save**
5. Wait 1–2 minutes

Your live URL will be:
```
https://YOUR_USERNAME.github.io/warehouse-wms
```

---

## Step 5 — Firebase Setup (Multi-device sync)

1. Go to https://console.firebase.google.com
2. Create project → `warehouse-wms`
3. Firestore Database → Create → **Test mode** → `asia-south1`
4. Project Settings → Web app → Register → Copy config
5. Open `js/firebase.js` → paste your config:

```js
const FIREBASE_CONFIG = {
  apiKey            : "AIzaSy...",
  authDomain        : "warehouse-wms.firebaseapp.com",
  projectId         : "warehouse-wms",
  storageBucket     : "warehouse-wms.appspot.com",
  messagingSenderId : "123456789",
  appId             : "1:123:web:abc"
};
```

6. Re-upload `js/firebase.js` to GitHub (drag & drop again)
7. Done — all devices sync in real-time!

---

## Updating Files Later

### Via GitHub website (easiest):
1. Go to the file in your repo (e.g. `js/firebase.js`)
2. Click the ✏️ pencil icon (Edit)
3. Make changes → **Commit changes**
4. Live in ~30 seconds

### Via Git:
```bash
git add .
git commit -m "Update firebase config"
git push
```

---

## Summary

| Task | Where |
|---|---|
| App URL | `https://YOUR_USERNAME.github.io/warehouse-wms` |
| Edit files | GitHub website or Git |
| Firebase config | `js/firebase.js` |
| Hosting cost | ₹0 forever |
| Storage (Firebase) | Free up to 1GB |

