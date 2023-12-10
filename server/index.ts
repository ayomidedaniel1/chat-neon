import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import socketIO from 'socket.io';

const app = express();
const server = http.createServer(app);
const PORT = 4000;

const io = new socketIO.Server(server, {
  cors: {
    origin: "http://localhost:3000",
  },
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

const generateID = (): string => Math.random().toString(36).substring(2, 10);
let chatRooms: {
  id: string;
  name: string;
  messages: {
    id: string;
    text: string;
    time: string;
    user: string;
  }[];
}[] = [];

io.on('connection', (socket) => {
  console.log(`⚡: ${socket.id} user just connected!`);

  socket.on('createRoom', (name: string) => {
    socket.join(name);
    chatRooms.unshift({ id: generateID(), name, messages: [] });
    socket.emit('roomsList', chatRooms);
  });

  socket.on('findRoom', (id: string) => {
    let result = chatRooms.filter((room) => room.id === id);
    socket.emit('foundRoom', result[0]?.messages || []);
  });

  socket.on('newMessage', (data: { room_id: string; message: string; user: string; timestamp: { hour: string; mins: string; }; }) => {
    const { room_id, message, user, timestamp } = data;
    let result = chatRooms.filter((room) => room.id === room_id);
    const newMessage = {
      id: generateID(),
      text: message,
      user,
      time: `${timestamp.hour}:${timestamp.mins}`,
    };
    console.log('New Message', newMessage);
    socket.to(result[0]?.name).emit('roomMessage', newMessage);
    result[0]?.messages.push(newMessage);

    io.emit('roomsList', chatRooms);
    socket.emit('foundRoom', result[0]?.messages || []);
  });

  socket.on('disconnect', () => {
    console.log('🔥: A user disconnected');
  });
});

app.get('/api', (req: Request, res: Response) => {
  res.json(chatRooms);
});

server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
