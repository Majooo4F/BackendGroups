import express from "express"

import {
  asignarPermisoAGrupo,
  quitarPermisoDeGrupo,
  listarPermisosDeGrupo,
  getPermisosPorUsuario,
  quitarTodosLosPermisosDeUsuario
} from "../controllers/GrupoPermisos.controller.js"

const router = express.Router()
router.get("/permisos-usuario/:usuarioId", getPermisosPorUsuario)
router.post("/:grupoId/permisos", asignarPermisoAGrupo)

router.get("/:grupoId/permisos", listarPermisosDeGrupo)

router.delete("/:grupoId/usuario/:usuarioId/permiso/:permisoId", quitarPermisoDeGrupo)
router.delete("/:grupoId/usuario/:usuarioId/permisos", quitarTodosLosPermisosDeUsuario)



export default router