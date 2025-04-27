// connect-socket.js
const { io } = require('socket.io-client');

// Replace with your backend URL if needed
const socket = io('http://localhost:3000/connection'); // Custom path `/connection`

// Event when the connection is successfully established
socket.on('connect', () => {
  console.log('Connected to WebSocket server:', socket.id);
  
  // Optionally send an initial message
  socket.emit('ping', { message: 'Hello from client!' });
});

// Listen for any events you want to handle
socket.on('pong', (data) => {
  console.log('Received pong:', data);
});

// Handle connection errors
socket.on('connect_error', (error) => {
  console.error('Connection error:', error);
});

// Handle disconnection
socket.on('disconnect', () => {
  console.log('Disconnected from server');
});
