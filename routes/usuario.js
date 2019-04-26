// Requires
var express = require('express');
var bcrypt = require('bcryptjs');

// Inicializar variables
var app = express();
var Usuario = require('../models/usuario');
var auth = require('../middleware/auth');

// Routes
// Listar todos los usuarios
app.get('/', (req, res, next) => {

    Usuario.find({}, 'nombre apellido email img role')
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        msg: 'Ocurrió un error grave al recuperar todos los usuarios desde la base de datos.',
                        err
                    });
                }
                res.status(200).json({
                    ok: true,
                    msg: 'Recuperados todos los usuarios de la base de datos.',
                    data: usuarios
                });
            });
});

// Actualizar usuario
app.put('/:id', auth.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, user) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                msg: 'Ocurrió un error grave al actualizar el usuario en la base de datos.',
                err
            });
        }

        if (!user) {
            return res.status(400).json({
                ok: false,
                msg: 'No se encuentra el usuario ' + id + ' en la base de datos.',
                data: id
            });
        }

        user.nombre = body.nombre;
        user.apellido = body.apellido;
        user.email = body.email;
        user.role = body.role;

        user.save((err, saved) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Ocurrió un error grave al actualizar el usuario ' + id + ' en la base de datos.',
                    err
                });
            }
            saved.password = ':)';
            res.status(200).json({
                ok: true,
                msg: 'Se actualizó el usuario ' + id + ' en la base de datos.',
                data: saved
            });
        });

    });

});



// Crear usuario nuevo
app.post('/', auth.verificaToken, (req, res) => {
    var body = req.body;
    var usuario = new Usuario({
        nombre: body.nombre,
        apellido: body.apellido,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((err, saved) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                msg: 'Ocurrió un error grave al guardar el nuevo usuario en la base de datos.',
                err
            });
        }
        res.status(201).json({
            ok: true,
            msg: 'Creado e insertado el nuevo usuario en la base de datos.',
            data: saved
        });
    });

});


// Borrar un usuario
app.delete('/:id', auth.verificaToken, (req, res) => {
    var id = req.params.id;
    Usuario.findByIdAndDelete(id, (err, deleted) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                msg: 'Ocurrió un error grave al eliminar el usuario de la base de datos.',
                err
            });
        }

        if (!deleted) {
            return res.status(400).json({
                ok: false,
                msg: 'No se encuentra el usuario ' + id + ' en la base de datos.',
                data: id
            });
        }
        res.status(200).json({
            ok: true,
            msg: 'Se encontró y eliminó el usuario de la base de datos.',
            data: deleted
        });
    });
});

module.exports = app;