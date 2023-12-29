const express = require("express");
const http = require("http");
const socketIo = require('socket.io'); 

const path = require("path");
const app = express();

const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => console.log(`💬 server on port ${PORT}`));
const io = socketIo(server);

app.use(express.static(path.join(__dirname, "public")));

const rooms = {};

io.on('connection', (socket) => {
  console.log(socket.id, 'connected');

  socket.on('createRoom', (data) =>{
    const {groupId, totalClient, password} = data;
    if(!rooms[groupId]){
      rooms[groupId] = {
        connectedClients: 0,
        totalClient: totalClient,
        password: password
      }
      console.log('Added a new room id: ', groupId, 'Max Client: ', totalClient)
    }else{
      socket.emit('roomExisted','Chưa xử lý')
    }
  })
  
  socket.on('joinRoom', (data) => {
    const { username, groupId, password } = data

    if(rooms[groupId]){
      if(rooms[groupId].password == password && rooms[groupId].connectedClients < rooms[groupId].totalClient){
        socket.join(groupId);
        rooms[groupId].connectedClients++
        console.log('A client joined room ',groupId,': ', socket.id)
        socket.emit('joinedRoom')
      }else{
        if(rooms[groupId].password != password){
          socket.emit('passDoesNotCorrect','Khong nhan pass')
        }
        if(rooms[groupId].connectedClients >= rooms[groupId].totalClient){
          socket.emit('passDoesNotCorrect','full')
        }
      }
    }else{
      socket.emit('roomDoesNotExist','Khong tim thay phong')
    }
  })
  
  socket.on('newJoin',(data) => {
    const {groupId, notifi} = data  
    socket.to(groupId).emit('newJoin', notifi);
  })

  socket.on('message', (data) => {
    const { groupId, name, message, dateTime } = data;
  
    io.to(groupId).emit('chat-message', { name, message, dateTime });
  });

  socket.on('disconnect', () => {
    console.log(socket.id, 'disconnected');

    const rooms = Object.keys(socket.rooms);
  
    rooms.forEach(roomId => {
      if (roomId !== socket.id && rooms[roomId]) {
        socket.leave(roomId);
        console.log(`Client left room: ${roomId}`);
        rooms[roomId].connectedClients--;
      }
    });
  });

  // socket.on("feedback", (data) => {
  //   socket.to(groupId).broadcast.emit("feedback", data);
  // });
});