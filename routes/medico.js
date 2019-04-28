// Requires
var express = require('express');


// Inicializar variables
var app = express();
var Medico = require('../models/medico');
var auth = require('../middleware/auth');

// Routes
// Listar todos los medicos
app.get('/', (req, res) => {
    var desde = 0;

    if (!Number.isNaN(req.query.desde)) {
        desde = Number(req.query.desde);
    }

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre apellido email')
        .populate('hospital', 'nombre img')
        .exec(
            (err, medicos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        msg: 'Ocurrió un error grave al recuperar todos los medicos desde la base de datos.',
                        err
                    });
                }
                Medico.countDocuments({}, (err, count) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            msg: 'Ocurrió un error grave al recuperar todos los medicos desde la base de datos.',
                            err
                        });
                    }
                    res.status(200).json({
                        ok: true,
                        msg: 'Recuperados todos los medicos de la base de datos.',
                        data: medicos,
                        count
                    });
                });

            });
});

// Actualizar médico
app.put('/:id', auth.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medicoRecuperado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                msg: 'Ocurrió un error grave al actualizar el médico en la base de datos.',
                err
            });
        }

        if (!medicoRecuperado) {
            return res.status(400).json({
                ok: false,
                msg: 'No se encuentra el médico ' + id + ' en la base de datos.',
                data: id
            });
        }

        medicoRecuperado.nombre = body.nombre;
        medicoRecuperado.img = body.img;
        medicoRecuperado.hospital = body.hospital || medicoRecuperado.hospital;

        medicoRecuperado.save((err, saved) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Ocurrió un error grave al actualizar el médico ' + id + ' en la base de datos.',
                    err
                });
            }

            res.status(200).json({
                ok: true,
                msg: 'Se actualizó el hospital ' + id + ' en la base de datos.',
                data: saved
            });
        });

    });

});



// Crear medico nuevo
app.post('/', auth.verificaToken, (req, res) => {
    var body = req.body;
    var usuario = req.usuario;

    var medico = new Medico({
        nombre: body.nombre,
        usuario: usuario._id,
        img: body.img,
        hospital: body.hospital
    });

    medico.save((err, saved) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                msg: 'Ocurrió un error grave al guardar el nuevo médico en la base de datos.',
                err
            });
        }
        res.status(201).json({
            ok: true,
            msg: 'Creado e insertado el nuevo médico en la base de datos.',
            data: saved
        });
    });

});


// Borrar un médico
app.delete('/:id', auth.verificaToken, (req, res) => {
    var id = req.params.id;
    Medico.findByIdAndDelete(id, (err, deleted) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                msg: 'Ocurrió un error grave al eliminar el médico de la base de datos.',
                err
            });
        }

        if (!deleted) {
            return res.status(400).json({
                ok: false,
                msg: 'No se encuentra el médico ' + id + ' en la base de datos.',
                data: id
            });
        }
        res.status(200).json({
            ok: true,
            msg: 'Se encontró y eliminó el médico de la base de datos.',
            data: deleted
        });
    });
});

module.exports = app;