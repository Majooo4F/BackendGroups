import supabase from "../config/supabase.js"
import { sendResponse } from "../helpers/response.js"

export const getCatalogoPermisos = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("permisos")
      .select("id, nombre, descripcion")
      .order("id", { ascending: true })

    if (error) return sendResponse(res, { statusCode: 500, intOpCode: "SxPR500", data: { message: error.message } })

    return sendResponse(res, { statusCode: 200, intOpCode: "SxPR200", data })
  } catch (err) {
    return sendResponse(res, { statusCode: 500, intOpCode: "SxPR500", data: { message: err.message } })
  }
}

export const getPermisosPorUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params
    const soloActivos = req.query.activo !== "false"   // default: solo activos

    let query = supabase
      .from("grupo_usuario_permisos")
      .select(`*, permisos(nombre, descripcion)`)
      .eq("usuario_id", usuarioId)

    if (soloActivos) query = query.eq("activo", true)

    const { data, error } = await query

    if (error) return sendResponse(res, { statusCode: 500, intOpCode: "SxGR500", data: { message: error.message } })

    return sendResponse(res, { statusCode: 200, intOpCode: "SxGR200", data })

  } catch (err) {
    return sendResponse(res, { statusCode: 500, intOpCode: "SxGR500", data: { message: err.message } })
  }
}

// 🔹 GET PERMISOS DE UN USUARIO EN UN GRUPO ESPECÍFICO (para cambio de contexto)
export const getPermisosPorUsuarioEnGrupo = async (req, res) => {
  try {
    const { grupoId, usuarioId } = req.params

    const { data, error } = await supabase
      .from("grupo_usuario_permisos")
      .select(`permiso_id, activo, concedido_en, permisos(nombre, descripcion)`)
      .eq("grupo_id",   Number(grupoId))
      .eq("usuario_id", Number(usuarioId))
      .eq("activo", true)

    if (error) return sendResponse(res, { statusCode: 500, intOpCode: "SxGR500", data: { message: error.message } })

    return sendResponse(res, { statusCode: 200, intOpCode: "SxGR200", data })

  } catch (err) {
    return sendResponse(res, { statusCode: 500, intOpCode: "SxGR500", data: { message: err.message } })
  }
}



// 🔹 ASIGNAR PERMISO A USUARIO EN UN GRUPO
export const asignarPermisoAGrupo = async (req, res) => {
  try {
    const { grupoId } = req.params
    const { usuario_id, permiso_id } = req.body
    const concedido_por = req.user?.id ?? null   // inyectado por verifyToken

    if (!usuario_id || !permiso_id) {
      return sendResponse(res, { statusCode: 400, intOpCode: "SxGR400", data: { message: "usuario_id y permiso_id son obligatorios" } })
    }

    const { data: permisoRow, error: permisoErr } = await supabase
      .from("permisos")
      .select("nombre")
      .eq("id", permiso_id)
      .maybeSingle()

    if (permisoErr) {
      return sendResponse(res, { statusCode: 500, intOpCode: "SxGR500", data: { message: "Error validando permiso: " + permisoErr.message } })
    }

    const nombrePermiso = permisoRow?.nombre ?? null
    const permisosNoAsignables = new Set([
      "admin",
      "user:manage",
      "group:manage",
      "ticket:manage",
      "usuario:admin"
    ])

    if (nombrePermiso && permisosNoAsignables.has(nombrePermiso)) {
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

    // Verificar si ya tiene el permiso (activo o inactivo)
    const { data: existe } = await supabase
      .from("grupo_usuario_permisos")
      .select("activo")
      .eq("grupo_id", grupoId)
      .eq("usuario_id", usuario_id)
      .eq("permiso_id", permiso_id)
      .maybeSingle()

    if (existe) {
      if (existe.activo) {
        // Ya tiene el permiso activo — no duplicar
        return sendResponse(res, { statusCode: 200, intOpCode: "SxGR200", data: { message: "El usuario ya tiene este permiso activo" } })
      }
      // Estaba inactivo — reactivar en lugar de insertar
      const { data: reactivado, error: errReact } = await supabase
        .from("grupo_usuario_permisos")
        .update({ activo: true, concedido_por, concedido_en: new Date().toISOString(), razon: null })
        .eq("grupo_id", grupoId)
        .eq("usuario_id", usuario_id)
        .eq("permiso_id", permiso_id)
        .select()

      if (errReact) return sendResponse(res, { statusCode: 500, intOpCode: "SxGR500", data: { message: errReact.message } })

      return sendResponse(res, { statusCode: 200, intOpCode: "SxGR200", data: { message: "Permiso reactivado", permiso: reactivado } })
    }

    // Insertar nuevo registro CON metadatos
    const { data, error } = await supabase
      .from("grupo_usuario_permisos")
      .insert([{
        grupo_id: grupoId,
        usuario_id,
        permiso_id,
        activo: true,
        concedido_por,
        concedido_en: new Date().toISOString()
      }])
      .select()

    if (error) return sendResponse(res, { statusCode: 500, intOpCode: "SxGR500", data: { message: error.message } })

    return sendResponse(res, { statusCode: 201, intOpCode: "SxGR201", data: { message: "Permiso asignado", permiso: data } })

  } catch (err) {
    return sendResponse(res, { statusCode: 500, intOpCode: "SxGR500", data: { message: err.message } })
  }
}

// 🔹 SUSPENDER (desactivar) un permiso sin eliminarlo — mantiene auditoría
export const suspenderPermisoDeGrupo = async (req, res) => {
  try {
    const { grupoId, usuarioId, permisoId } = req.params
    const { razon } = req.body

    const { data, error } = await supabase
      .from("grupo_usuario_permisos")
      .update({ activo: false, razon: razon ?? "Sin motivo especificado" })
      .eq("grupo_id", grupoId)
      .eq("usuario_id", usuarioId)
      .eq("permiso_id", permisoId)
      .select()

    if (error) return sendResponse(res, { statusCode: 500, intOpCode: "SxGR500", data: { message: error.message } })

    return sendResponse(res, { statusCode: 200, intOpCode: "SxGR200", data: { message: "Permiso suspendido", permiso: data } })

  } catch (err) {
    return sendResponse(res, { statusCode: 500, intOpCode: "SxGR500", data: { message: err.message } })
  }
}

// 🔹 ELIMINAR PERMANENTEMENTE todos los permisos de un usuario en el grupo
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

// 🔹 ELIMINAR PERMANENTEMENTE un permiso específico
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

// 🔹 LISTAR todos los permisos de un grupo (con metadata)
export const listarPermisosDeGrupo = async (req, res) => {
  try {
    const { grupoId } = req.params
    const soloActivos = req.query.activo !== "false"

    let query = supabase
      .from("grupo_usuario_permisos")
      .select(`
        grupo_id,
        usuario_id,
        permiso_id,
        activo,
        concedido_en,
        razon,
        permisos(nombre, descripcion),
        otorgante:concedido_por(id, nombre_completo)
      `)
      .eq("grupo_id", grupoId)

    if (soloActivos) query = query.eq("activo", true)

    const { data, error } = await query

    if (error) return sendResponse(res, { statusCode: 500, intOpCode: "SxGR500", data: { message: error.message } })

    return sendResponse(res, { statusCode: 200, intOpCode: "SxGR200", data })

  } catch (err) {
    return sendResponse(res, { statusCode: 500, intOpCode: "SxGR500", data: { message: err.message } })
  }
}

