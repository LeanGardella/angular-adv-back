const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const fs = require('fs');
const Usuario = require('../models/usuario');
const Medico = require('../models/medico');
const Hospital = require('../models/hospital');

// default options
app.use(fileUpload());

app.put('/:collection/:id', function(req, res) {
    var tipoCol = req.params.collection;
    var id = req.params.id;

    var tiposColValidos = ['hospital', 'medico', 'usuario'];

    if (tiposColValidos.indexOf(tipoCol) < 0) {
        return res.status(400).json({
            ok: false,
            msg: 'No se seleccionó un tipo válido.',
            err: { message: 'Los tipos válidos son ' + tiposColValidos.join(', ') }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            msg: 'No se seleccionó ningún archivo.',
            err: { message: 'No se seleccionó ningún archivo.' }
        });
    }

    // procesar archivo
    var archivo = req.files.imagen;
    var cortado = archivo.name.split('.');
    var type = cortado[cortado.length - 1];

    // extensiones válidas
    var VALIDAS = ['png', 'jpg', 'jpeg', 'gif'];
    var size = archivo.size / 1024; // tamaño en kb

    if (VALIDAS.indexOf(type) < 0) {
        return res.status(400).json({
            ok: false,
            msg: 'No se seleccionó un archivo válido.',
            err: { message: 'Los archivos válidos son ' + VALIDAS.join(', ') }
        });
    }
    if (size > 100) {
        return res.status(400).json({
            ok: false,
            msg: 'No se seleccionó un archivo válido.',
            err: { message: 'Los archivos deben ser menores a 100Kb.' }
        });
    }

    // nombre archivo
    var filename = `${id}-${new Date().getMilliseconds()}.${type}`;

    // mover el archivo 
    var path = `./upload/${tipoCol}/${filename}`;

    archivo.mv(path, (err) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                msg: 'Error al mover el archivo.',
                err
            });
        }
        actualizarImagen(tipoCol, id, filename, res);
    });

});

function actualizarImagen(tipo, id, filename, res) {
    if (tipo == 'usuario') {
        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    msg: 'No existe el usuario con id: ' + id
                });
            }
            var pathViejo = `./upload/usuario/${usuario.img}`;
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }
            usuario.img = filename;
            usuario.save((err, usuarioActualizado) => {
                usuarioActualizado.password = ':)';
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        msg: 'Error al guardar el archivo.',
                        err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    msg: 'Archivo guardado correctamente',
                    data: usuarioActualizado
                });

            });
        });
        return;
    }
    if (tipo === 'medico') {
        Medico.findById(id, (err, medico) => {
            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    msg: 'No existe el médico con id: ' + id
                });
            }
            var pathViejo = `./upload/medico/${medico.img}`;
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }
            medico.img = filename;
            medico.save((err, medicoActualizado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        msg: 'Error al guardar el archivo.',
                        err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    msg: 'Archivo guardado correctamente',
                    data: medicoActualizado
                });

            });
        });
        return;
    }
    if (tipo === 'hospital') {
        Hospital.findById(id, (err, hospital) => {
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    msg: 'No existe el hospital con id: ' + id
                });
            }
            var pathViejo = `./upload/hospital/${hospital.img}`;
            if (fs.existsSync(pathViejo)) {
                fs.unlinkSync(pathViejo);
            }
            hospital.img = filename;
            hospital.save((err, hospitalActualizado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        msg: 'Error al guardar el archivo.',
                        err
                    });
                }

                return res.status(200).json({
                    ok: true,
                    msg: 'Archivo guardado correctamente',
                    data: hospitalActualizado
                });

            });
        });
        return;
    }
    return res.status(400).json({
        ok: false,
        msg: 'Error al mover el archivo.',
        err: { message: 'No se seleccionó un tipo válido. Tipo: -' + tipo + '-' }
    });
}



module.exports = app;