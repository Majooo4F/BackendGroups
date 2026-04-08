import { Router } from "express"
import {
  addUsuarioGrupo,
  getMiembrosGrupo
} from "../controllers/grupoMiembros.controller.js"

import { verifyToken } from "../middlewares/auth.middleware.js"
import { isAdmin } from "../middlewares/admin.middleware.js"

const router = Router()

router.post("/", verifyToken, isAdmin, addUsuarioGrupo)
router.get("/:grupo_id", verifyToken, isAdmin, getMiembrosGrupo)

export default router