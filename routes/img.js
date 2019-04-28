// Requires
var express = require('express');
var path = require('path');
var fs = require('fs');

// Inicializar variables
var app = express();

// Routes
app.get('/:tipo/:img', (req, res, next) => {

    var tipo = req.params.tipo;
    var img = req.params.img;

    var pathImg = path.resolve(__dirname, `../upload/${tipo}/${img}`);

    if (!fs.existsSync(pathImg)) {
        pathImg = path.resolve(__dirname, '../assets/no-img.jpg');
    }

    res.sendFile(pathImg);

});

module.exports = app;