🛡️ Tourist Safety & Assistance App

A cross-platform React Native (Expo) mobile app that helps tourists stay safe by combining SOS alerts, geofencing, anomaly detection, offline-first sync, and a MongoDB backend used by both the mobile app and the web/admin dashboard to persist alerts, feedback and related data.

This README.md is ready to copy-paste into your repo. It includes full setup steps for both the mobile app and the backend (Express + MongoDB), data model examples, API reference, and the offline sync strategy.



What it does

Let users trigger SOS alerts (with location, optional media) from the mobile app.

Save alerts in MongoDB so both the mobile app and the web/admin dashboard can read/update them.

Work offline: store alerts locally and sync them to the server when online.

Support geospatial queries (nearby safety points, police, hospitals) using MongoDB geospatial indexes.

Provide a feedback loop (authorities can mark false positives / close alerts) and store that feedback in MongoDB.

Architecture
```
[Mobile App (Expo)]  <---->  [Express API Server]  <---->  [MongoDB (Atlas / self-hosted)]
        |                                  \
    (local DB/queue)                         \-> [Push/Notification service] -> [Authorities Dashboard]
```

Mobile app records alerts locally (SQLite/AsyncStorage) when offline and POSTs to Express API when network is available.

Express persists alerts to MongoDB into collections like alerts, users, safety_points, feedback.

MongoDB stores geospatial location fields and has 2dsphere indexes for proximity queries.

*Tech stack

Mobile: React Native (Expo)

Backend: Node.js + Express

Database: MongoDB (Atlas recommended)

Storage (mobile offline): SQLite (recommended) or AsyncStorage

Authentication: JWT (example) or OAuth

Notifications: FCM / Expo Push Notifications (optional)

*Features

One-tap SOS (with optional camera/audio recording)

Offline queue + reliable sync

Geofencing & “High Risk Zone” automatic triggers

Admin/authority feedback flow (false positive handling)

Persistent alert history in MongoDB for analytics & review

Geospatial queries for nearby safety points

*Prerequisites

Node.js (v18+ recommended)

npm or yarn

Expo CLI (npm install -g expo-cli)

MongoDB Atlas account (or local MongoDB)

(Optional) ngrok for local testing of webhooks/notifications

Quick start — full repo setup

Assume repo structure:
```
/server        -> Express backend
/mobile        -> Expo mobile app
/web-admin     -> optional admin dashboard
```
README.md

Backend (Express + MongoDB)
```cmd
cd server
```
Install:
```cmd
npm install
```

Create .env (example in Environment variables
).

Start dev server:
```cmd
npm run dev
# or
node dist/index.js  # after building

```
Example server start script in package.json:

"scripts": {
  "dev": "nodemon src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js"
}

Example Mongoose connection (src/db.ts)
// src/db.ts
import mongoose from "mongoose";

export async function connectDB(uri) {
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("MongoDB connected");
}

Mobile (Expo)
```cmd
cd mobile
```
Install:
```cmd
npm install
```

Set EXPO_PUBLIC_API_URL in .env (or use app.config.js to inject).

Start Expo:
```cmd
npx expo start

```
Use Expo Go / emulator to test.

Environment variables

Create .env (root of server + mobile where needed):
```cmd
# Server
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/tourist_app?retryWrites=true&w=majority
MONGO_DB_NAME=tourist_app
PORT=4000
JWT_SECRET=supersecretjwtkey
EXPO_PUBLIC_API_URL=https://your-backend.example.com
```
# Expo / mobile (public)
EXPO_PUBLIC_API_URL=https://your-backend.example.com

