var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var roles = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: 'El rol {VALUE} no es válido.'
};

var usuarioSchema = new Schema({
    nombre: { type: String, required: [true, 'El campo nombre es obligatorio.'] },
    apellido: { type: String, required: [true, 'El campo apellido es obligatorio.'] },
    email: { type: String, unique: true, required: [true, 'El campo email es obligatorio.'] },
    password: { type: String, required: [true, 'El campo contraseña es obligatorio.'] },
    img: { type: String, required: false },
    role: { type: String, required: [true, 'El campo role es obligatorio.'], default: 'USER_ROLE', enum: roles }

});

usuarioSchema.plugin(uniqueValidator, { message: 'El {PATH} debe ser único y ya se encuentra registrado.' });

module.exports = mongoose.model('Usuario', usuarioSchema);