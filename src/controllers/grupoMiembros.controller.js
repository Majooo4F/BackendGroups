// grupoMiembros.controller.js
import supabase from "../config/supabase.js"
import { sendResponse } from "../helpers/response.js"



export const getGruposUsuario = async (req, res) => {

  try {

    const { usuario_id } = req.params



    const { data, error } = await supabase

      .from("grupo_miembros")

      .select(`

        grupo_id,

        grupos(id, nombre, descripcion)

      `)

      .eq("usuario_id", usuario_id)



    if (error) {

      return sendResponse(res, {

        statusCode: 500,

        intOpCode: "SxGR500",

        data: { message: error.message }

      })

    }



    const grupos = data?.map(m => m.grupos).filter(Boolean) || []



    return sendResponse(res, {

      statusCode: 200,

      intOpCode: "SxGR200",

      data: grupos

    })



  } catch (err) {

    return sendResponse(res, {

      statusCode: 500,

      intOpCode: "SxGR500",

      data: { message: err.message }

    })

  }

}
export const addUsuarioGrupo = async (req, res) => {
  try {
    const { grupo_id, usuario_id } = req.body

    if (!grupo_id || !usuario_id) {
      return sendResponse(res, {
        statusCode: 400,
        intOpCode: "SxGR400",
        data: { message: "grupo_id y usuario_id son obligatorios" }
      })
    }

    // ← verificar si ya es miembro antes de insertar
    const { data: existe } = await supabase
      .from("grupo_miembros")
      .select("*")
      .eq("grupo_id", grupo_id)
      .eq("usuario_id", usuario_id)
      .maybeSingle()

    if (existe) {
      return sendResponse(res, {
        statusCode: 400,
        intOpCode: "SxGR400",
        data: { message: "El usuario ya es miembro de este grupo" }
      })
    }

    const { data, error } = await supabase
      .from("grupo_miembros")
      .insert([{ grupo_id, usuario_id }])
      .select()

    if (error) {
      return sendResponse(res, {
        statusCode: 500,
        intOpCode: "SxGR500",
        data: { message: error.message }
      })
    }

    return sendResponse(res, {
      statusCode: 201,
      intOpCode: "SxGR201",
      data: { message: "Usuario agregado al grupo", miembro: data }
    })

  } catch (err) {
    return sendResponse(res, {
      statusCode: 500,
      intOpCode: "SxGR500",
      data: { message: err.message }
    })
  }
}

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

    if (error) {
      return sendResponse(res, {
        statusCode: 500,
        intOpCode: "SxGR500",
        data: { message: error.message }
      })
    }

    return sendResponse(res, {
      statusCode: 200,
      intOpCode: "SxGR200",
      data
    })

  } catch (err) {
    return sendResponse(res, {
      statusCode: 500,
      intOpCode: "SxGR500",
      data: { message: err.message }
    })
  }
}
  export const removeUsuarioGrupo = async (req, res) => {
  try {
    const { grupo_id, usuario_id } = req.params

    const { error } = await supabase
      .from("grupo_miembros")
      .delete()
      .eq("grupo_id", grupo_id)
      .eq("usuario_id", usuario_id)

    if (error) {
      return sendResponse(res, {
        statusCode: 500,
        intOpCode: "SxGR500",
        data: { message: error.message }
      })
    }

    return sendResponse(res, {
      statusCode: 200,
      intOpCode: "SxGR200",
      data: { message: "Usuario removido del grupo" }
    })

  } catch (err) {
    return sendResponse(res, {
      statusCode: 500,
      intOpCode: "SxGR500",
      data: { message: err.message }
    })
  }
}
