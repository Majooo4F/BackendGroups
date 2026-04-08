import supabase from "../config/supabase.js"

// 🔹 ASIGNAR PERMISO
export const asignarPermisoAGrupo = async (req, res) => {
  try {
    const { grupoId } = req.params
    const { usuario_id, permiso_id } = req.body

    // 🔹 Validar datos obligatorios
    if (!usuario_id || !permiso_id) {
      return res.status(400).json({
        message: "usuario_id y permiso_id son obligatorios"
      })
    }

    // 🔹 🚫 BLOQUEAR PERMISOS DE ADMIN
    if ([6, 11, 18].includes(permiso_id)) {
      return res.status(403).json({
        message: "No puedes asignar permisos de administrador"
      })
    }

    // 🔹 Validar que el usuario pertenezca al grupo
    const { data: miembro, error: errorMiembro } = await supabase
      .from("grupo_miembros")
      .select("*")
      .eq("grupo_id", grupoId)
      .eq("usuario_id", usuario_id)
      .single()

    if (errorMiembro || !miembro) {
      return res.status(400).json({
        message: "El usuario no pertenece al grupo"
      })
    }

    // 🔹 VALIDAR SI YA EXISTE EL PERMISO (🔥 NUEVO)
    const { data: existe } = await supabase
      .from("grupo_usuario_permisos")
      .select("*")
      .eq("grupo_id", grupoId)
      .eq("usuario_id", usuario_id)
      .eq("permiso_id", permiso_id)
      .maybeSingle()

    if (existe) {
      return res.status(400).json({
        message: "El usuario ya tiene este permiso en el grupo"
      })
    }

    // 🔹 Insertar permiso
    const { data, error } = await supabase
      .from("grupo_usuario_permisos")
      .insert([{
        grupo_id: grupoId,
        usuario_id,
        permiso_id
      }])
      .select()

    if (error) {
      return res.status(500).json({
        message: error.message
      })
    }

    res.json({
      message: "Permiso asignado",
      data
    })

  } catch (err) {
    res.status(500).json({
      message: err.message
    })
  }
}


// 🔹 ELIMINAR PERMISO
export const quitarPermisoDeGrupo = async (req, res) => {
  try {
    const { grupoId, permisoId } = req.params

    const { error } = await supabase
      .from("grupo_usuario_permisos")
      .delete()
      .eq("grupo_id", grupoId)
      .eq("permiso_id", permisoId)

    if (error) return res.status(500).json({ message: error.message })

    res.json({ message: "Permiso eliminado" })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}


// 🔹 LISTAR PERMISOS
export const listarPermisosDeGrupo = async (req, res) => {
  try {
    const { grupoId } = req.params

    const { data, error } = await supabase
      .from("grupo_usuario_permisos")
      .select("*")
      .eq("grupo_id", grupoId)

    if (error) return res.status(500).json({ message: error.message })

    res.json(data)

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}