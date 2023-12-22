const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

// Configure CORS
const corsOptions = {
  origin: '*', // Replace with your frontend's origin
  methods: ['GET', 'POST']
};

app.use(cors(corsOptions));

const io = new Server(server, {
  cors: {
    origin: corsOptions.origin,
    methods: corsOptions.methods
  }
});

const PORT = process.env.PORT || 3001;

// Enable CORS for your Express routes
app.use(cors());

app.get('/', (req, res) => {
  res.send('Cat and Mouse Game Server');
});

let users = {}; // Store user data

io.on('connection', (socket) => {
  console.log('A user connected: ' + socket.id);

  // Assign the user as a cat or a mouse randomly
  users[socket.id] = {
    role: Math.random() < 0.5 ? 'cat' : 'mouse', // 50% chance of being either
    location: null
  };

  // Notify the user of their role
  socket.emit('roleAssigned', users[socket.id].role);

  socket.on('updateLocation', (location) => {
    console.log(`Location of ${socket.id}: ${location.latitude}, ${location.longitude}`);
    users[socket.id].location = location;
    // Broadcast the updated users' data to all connected clients
    
    io.emit('locationUpdate', users);
    // Debugging: Check if this log appears when location is updated
    console.log(`Emitting locationUpdate for all users`);
    
    // Here you can add logic to check if a cat catches a mouse
  });

  
  socket.on('mouseCaught', () => {
    if(users[socket.id].role === 'mouse') {
      users[socket.id].role = 'cat'; // Change role from mouse to cat
      // Implement logic for when a mouse is caught
      socket.emit('roleChanged', 'cat');
    }
  });



  socket.on('disconnect', () => {
    console.log('User disconnected: ' + socket.id);
    delete users[socket.id]; // Remove user from users object
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
