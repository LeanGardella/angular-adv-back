// Requires
var express = require('express');
var Hospital = require('../models/hospital');
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');

// Inicializar variables
var app = express();

// Routes

app.get('/collection/:col/:term', (req, res, next) => {
    var term = req.params.term;
    var col = req.params.col;
    var regex = new RegExp(term, 'i');
    var promesa = null;

    switch (col) {
        case 'usuario':
            promesa = buscarUsuarios(term, regex);
            break;
        case 'medico':
            promesa = buscarMedicos(term, regex);
            break;
        case 'hospital':
            promesa = buscarHospitales(term, regex);
            break;
        default:
            res.status(400).json({
                ok: false,
                msg: 'Colección inexistente.'
            });
            break;
    }
    promesa.then((resps) => {
        res.status(200).json({
            ok: true,
            msg: 'Búsqueda realizada.',
            data: resps,
            searching: term
        });
    });

});

app.get('/all/:term', (req, res, next) => {
    var term = req.params.term;
    var regex = new RegExp(term, 'i');


    Promise.all([
            buscarHospitales(term, regex),
            buscarMedicos(term, regex),
            buscarUsuarios(term, regex)
        ])
        .then((resps) => {
            res.status(200).json({
                ok: true,
                msg: 'Búsqueda realizada.',
                data: {
                    hospitales: resps[0],
                    usuarios: resps[2],
                    medicos: resps[1]
                },
                searching: term
            });
        });

});

function buscarHospitales(term, regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre apellido email')
            .exec((err, hospitales) => {
                if (err) {
                    reject('Error al buscar hospitales.', err);
                } else {
                    resolve(hospitales);
                }
            });
    });
}

function buscarMedicos(term, regex) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre apellido email')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    reject('Error al buscar médicos.', err);
                } else {
                    resolve(medicos);
                }
            });
    });
}

function buscarUsuarios(term, regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre apellido email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuarios) => {
                if (err) {
                    reject('Error al buscar usuarios.', err);
                } else {
                    resolve(usuarios);
                }
            });
    });
}

// Ruta default
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        msg: 'Todo ok! No implementado.'
    });
});

module.exports = app;