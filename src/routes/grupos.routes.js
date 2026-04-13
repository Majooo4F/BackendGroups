import express from "express"

import {
  createGrupo,
  getGrupos,
  updateGrupo,
  deleteGrupo
} from "../controllers/grupos.controller.js"

const router = express.Router()

router.get("/", getGrupos)
router.post("/", createGrupo)
router.put("/:id", updateGrupo)
router.delete("/:id", deleteGrupo)


export default router