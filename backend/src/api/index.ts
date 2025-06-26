import { type Express } from 'express';
import authRoutes from './routes/auth.routes'
import fileRoutes from './routes/files.routes';
import folderRoutes from './routes/folders.routes';     
export default function initRoutes(app: Express): void {
    app.use("/v1.0/drive/auth/", authRoutes);
    app.use("/v1.0/drive/files/", fileRoutes);
    app.use("/v1.0/drive/folders/", folderRoutes);
}
