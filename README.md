# ✨ CollabFlow

![CollabFlow Banner](https://via.placeholder.com/1200x400/080812/ec4899?text=CollabFlow+-+The+Ultimate+Vibe+Station)

**CollabFlow** is a modern, real-time collaborative document editor designed with a stunning "Gen Z / Cyber-Glass" aesthetic. It features rich-text editing, role-based access control (RBAC), live activity feeds, and AI-powered proofreading.

## 📸 Screenshots

| Dashboard | Document Editor |
| :---: | :---: |
| ![Dashboard Screenshot](https://via.placeholder.com/600x350/080812/22d3ee?text=Dashboard+Screenshot+Here) | ![Editor Screenshot](https://via.placeholder.com/600x350/080812/10b981?text=Editor+Screenshot+Here) |

| Login / Auth | Member Management |
| :---: | :---: |
| ![Login Screenshot](https://via.placeholder.com/600x350/080812/a855f7?text=Login+Screenshot+Here) | ![Members Screenshot](https://via.placeholder.com/600x350/080812/f59e0b?text=Members+Screenshot+Here) |

*(Replace the placeholder URLs above with your actual screenshot image links once deployed!)*

---

## 🚀 Features

- **Real-Time Collaboration:** Instantly see updates and edits as they happen.
- **Role-Based Access Control (RBAC):** Manage permissions with `Owner`, `Editor`, and `Viewer` roles.
- **AI Proofreading:** Built-in Gemini AI to correct spelling, grammar, and even upgrade vocabulary to "Gen Z slang".
- **Dynamic Themes:** Cyber Glass, Midnight Blue, Emerald Dark, and Solar Flare.
- **Activity Feed:** Track document creation, edits, and team member changes.
- **Secure Authentication:** JWT-based login and registration with bcrypt password hashing.
- **Production-Ready Security:** Stored XSS prevention (DOMPurify), Rate Limiting, and strict CORS policies.

---

## 🛠️ Tech Stack

### Frontend (`/client`)
- **Framework:** React + Vite
- **Styling:** Custom CSS (Glassmorphism, Animations)
- **State Management:** Zustand
- **Rich Text Editor:** Tiptap
- **Icons:** Lucide React

### Backend (`/server`)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas + Mongoose
- **Authentication:** JSON Web Tokens (JWT)
- **AI Integration:** Google Gemini API (`@google/genai`)

---

## 💻 Local Development Setup

To run this project locally, you will need **Node.js** and a **MongoDB** database.

### 1. Clone the repository
```bash
git clone https://github.com/Arisha18-glitch/collabflow-app.git
cd collabflow-app
```

### 2. Setup the Backend
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory and add your secrets:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_google_gemini_key
```
Start the backend server:
```bash
npm run dev
```

### 3. Setup the Frontend
Open a new terminal window:
```bash
cd client
npm install
```
Start the frontend development server:
```bash
npm run dev
```

The app will now be running on `http://localhost:5173`!

---

## 🌐 Deployment

- **Frontend:** Hosted on [Vercel](https://vercel.com/)
- **Backend:** Hosted on [Render](https://render.com/)
- **Database:** [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

---
*Built with 💻 and ✨*
