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
checkAndRemoveEmptyRooms();
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
    const { groupId, password } = data

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
  
    socket.to(groupId).emit('chat-message', { name, message, dateTime });
  });

  socket.on('dataImage', (data) => {
      const { groupId, imageList } = data;
      socket.to(groupId).emit('newImage', imageList);
  });

  socket.on('disconnect', () => {
    console.log(socket.id, 'disconnected');

    // socket.leave(groupId);
    // rooms[groupId].connectedClients--;
    //   if (rooms[groupId].connectedClients == 0) {
    //     delete rooms[groupId];
    //     console.log(`Room ${groupId} has been removed.`);
    //   }
  });

  

  socket.on('feedback', (data) => {
    socket.broadcast.emit('feedback', data)
  })
});

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