# Aarogya Connect App Portal

This project consists of a React Native (Expo) mobile application for patient health records and a Node.js/Express backend.

## 🚀 Quick Start (For Developers/Users)

Since the backend is already deployed to the cloud, you only need to run the mobile app locally.

### 1. Prerequisites
- [Node.js](https://nodejs.org/) installed on your computer.
- **Expo Go** app installed on your phone (Android/iOS).

### 2. Setup & Run
1. Open the `aarogya-connect-app` folder in your terminal:
   ```bash
   cd aarogya-connect-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the app:
   ```bash
   npx expo start
   ```
4. A QR code will appear. Scan it with the **Expo Go** app on your phone.

---

## 🔐 Test Credentials
- **Username:** `demo`
- **Password:** `secret123`

---

## 🛠 Project Structure
- **`aarogya-connect-app/`**: Frontend mobile application (React Native / Expo).
  - Already configured to connect to the live backend: `https://aarogya-backend-4amu.onrender.com`
- **`backend/`**: Node.js & Express server.
  - Deployed on Render.
  - Connected to MongoDB Atlas.

## 📦 Sharing this Project
To share this with others:
1. Zip the entire project folder (excluding `node_modules` folders if you want a smaller file, but `npm install` brings them back).
2. Tell them to follow the **Setup & Run** steps above.
