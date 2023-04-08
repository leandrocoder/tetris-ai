const WebSocket = require('ws');
const AI = require('./ai');
const DinoAI = require('./dino.ai');

// Criar um servidor WebSocket
const server = new WebSocket.Server({ port: 8080 });

// Manipular conexões de clientes
server.on('connection', (socket) => {
  console.log('Cliente conectado');

  // Manipular mensagens recebidas do cliente
  socket.on('message', (message) => {
    console.log('Mensagem recebida:', message);

    // Enviar uma mensagem de volta ao cliente
    socket.send(`Você enviou: ${message}`);
  });

  // Manipular o fechamento da conexão
  socket.on('close', () => {
    console.log('Cliente desconectado');
  });
});

console.log('Servidor WebSocket rodando na porta 8080');