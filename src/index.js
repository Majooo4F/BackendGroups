import express from "express"
import cors from "cors"
import dotenv from "dotenv"

import gruposRoutes from "./routes/grupos.routes.js"
import grupoMiembrosRoutes from "./routes/grupoMiembros.routes.js"
import grupoPermisosRoutes from "./routes/grupoPermisos.routes.js"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.use("/grupos", gruposRoutes)
app.use("/grupo-miembros", grupoMiembrosRoutes)
app.use("/grupo-permisos", grupoPermisosRoutes)

app.get("/", (req, res) => {
  res.json({ message: "Microservicio grupos funcionando 🚀" })
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`)
})