require('dotenv').config(); 
const http = require('http'); 
const app = require('./app'); 
const setupSocketIO = require('./realtime/socket'); 
const cfg = require('./config/env');

const server = http.createServer(app); //Servidor HTTP com o APP
setupSocketIO(server); //Inicialização do socket.io

//Servidor iniciado 
server.listen(cfg.PORT, () => {
  console.log(`API + WebSocket rodando na porta ${cfg.PORT} | ${cfg.BOX_ID} - ${cfg.BOX_NAME}`);
});

//Cpatura de erros
process.on('uncaughtException', (e) => console.error('uncaught', e));
process.on('unhandledRejection', (e) => console.error('unhandled', e));
