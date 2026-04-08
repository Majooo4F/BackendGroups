import Ajv from "ajv"

const ajv = new Ajv()

const schema = {
  type: "object",
  properties: {
    nombre: { type: "string", minLength: 3 },
    descripcion: { type: "string", minLength: 5 }
  },
  required: ["nombre", "descripcion"],
  additionalProperties: false
}

const validateGrupo = ajv.compile(schema)

export default validateGrupo