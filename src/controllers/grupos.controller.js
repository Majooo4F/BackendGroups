import supabase from "../config/supabase.js"
import validateGrupo from "../schemas/grupo.schema.js"

// 🔹 CREAR
export const createGrupo = async (req, res) => {
  try {
    const valid = validateGrupo(req.body)

    if (!valid) {
      return res.status(400).json({
        message: "Datos inválidos",
        errors: validateGrupo.errors
      })
    }

    const { nombre, descripcion } = req.body

    const { data, error } = await supabase
      .from("grupos")
      .insert([{
        nombre,
        descripcion,
        creador_id: req.user.id,
        creado_en: new Date()
      }])
      .select()
      .single()

    if (error) return res.status(500).json({ message: error.message })

    res.status(201).json({
      message: "Grupo creado",
      grupo: data
    })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}


// 🔹 GET
export const getGrupos = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("grupos")
      .select("*")

    if (error) return res.status(500).json({ message: error.message })

    res.json(data)

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}


// 🔹 UPDATE
export const updateGrupo = async (req, res) => {
  try {
    const { id } = req.params

    const valid = validateGrupo(req.body)

    if (!valid) {
      return res.status(400).json({
        message: "Datos inválidos",
        errors: validateGrupo.errors
      })
    }

    const { nombre, descripcion } = req.body

    const { data, error } = await supabase
      .from("grupos")
      .update({ nombre, descripcion })
      .eq("id", id)
      .select()
      .single()

    if (error) return res.status(500).json({ message: error.message })

    if (!data) {
      return res.status(404).json({ message: "Grupo no encontrado" })
    }

    res.json({
      message: "Grupo actualizado",
      grupo: data
    })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}


// 🔹 DELETE
export const deleteGrupo = async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from("grupos")
      .delete()
      .eq("id", id)

    if (error) return res.status(500).json({ message: error.message })

    res.json({ message: "Grupo eliminado" })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}