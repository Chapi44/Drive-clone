# 🚀 Google Drive-like File Manager – Frontend

A modern, responsive React + TypeScript frontend for a Google Drive-inspired file manager. Connects to the backend for secure file and folder management.

---

## ✅ Core Features

- **User Authentication**
  - Sign up, log in, log out
  - Protected dashboard routes
- **File & Folder System**
  - Create folders, upload files (max 5 at a time)
  - View files/folders in grid or list
  - Tree and breadcrumb navigation
- **File Management**
  - Rename, delete, star/unstar files and folders
  - Basic preview (PDF, image, file info)
- **User-specific Storage**
  - Only see your own files/folders
- **Responsive UI**
  - Mobile & desktop friendly
  - Sidebar with burger menu on mobile
- **Modern UX**
  - Skeleton loaders, error handling, instant UI updates

---

## 🛠️ Tech Stack

- **React 19** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS** (styling)
- **Zustand** (state management)
- **React Router v7**
- **React Hook Form** + **Zod** (validation)
- **Axios** (API calls)
- **Lucide React** (icons)
- **React Dropzone** (file uploads)
- **React Toastify** (notifications)

---

## ⚡ Getting Started

1. **Install dependencies**  
   `npm install`

2. **Configure API endpoint**  
   Edit `src/constants/config.ts` to point to your backend.

3. **Run the app**  
   `npm run dev`



## 📁 Project Structure

- `src/components/` – UI components
- `src/pages/` – Route pages
- `src/services/` – API services
- `src/store/` – Zustand stores
- `src/hooks/` – Custom hooks
- `src/utils/` – Helpers and validators

---


