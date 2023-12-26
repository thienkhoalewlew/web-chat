const express = require("express");
const http = require("http");
const socketIo = require('socket.io'); 

const path = require("path");
const app = express();
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => console.log(`💬 server on port ${PORT}`));
const io = socketIo(server);

app.use(express.static(path.join(__dirname, "public")));

let groupIds = new Map();

io.on('connection', (socket) => {
  console.log(socket.id, 'connected');

  socket.on("newGroupSubmission", (data) => {
    const { username, groupId, totalClient, password } = data;

      if (!groupIds.has(groupId)) {
        groupIds.set(groupId, {
          clientConnected: new Set(),
          maxLength: totalClient,
          password: password,
        });

        const groupData = groupIds.get(groupId);
        console.log(socket.id, 'added new group: ', groupId)
        groupData.clientConnected.add(socket.id);

        const url = `../html/chat.html?username=${encodeURIComponent(username)}&groupId=${encodeURIComponent(groupId)}`;
        socket.emit("redirect", url);

        socket.join(groupId);
        io.emit('clients-total', groupData.size)
        if(groupData.size !=0){
          console.log(`Clients in group ${groupId}: ${Array.from(groupData.clientConnected)}`);
        } else {
          console.log("Erro Add")
        }
      } else {
        console.log('ID group already exists');
      }
    });
  socket.on('groupSubmission', (data) => {
    const { username, groupId, password } = data;
    
    if (groupIds.has(groupId)) {
      const groupData = groupIds.get(groupId);
      if (groupData.clientConnected.size < groupData.maxLength && groupData.password === password) {
        const url = `../html/chat.html?username=${encodeURIComponent(username)}&groupId=${encodeURIComponent(groupId)}`;
        socket.emit("redirect", url);

        socket.join(groupId);

        io.emit('clients-total', groupData.size)
      }
    } else{
      console.log('ID group does not exist');
    }
  })
  socket.on('disconnect', () => {
    console.log(socket.id,'disconnected');

    groupIds.forEach((groupData) => {
      if (groupData.clientConnected.has(socket.id)) {
        groupData.clientConnected.delete(socket.id);
      
      }
    });
  });

  socket.on('message', (data) => {
    const { groupId, name, message, dateTime } = data;
  
    io.to(groupId).emit('chat-message', { name, message, dateTime });
  });

  socket.on("feedback", (data) => {
    socket.broadcast.emit("feedback", data);
  });
});