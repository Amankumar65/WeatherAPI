import Joi from "joi"

export const citySchema = Joi.object({
    name: Joi.string().trim().min(2).required()
})