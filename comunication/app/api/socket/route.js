import { WebSocketServer } from 'ws';

let wss;

if (!global.wss) {
  wss = new WebSocketServer({ noServer: true });
  global.wss = wss;

  wss.on('connection', (socket) => {
    socket.on('message', (message) => {
      console.log(`Received message => ${message}`);
    });
    socket.send('Hello! Message From Server!!');
  });
} else {
  wss = global.wss;
}

export async function GET(request) {
  return new Response(null, { status: 200 });
}
