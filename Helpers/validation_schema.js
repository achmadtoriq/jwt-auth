const Joi = require('@hapi/joi')

const addAuthSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(6).required(),
    // role: Joi.string().required()
})

const LoginSchema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(6).required()
})

module.exports = {
    addAuthSchema,
    LoginSchema
}
