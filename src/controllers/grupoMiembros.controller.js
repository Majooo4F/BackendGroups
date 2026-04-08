import supabase from "../config/supabase.js"

// 🔹 AGREGAR USUARIO A GRUPO
export const addUsuarioGrupo = async (req, res) => {
  try {
    const { grupo_id, usuario_id } = req.body

    if (!grupo_id || !usuario_id) {
      return res.status(400).json({
        message: "grupo_id y usuario_id son obligatorios"
      })
    }

    const { data, error } = await supabase
      .from("grupo_miembros")
      .insert([{ grupo_id, usuario_id }])
      .select()

    if (error) return res.status(500).json({ message: error.message })

    res.json({
      message: "Usuario agregado al grupo",
      data
    })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}


// 🔹 VER MIEMBROS
export const getMiembrosGrupo = async (req, res) => {
  try {
    const { grupo_id } = req.params

    const { data, error } = await supabase
      .from("grupo_miembros")
      .select(`
  grupo_id,
  usuario_id,
  usuarios(nombre_completo, username, email)
`)
      .eq("grupo_id", grupo_id)

    if (error) return res.status(500).json({ message: error.message })

    res.json(data)

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}