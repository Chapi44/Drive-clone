# 🚀 Google Drive-like File Manager – Backend

This is the backend for a Google Drive-inspired file manager, providing secure file and folder management, user authentication, and RESTful APIs for a modern cloud storage experience.

---

## ✅ Core Features

- **User Authentication**
  - Sign up, log in, log out
  - JWT-based protected routes
- **File & Folder System**
  - Create folders, upload files to folders
  - View file/folder structure (tree or list)
- **File Management**
  - Rename, delete files and folders
  - Basic preview support (PDF, image, file info)
- **User-specific Storage**
  - Each user can only access their own files/folders

---

## 🛠️ Tech Stack

- **Node.js** + **Express.js**
- **TypeScript**
- **MongoDB** (with Mongoose)
- **JWT** for authentication
- **Multer** for file uploads
- **Docker** for local development
- **Jest** for testing

---

## ⚡ Getting Started

1. **Clone the repo**  
   `git clone <repo-url>`

2. **Install dependencies**  
   `npm install`

3. **Configure environment variables**  
   Copy `.env.example` to `.env` and fill in required values.


4. **Run locally (without Docker)**  
   - Start MongoDB locally
   - `npm run dev`



## 📁 Project Structure

- `src/api/` – API routes
- `src/controller/` – Controllers
- `src/dal/` – Data access layer
- `src/models/` – Mongoose models
- `src/uploads/` – Uploaded files (local dev)
- `src/middlewares/` – Auth, upload, validation

---

