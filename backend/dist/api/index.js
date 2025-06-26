"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = initRoutes;
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const files_routes_1 = __importDefault(require("./routes/files.routes"));
const folders_routes_1 = __importDefault(require("./routes/folders.routes"));
function initRoutes(app) {
    app.use("/v1.0/drive/auth/", auth_routes_1.default);
    app.use("/v1.0/drive/files/", files_routes_1.default);
    app.use("/v1.0/drive/folders/", folders_routes_1.default);
}
