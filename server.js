const express = require('express');
const app = express();
const routes = require('./Routes.js');

app.use(express.json());
app.use('/', routes);
app.use(express.static('public'));
app.listen(3001, () => console.log('Running on port 3001'));