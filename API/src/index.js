require('dotenv').config();
const express = require('express');
const http = require('http');
const statusRoutes = require('./routes/status.routes');
const setupSocketIO = require('./realtime/socket');

const app = express();

app.use('/api/status', statusRoutes);

const PORT = process.env.PORT;
const server = http.createServer(app);

setupSocketIO(server);

server.listen(PORT, () => {
  console.log(`API + WebSocket rodando na porta ${PORT}`);
});
