import { Server } from 'ws'

const wss = new Server({ noServer: true })

wss.on('connection', socket => {
  socket.on('message', message => {
    console.log(`Received message => ${message}`)
  })
  socket.send('Hello! Message From Server!!')
})

export async function GET(request) {
  if (!global.wss) {
    global.wss = wss
  }
  return new Response(null, { status: 200 })
}
