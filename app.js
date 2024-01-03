const express = require("express");
const http = require("http");
const socketIo = require('socket.io');

const path = require("path");
const app = express();
const fs = require('fs');

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => console.log(`💬 server on port ${PORT}`));
const io = socketIo(server);

app.use(express.static(path.join(__dirname, "public")));

const rooms = {};
checkAndRemoveEmptyRooms();
io.on('connection', (socket) => {
  console.log(socket.id, 'connected');

  socket.on('createRoom', (data) => {
    const { groupId, totalClient, password } = data;
    if (!rooms[groupId]) {
      rooms[groupId] = {
        connectedClients: 0,
        totalClient: totalClient,
        password: password,
        participants: []
      }
      console.log('Added a new room id: ', groupId, 'Max Client: ', totalClient)
      socket.emit('roomCreated', 'Room created successfully')
    } else {
      socket.emit('roomExisted', 'Room already exists')
    }
  })

  socket.on('joinRoom', (data) => {
    const { groupId, password, username } = data;

    if (rooms[groupId]) {
      if (rooms[groupId].password === password && rooms[groupId].connectedClients < rooms[groupId].totalClient) {
        socket.join(groupId);

        const user = { id: socket.id, username, groupId };
        rooms[groupId].participants.push(user);

        rooms[groupId].connectedClients++;
        console.log('A client joined room ', groupId, ': ', socket.id);
        socket.emit('joinedRoom');
        io.to(groupId).emit('joinedParticipantsList', rooms[groupId].participants);
      } else {
        if (rooms[groupId].password !== password) {
          socket.emit('passDoesNotCorrect', 'Incorrect password');
        }
        if (rooms[groupId].connectedClients >= rooms[groupId].totalClient) {
          socket.emit('passDoesNotCorrect', 'The room has enough participants');
        }
      }
    } else {
      socket.emit('roomDoesNotExist', 'Group not found');
    }
  });
  socket.on('newJoin', (data) => {
    const { groupId, notifi } = data
    socket.to(groupId).emit('newJoin', notifi);
  })
  socket.on('message', (data) => {
    const { groupId, name, message, dateTime } = data;

    socket.to(groupId).emit('chat-message', { name, message, dateTime });
  });

  socket.on('dataImage', (data) => {
    const { groupId, imageList } = data;
    socket.to(groupId).emit('newImage', imageList);
  });

  socket.on('disconnect', () => {
    console.log(socket.id, 'disconnected');
    leaveRoomHandler(socket.id);
  });
  socket.on('sendFile', (data) => {
    const { groupId, fileName, fileArrayBuffer } = data
    socket.to(groupId).emit('receivedFile', { fileName, fileArrayBuffer })
  });
  const chunks = {};
  socket.on('sendChunk', (data) => {
    const { groupId, fileName, fileArrayBuffer, offset, totalChunks } = data;
    socket.to(groupId).emit('resendChunk', { fileName, fileArrayBuffer, offset, totalChunks })
  });


  socket.on('feedback', (data) => {
    socket.broadcast.emit('feedback', data)
  })
});
function leaveRoomHandler(socketId) {
  Object.keys(rooms).forEach((groupId) => {
    const participants = rooms[groupId].participants;
    const index = participants.findIndex(user => user.id === socketId);
    if (index !== -1) {
      participants.splice(index, 1);
      rooms[groupId].connectedClients--;
      io.to(groupId).emit('leftRoom', rooms[groupId].participants);
    }
  });
}
function checkAndRemoveEmptyRooms() {
  setInterval(() => {
    const roomKeys = Object.keys(rooms);
    roomKeys.forEach((roomId) => {
      const room = rooms[roomId];
      if (room.connectedClients === 0) {
        delete rooms[roomId];
        console.log(`Room ${roomId} has been removed due to inactivity.`);
      }
    });
  }, 30000); //Kiểm tra mỗi 30p
}
