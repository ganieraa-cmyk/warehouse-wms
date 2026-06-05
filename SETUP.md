# WMS — Multi-Device Cloud Setup Guide

## Step 1: Create Firebase Project (Free)

1. Go to → https://console.firebase.google.com
2. Click **"Add project"**
3. Name it: `warehouse-wms` → Continue → Create project

---

## Step 2: Create Firestore Database

1. In Firebase console → left menu → **Firestore Database**
2. Click **"Create database"**
3. Choose **"Start in test mode"** → Next
4. Pick any location (e.g. `asia-south1` for India) → Done

---

## Step 3: Get Your Config

1. In Firebase console → ⚙️ **Project Settings** (gear icon top left)
2. Scroll down → **"Your apps"** section
3. Click **"</> Web"** icon → Register app
4. Name it: `warehouse-web` → Register
5. You will see a config block like:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "warehouse-wms.firebaseapp.com",
  projectId: "warehouse-wms",
  storageBucket: "warehouse-wms.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## Step 4: Paste Config into App

Open `js/firebase.js` and replace the FIREBASE_CONFIG block:

```js
const FIREBASE_CONFIG = {
  apiKey            : "AIzaSy...",         // ← paste yours
  authDomain        : "warehouse-wms...",  // ← paste yours
  projectId         : "warehouse-wms",     // ← paste yours
  storageBucket     : "warehouse-wms...",  // ← paste yours
  messagingSenderId : "123456789",         // ← paste yours
  appId             : "1:123...:web:..."   // ← paste yours
};
```

---

## Step 5: Deploy to Netlify (Free Hosting)

1. Go to → https://netlify.com → Sign up free
2. Go to → https://app.netlify.com/drop
3. **Drag & drop** the `warehouse-app` folder
4. Done! You get a live URL instantly

Share that URL with all devices — everyone sees same live data!

---

## How It Works After Setup

| Action | What happens |
|---|---|
| Putaway / Pick | Saves to Firestore instantly |
| Another device opens | Loads latest data from cloud |
| Data changes on Device A | Device B updates in real-time |
| Internet goes down | Shows warning, still works locally |

---

## Firestore Free Limits (more than enough)

| Limit | Free tier |
|---|---|
| Reads | 50,000 / day |
| Writes | 20,000 / day |
| Storage | 1 GB |
| Cost | ₹0 |

---

## File Structure

```
warehouse-app/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── state.js      ← in-memory data
│   ├── ui.js         ← rendering
│   ├── export.js     ← Excel export
│   ├── firebase.js   ← Cloud sync ← EDIT THIS FILE
│   └── app.js        ← event wiring
├── README.md
└── SETUP.md          ← this file
```
