import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import gruposRoutes from "./routes/grupos.routes.js";
import grupoMiembrosRoutes from "./routes/grupoMiembros.routes.js";
import grupoPermisosRoutes from "./routes/grupoPermisos.routes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/groups", gruposRoutes);
app.use("/groups/miembros", grupoMiembrosRoutes);
app.use("/groups", grupoPermisosRoutes); // /:grupoId/permisos ya viene en la ruta

app.get("/", (req, res) => res.json({ message: "Groups Service funcionando 🚀" }));

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Groups Service corriendo en puerto ${PORT}`));