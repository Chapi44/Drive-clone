# 🚀 Google Drive-like File Manager

A full-stack Google Drive-inspired file manager, featuring secure user authentication, file and folder management, and a modern, responsive UI. Built with Node.js/Express (backend) and React/TypeScript (frontend).

---

## ✅ Core Features

- **User Authentication**
  - Sign up, log in, log out
  - Protected routes (JWT)
- **File & Folder System**
  - Create folders, upload files (max 5 at a time)
  - View file/folder structure (tree, list, grid)
  - Breadcrumb and tree navigation
- **File Management**
  - Rename, delete, star/unstar files and folders
  - Basic preview (PDF, image, file info)
- **User-specific Storage**
  - Each user can only access their own files/folders
- **Responsive UI**
  - Mobile & desktop friendly
  - Skeleton loaders, error handling, instant UI updates

---

## 🛠️ Tech Stack

### Backend
- Node.js + Express.js
- TypeScript
- MongoDB (Mongoose)
- JWT for authentication
- Multer for file uploads
- Docker & docker-compose
- Vault (for secrets, dev)
- Redis (optional)
- Prisma (for some DB ops)
- Jest (testing)

### Frontend
- React 19 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Zustand (state management)
- React Router v7
- React Hook Form + Zod (validation)
- Axios (API calls)
- Lucide React (icons)
- React Dropzone (file uploads)
- React Toastify (notifications)

---

## ⚡ Getting Started

### Backend
1. `cd backend`
2. `npm install`
3. Configure `.env` (see `.env.example`)
4. `run MongoDB locally and npm run dev`

### Frontend
1. `cd frontend`
2. `npm install`
3. Edit `src/constants/config.ts` to set API endpoint
4. `npm run dev`

---

## 📁 Project Structure

- `backend/` – Node.js/Express API, MongoDB, file uploads
- `frontend/` – React app, UI, state management

### Frontend Highlights
- `src/components/` – UI components
- `src/pages/` – Route pages
- `src/services/` – API services
- `src/store/` – Zustand stores
- `src/hooks/` – Custom hooks
- `src/utils/` – Helpers and validators

### Backend Highlights
- `src/api/` – API routes
- `src/controller/` – Controllers
- `src/dal/` – Data access layer
- `src/models/` – Mongoose models
- `src/uploads/` – Uploaded files (local dev)
- `src/middlewares/` – Auth, upload, validation

---



