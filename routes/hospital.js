// Requires
var express = require('express');


// Inicializar variables
var app = express();
var Hospital = require('../models/hospital');
var auth = require('../middleware/auth');

// Routes
// Listar todos los hospitales
app.get('/', (req, res) => {
    var desde = 0;

    if (!Number.isNaN(req.query.desde)) {
        desde = Number(req.query.desde);
    }

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre apellido email')
        .exec(
            (err, hospitales) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        msg: 'Ocurrió un error grave al recuperar todos los hospitales desde la base de datos.',
                        err
                    });
                }
                Hospital.countDocuments({}, (err, count) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            msg: 'Ocurrió un error grave al recuperar todos los hospitales desde la base de datos.',
                            err
                        });
                    }
                    res.status(200).json({
                        ok: true,
                        msg: 'Recuperados todos los hospitales de la base de datos.',
                        data: hospitales,
                        count
                    });

                });
            });
});

// Actualizar hospital
app.put('/:id', auth.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospitalRecuperado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                msg: 'Ocurrió un error grave al actualizar el hospital en la base de datos.',
                err
            });
        }

        if (!hospitalRecuperado) {
            return res.status(400).json({
                ok: false,
                msg: 'No se encuentra el hospital ' + id + ' en la base de datos.',
                data: id
            });
        }

        hospitalRecuperado.nombre = body.nombre;
        hospitalRecuperado.img = body.img;

        hospitalRecuperado.save((err, saved) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Ocurrió un error grave al actualizar el hospital ' + id + ' en la base de datos.',
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



// Crear hospital nuevo
app.post('/', auth.verificaToken, (req, res) => {
    var body = req.body;
    var usuario = req.usuario;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: usuario._id,
        img: body.img
    });

    hospital.save((err, saved) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                msg: 'Ocurrió un error grave al guardar el nuevo hospital en la base de datos.',
                err
            });
        }
        res.status(201).json({
            ok: true,
            msg: 'Creado e insertado el nuevo hospital en la base de datos.',
            data: saved
        });
    });

});


// Borrar un hospital
app.delete('/:id', auth.verificaToken, (req, res) => {
    var id = req.params.id;
    Hospital.findByIdAndDelete(id, (err, deleted) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                msg: 'Ocurrió un error grave al eliminar el hospital de la base de datos.',
                err
            });
        }

        if (!deleted) {
            return res.status(400).json({
                ok: false,
                msg: 'No se encuentra el hospital ' + id + ' en la base de datos.',
                data: id
            });
        }
        res.status(200).json({
            ok: true,
            msg: 'Se encontró y eliminó el hospital de la base de datos.',
            data: deleted
        });
    });
});

module.exports = app;