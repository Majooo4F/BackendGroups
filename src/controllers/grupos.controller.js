// grupos.controller.js
import supabase from "../config/supabase.js"
import validateGrupo from "../schemas/grupo.schema.js"
import { sendResponse } from "../helpers/response.js"

export const createGrupo = async (req, res) => {
  try {
    const userId = req.headers["x-user-id"]

    const valid = validateGrupo(req.body)
    if (!valid) {
      return sendResponse(res, {
        statusCode: 400,
        intOpCode: "SxGR400",
        data: { message: "Datos inválidos", errors: validateGrupo.errors }
      })
    }

    const { nombre, descripcion } = req.body

    const { data, error } = await supabase
      .from("grupos")
      .insert([{ nombre, descripcion, creador_id: userId, creado_en: new Date() }])
      .select()
      .single()

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
      data: { message: "Grupo creado", grupo: data }
    })

  } catch (err) {
    return sendResponse(res, {
      statusCode: 500,
      intOpCode: "SxGR500",
      data: { message: err.message }
    })
  }
}

export const getGrupos = async (req, res) => {
  try {
    const { data, error } = await supabase.from("grupos").select("*")

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
export const getGruposByUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    console.log('🔍 Buscando grupos para usuario:', id);

    const { data, error } = await supabase
      .from("miembros")
      .select("grupo_id")
      .eq("usuario_id", id);

    if (error) {
      console.error('❌ Error en miembros:', error);
      throw error;
    }

    const grupoIds = data.map(m => m.grupo_id);

    console.log('📌 IDs de grupos:', grupoIds);

    if (grupoIds.length === 0) {
      return res.json({ data: [] });
    }

    const { data: grupos, error: errorGrupos } = await supabase
      .from("grupos")
      .select("*")
      .in("id", grupoIds);

    if (errorGrupos) {
      console.error('❌ Error en grupos:', errorGrupos);
      throw errorGrupos;
    }

    console.log('✅ Grupos encontrados:', grupos);

    res.json({ data: grupos });

  } catch (err) {
    console.error('🔥 ERROR GENERAL:', err);
    res.status(500).json({ message: err.message });
  }
};

export const updateGrupo = async (req, res) => {
  try {
    const { id } = req.params

    const valid = validateGrupo(req.body)
    if (!valid) {
      return sendResponse(res, {
        statusCode: 400,
        intOpCode: "SxGR400",
        data: { message: "Datos inválidos", errors: validateGrupo.errors }
      })
    }

    const { nombre, descripcion } = req.body

    const { data, error } = await supabase
      .from("grupos")
      .update({ nombre, descripcion })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return sendResponse(res, {
        statusCode: 500,
        intOpCode: "SxGR500",
        data: { message: error.message }
      })
    }

    if (!data) {
      return sendResponse(res, {
        statusCode: 404,
        intOpCode: "SxGR404",
        data: { message: "Grupo no encontrado" }
      })
    }

    return sendResponse(res, {
      statusCode: 200,
      intOpCode: "SxGR200",
      data: { message: "Grupo actualizado", grupo: data }
    })

  } catch (err) {
    return sendResponse(res, {
      statusCode: 500,
      intOpCode: "SxGR500",
      data: { message: err.message }
    })
  }
}

export const deleteGrupo = async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase.from("grupos").delete().eq("id", id)

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
      data: { message: "Grupo eliminado" }
    })

  } catch (err) {
    return sendResponse(res, {
      statusCode: 500,
      intOpCode: "SxGR500",
      data: { message: err.message }
    })
  }
}