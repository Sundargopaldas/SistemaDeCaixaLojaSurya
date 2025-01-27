const express = require('express');
const path = require('path');
const app = express();
const routes = require('./Routes.js');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para MIME types
app.use('/js', (req, res, next) => {
    res.type('application/javascript');
    next();
});

// Rotas API
app.use('/', routes);

app.listen(3001, () => console.log('Running on port 3001'));