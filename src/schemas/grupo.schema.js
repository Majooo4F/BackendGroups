import Ajv from "ajv"

const ajv = new Ajv()

const schema = {
  type: "object",
  properties: {
    nombre: { type: "string", minLength: 3 },
    descripcion: { type: "string" }
  },
  required: ["nombre"],
  additionalProperties: false
}

const validateGrupo = ajv.compile(schema)

export default validateGrupo
