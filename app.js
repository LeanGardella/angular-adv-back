// Requires
var express = require('express');
var mongoose = require('mongoose');


// Inicializar variables
var app = express();

mongoose.connect('mongodb://localhost:27017/hospitalDB', { useNewUrlParser: true }, (err, res) => {
    if (err) throw err;
    console.log('\x1b[32m%s\x1b[0m', 'ONLINE', '- MongoDB corriendo en puerto 27017.');
});

// Routes
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        data: 'Todo ok!'
    });
});

// Escuchar peticiones
app.listen(3000, () => console.log('\x1b[32m%s\x1b[0m', 'ONLINE', '- Express server corriendo en puerto 3000.'));