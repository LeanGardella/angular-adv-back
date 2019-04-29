// Requires
var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../config/config').SEED;

// Inicializar variables
var app = express();
var Usuario = require('../models/usuario');


// Auth google
var CLIENT_ID = require('../config/config').CLIENT_ID;
var CLIENT_SECRET = require('../config/config').CLIENT_SECRET;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

app.post('/google', (req, res, next) => {

    var token = req.body.token;
    const oAuth2Client = new OAuth2Client(
        CLIENT_ID,
        CLIENT_SECRET
    );
    const tiket = oAuth2Client.verifyIdToken({
        idToken: token
            //audience: GOOGLE_CLIENT_ID
    });
    tiket.then(datos => {
        let googleUser = datos.payload;


        Usuario.findOne({ email: googleUser.email }, (err, user) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    msg: 'Ocurrió un error grave al autenticar el usuario en la base de datos.',
                    err
                });
            }

            if (user) { // Si encontró al usuario
                if (!user.google) { // y no es de google
                    return res.status(400).json({
                        ok: false,
                        msg: 'Debe autenticarse empleando el método nativo.',
                        data: body.email
                    });
                } else { // y es de google
                    var token = jwt.sign({ usuario: user }, SEED, { expiresIn: '1h' });
                    res.status(200).json({
                        ok: true,
                        msg: 'Post login loco.',
                        data: user,
                        token,
                        id: user.id
                    });
                }
            } else { // No encontró el usuario, hay que crearlo.
                let usuario = new Usuario();

                usuario.email = googleUser.email;
                usuario.nombre = googleUser.given_name;
                usuario.apellido = googleUser.family_name;
                usuario.google = true;
                usuario.img = googleUser.picture;
                usuario.password = ':)';
                usuario.save((err, userDB) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            msg: 'Ocurrió un error grave al autenticar el usuario en la base de datos.',
                            err
                        });
                    }
                    var token = jwt.sign({ usuario: userDB }, SEED, { expiresIn: '1h' });
                    res.status(200).json({
                        ok: true,
                        msg: 'Post login loco.',
                        data: userDB,
                        token,
                        id: userDB.id
                    });

                });
            }

        });

    });
});



// Auth nativa

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