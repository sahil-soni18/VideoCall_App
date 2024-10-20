import express from 'express';
import { Server } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { ExpressPeerServer } from 'peer';
import path from 'path';

const app = express();
const server = Server(app);
const io = new SocketIOServer(server);
const port = process.env.PORT || 4000;

// Set up PeerJS server with debug mode
const peer = ExpressPeerServer(server, {
  debug: true
});

// Set up middleware and view engine
app.use('/peerjs', peer);
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Define routes
app.get('/', (req, res) => {
  res.send(uuidv4());
});

app.get('/:room', (req, res) => {
  res.render('index', { RoomId: req.params.room });
});

// Handle socket.io connections
io.on('connection', (socket) => {
	socket.on('newUser', (id, room) => {
	  socket.join(room);
	  // Broadcast to everyone in the room except the sender
	  socket.to(room).emit('userJoined', id);
  
	  socket.on('disconnect', () => {
		// Notify others in the room that the user has disconnected
		socket.to(room).emit('userDisconnect', id);
	  });
	});
  });
  

// Start the server
server.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
