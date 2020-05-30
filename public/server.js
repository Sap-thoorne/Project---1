const express = require("express");
let app = express();
const fs = require('fs');

const http = require('http');
const server = http.createServer(app);

let io = require('socket.io').listen(server);
const port = process.env.PORT || 3000;

app.use(express.static(__dirname));

let clients = 0, userNames = {};

io.on('connection', socket => {
  console.log('There is a user on this server.');
  socket.emit('message', "hello client");
  socket.on('NewClient', function (data) {
    userNames[socket.id] = data;
    socket.emit("yourId", socket.id);
    io.sockets.emit('allUsers', userNames);
    clients++;
  });
  console.log(`There are ${clients} on this server`);

  socket.on('disconnect', Disconnect);

  socket.on('callUser', data => {
    io.to(data.userToCall).emit('hey', {signal:data.signalData, from: data.from});
  });

  socket.on('acceptCall', data => {
    io.to(data.to).emit('callAccepted', data.signal);
  });

  socket.on('Reject', data => {
    io.to(data.to).emit('callRejected');
  });

});

function Disconnect(){
  if(clients > 0) {
    clients--;
    delete userNames[this.id];
    this.broadcast.emit('Disconnect');
  }
  io.sockets.emit('allUsers', userNames);
}

server.listen(port, () => console.log(`server is running on ${port}.`));
