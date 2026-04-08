import express from "express"
import { verifyToken } from "../middlewares/auth.middleware.js"
import {
  asignarPermisoAGrupo,
  quitarPermisoDeGrupo,
  listarPermisosDeGrupo
} from "../controllers/GrupoPermisosController.js"
import { isAdmin } from "../middlewares/admin.middleware.js"

const router = express.Router()

// 🔹 asignar permiso a usuario en grupo
router.post("/:grupoId/permisos", verifyToken, isAdmin, asignarPermisoAGrupo)

// 🔹 ver permisos de un grupo
router.get("/:grupoId/permisos", verifyToken, isAdmin, listarPermisosDeGrupo)

// 🔹 eliminar permiso
router.delete("/:grupoId/usuario/:usuarioId/permiso/:permisoId", verifyToken, isAdmin, quitarPermisoDeGrupo)

export default router