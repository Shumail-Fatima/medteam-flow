// server.ts
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8000 });
console.log('WebSocket server running on ws://localhost:8000');

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    // Broadcast to all except sender
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === ws.OPEN) {
        client.send(data);
      }
    });
  });
});