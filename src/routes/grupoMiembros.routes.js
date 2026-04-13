import { Router } from "express"

import {
  addUsuarioGrupo,
  getMiembrosGrupo,
    getGruposUsuario,
     removeUsuarioGrupo 
} from "../controllers/grupoMiembros.controller.js"

const router = Router()

router.post("/", addUsuarioGrupo)
router.get("/usuario/:usuario_id", getGruposUsuario)  // ← primero lo específico
router.get("/:grupo_id", getMiembrosGrupo) 
router.delete("/:grupo_id/usuario/:usuario_id", removeUsuarioGrupo)

export default router