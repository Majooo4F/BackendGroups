import express from "express"

import {
  asignarPermisoAGrupo,
  quitarPermisoDeGrupo,
  listarPermisosDeGrupo,
  getCatalogoPermisos,
  getPermisosPorUsuario,
  getPermisosPorUsuarioEnGrupo,
  quitarTodosLosPermisosDeUsuario,
  suspenderPermisoDeGrupo
} from "../controllers/grupoPermisos.controller.js"

const router = express.Router()
router.get("/permisos-catalogo", getCatalogoPermisos)
router.get("/permisos-usuario/:usuarioId", getPermisosPorUsuario)
router.post("/:grupoId/permisos", asignarPermisoAGrupo)

router.get("/:grupoId/permisos", listarPermisosDeGrupo)

router.get("/:grupoId/permisos/usuario/:usuarioId", getPermisosPorUsuarioEnGrupo)
router.delete("/:grupoId/usuario/:usuarioId/permiso/:permisoId", quitarPermisoDeGrupo)
router.delete("/:grupoId/usuario/:usuarioId/permisos", quitarTodosLosPermisosDeUsuario)
router.patch("/:grupoId/usuario/:usuarioId/permiso/:permisoId/suspender", suspenderPermisoDeGrupo)



export default router
