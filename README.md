# AarogyaConnect 🏥

**Connecting Rural Patients to Specialized Healthcare.**

AarogyaConnect is a **hybrid telemedicine platform** designed to bridge the gap between rural villages and urban specialists. It is engineered with an **"Offline-First"** architecture to operate reliably in low-connectivity environments (2G/Edge).

---

## 🚀 Key Features (USP)

### 1. 📶 **Offline-First Resilience**
*   **Store-and-Forward:** If the internet fails, data (forms, photos, videos) is safely queued in the device's encrypted storage.
*   **Auto-Sync:** As soon as connectivity is restored, the `SyncManager` automatically uploads pending records without user intervention.
*   **3G Optimized:** Persistent retry logic handles flaky connections without data loss.

### 2. ⚡ **Secure Direct-Upload**
*   **Zero Server Load:** Heavy medical files (X-Ray, MRI) are uploaded **directly** from the App to Cloudinary.
*   **Signed Security:** Uploads are authorized via a time-limited cryptographic signature from the backend, ensuring no unauthorized access.

### 3. 🛡️ **Hybrid Security**
*   **Opaque Session Tokens:** We use centralized session management ("Kill Switch" enabled) instead of stateless JWTs for instant revocation capability in case of device theft.

### 4. 🚑 **Doctor Portal Loop**
*   **Seamless Flow:** Asha workers upload data -> Backend notifies Doctor -> Doctor views high-res media -> Doctor writes prescription -> App downloads prescription.

---

## 🛠️ Technology Stack

| Component | Tech | Language |
| :--- | :--- | :--- |
| **Mobile App** | **React Native (Expo)** | TypeScript (`.tsx`) |
| **Backend API** | **Node.js + Express** | JavaScript (`.js`) |
| **Database** | **MongoDB Atlas** | NoSQL |
| **Media Cloud** | **Cloudinary** | CDN |
| **Hosting** | **Vercel** (Serverless) | - |

---

## 🏃 Quick Start Guide

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18+)
*   **Expo Go** App on your generic Android/iOS device.

### 1. Clone & Install
```bash
git clone https://github.com/your-repo/aarogya-connect-app.git
cd aarogya-connect-app
npm install
```

### 2. Run the App
```bash
npx expo start
*   Scan the QR code with your phone.
*   **Note:** The app is already configured to talk to the Production Backend (`processed-backend.vercel.app`).

### 3. Test Credentials
*   **Username :** `demo`
*   **Password:** `secret123`

---

##  Project Structure

*   **`app/`**: The React Native Codebase.
    *   `services/SyncManager.ts`: The brain of the offline logic.
    *   `components/ChatbotForm.tsx`: The main intake form.
*   **`backend/`**: The Node.js Server Code.
    *   `src/controllers/`: Business logic.
    *   `src/models/`: MongoDB Schemas.
