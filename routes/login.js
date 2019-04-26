// Requires
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

// Inicializar variables
var app = express();
var Usuario = require('../models/usuario');

app.post('/', (req, res) => {
    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, user) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                msg: 'Ocurrió un error grave al autenticar el usuario en la base de datos.',
                err
            });
        }

        if (!user) {
            return res.status(400).json({
                ok: false,
                msg: 'Credenciales incorrectas.',
                data: body.email
            });
        }
        if (!bcrypt.compareSync(body.password, user.password)) {
            return res.status(400).json({
                ok: false,
                msg: 'Credenciales incorrectas.',
                data: body.password
            });
        }

        // Crear JWToken
        var token = jwt.sign({ user }, SEED, { expiresIn: '1h' });

        res.status(200).json({
            ok: true,
            msg: 'Post login loco.',
            data: user,
            token,
            id: user.id
        });
    });
});

module.exports = app;