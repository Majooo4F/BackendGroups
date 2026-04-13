import supabase from "../config/supabase.js"
import { sendResponse } from "../helpers/response.js"

export const getPermisosPorUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params

    const { data, error } = await supabase
      .from("grupo_usuario_permisos")
      .select(`*, permisos(nombre)`)
      .eq("usuario_id", usuarioId)

    if (error) return sendResponse(res, { statusCode: 500, intOpCode: "SxGR500", data: { message: error.message } })

    return sendResponse(res, { statusCode: 200, intOpCode: "SxGR200", data })

  } catch (err) {
    return sendResponse(res, { statusCode: 500, intOpCode: "SxGR500", data: { message: err.message } })
  }
}

export const asignarPermisoAGrupo = async (req, res) => {
  try {
    const { grupoId } = req.params
    const { usuario_id, permiso_id } = req.body

    if (!usuario_id || !permiso_id) {
      return sendResponse(res, { statusCode: 400, intOpCode: "SxGR400", data: { message: "usuario_id y permiso_id son obligatorios" } })
    }

    if ([6, 11, 18].includes(permiso_id)) {
      return sendResponse(res, { statusCode: 403, intOpCode: "SxGR403", data: { message: "No puedes asignar permisos de administrador" } })
    }

    // Auto-agregar al grupo si no es miembro
    const { data: miembro } = await supabase
      .from("grupo_miembros")
      .select("*")
      .eq("grupo_id", grupoId)
      .eq("usuario_id", usuario_id)
      .maybeSingle()

    if (!miembro) {
      const { error: errorInsert } = await supabase
        .from("grupo_miembros")
        .insert([{ grupo_id: grupoId, usuario_id }])

      if (errorInsert) {
        return sendResponse(res, { statusCode: 500, intOpCode: "SxGR500", data: { message: "No se pudo agregar el usuario al grupo: " + errorInsert.message } })
      }
    }

    // Verificar si ya tiene el permiso
    // Verificar si ya tiene el permiso
const { data: existe } = await supabase
  .from("grupo_usuario_permisos")
  .select("*")
  .eq("grupo_id", grupoId)
  .eq("usuario_id", usuario_id)
  .eq("permiso_id", permiso_id)
  .maybeSingle()

if (existe) {
  // ya tiene el permiso — no es error, simplemente retornar ok
  return sendResponse(res, { statusCode: 200, intOpCode: "SxGR200", data: { message: "El usuario ya tiene este permiso" } })
}

    const { data, error } = await supabase
      .from("grupo_usuario_permisos")
      .insert([{ grupo_id: grupoId, usuario_id, permiso_id }])
      .select()

    if (error) return sendResponse(res, { statusCode: 500, intOpCode: "SxGR500", data: { message: error.message } })

    return sendResponse(res, { statusCode: 201, intOpCode: "SxGR201", data: { message: "Permiso asignado", permiso: data } })

  } catch (err) {
    return sendResponse(res, { statusCode: 500, intOpCode: "SxGR500", data: { message: err.message } })
  }
}

export const quitarTodosLosPermisosDeUsuario = async (req, res) => {
  try {
    const { grupoId, usuarioId } = req.params

    const { error } = await supabase
      .from("grupo_usuario_permisos")
      .delete()
      .eq("grupo_id", grupoId)
      .eq("usuario_id", usuarioId)

    if (error) return sendResponse(res, { statusCode: 500, intOpCode: "SxGR500", data: { message: error.message } })

    return sendResponse(res, { statusCode: 200, intOpCode: "SxGR200", data: { message: "Permisos eliminados" } })

  } catch (err) {
    return sendResponse(res, { statusCode: 500, intOpCode: "SxGR500", data: { message: err.message } })
  }
}

export const quitarPermisoDeGrupo = async (req, res) => {
  try {
    const { grupoId, usuarioId, permisoId } = req.params

    const { error } = await supabase
      .from("grupo_usuario_permisos")
      .delete()
      .eq("grupo_id", grupoId)
      .eq("usuario_id", usuarioId)
      .eq("permiso_id", permisoId)

    if (error) return sendResponse(res, { statusCode: 500, intOpCode: "SxGR500", data: { message: error.message } })

    return sendResponse(res, { statusCode: 200, intOpCode: "SxGR200", data: { message: "Permiso eliminado" } })

  } catch (err) {
    return sendResponse(res, { statusCode: 500, intOpCode: "SxGR500", data: { message: err.message } })
  }
}

export const listarPermisosDeGrupo = async (req, res) => {
  try {
    const { grupoId } = req.params

    const { data, error } = await supabase
      .from("grupo_usuario_permisos")
      .select("*")
      .eq("grupo_id", grupoId)

    if (error) return sendResponse(res, { statusCode: 500, intOpCode: "SxGR500", data: { message: error.message } })

    return sendResponse(res, { statusCode: 200, intOpCode: "SxGR200", data })

  } catch (err) {
    return sendResponse(res, { statusCode: 500, intOpCode: "SxGR500", data: { message: err.message } })
  }
}