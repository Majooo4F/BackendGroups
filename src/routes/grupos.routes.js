import express from "express"
import {
  createGrupo,
  getGrupos,
  updateGrupo,
  deleteGrupo
} from "../controllers/grupos.controller.js"

import { verifyToken } from "../middlewares/auth.middleware.js"
import { isAdmin } from "../middlewares/admin.middleware.js"

const router = express.Router()

router.get("/", verifyToken, getGrupos)
router.post("/", verifyToken, isAdmin, createGrupo)
router.put("/:id", verifyToken, isAdmin, updateGrupo)
router.delete("/:id", verifyToken, isAdmin, deleteGrupo)

export default router
