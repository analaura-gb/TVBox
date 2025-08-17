const express = require('express');
const cors = require('cors');
const statusRoutes = require('./routes/status.routes');

const app = express();

app.set('trust proxy', true); //Permite pegar o IP real
app.use(cors());
app.use(express.json());

app.get('/healthz', (req, res) => res.json({ ok: true, ts: Date.now() })); //Endpoint de health check

app.use('/api', statusRoutes); //Rotas status

module.exports = app;
