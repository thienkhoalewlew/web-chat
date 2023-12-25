const express = require('express')
const path = require('path')
const app = express()
const PORT = process.env.PORT || 4000
const server = app.listen(PORT, () => console.log(`💬 server on port ${PORT}`))
const io = require('socket.io')(server)

app.use(express.static(path.join(__dirname, 'public')))

let socketsConnected = new Map();

// Xử lý khi submit từ formNewGroup
app.post('/submitFormNewGroup', (req, res) => {
  const { username, groupId, totalClient, groupPassword } = req.body;

  // Kiểm tra xem groupId đã tồn tại chưa
  if (!socketsConnected.has(groupId)) {
    // Tạo một nhóm mới
    socketsConnected.set(groupId, {
      totalConnected: 1, // Chính người tạo nhóm đã kết nối
      totalClient: parseInt(totalClient), // Số người tối đa
      groupPassword // Mật khẩu của nhóm
    });

    // Kết nối chính người tạo nhóm vào nhóm mới
    socket.join(groupId);
    socketsConnected.get(groupId).add(socket.id);

    return res.status(200).send('New group created successfully!');
  }

  // Trả về lỗi nếu groupId đã tồn tại
  return res.status(403).send('Group ID already exists.');
});
// io.on('connection', (socket) => {

//   //Tao group va thong bao so nguoi da ket noi
//   socket.on('join-group', (groupId,totalConnected) => {
//     // Thêm socket vào groupId tương ứng
//     if (socketsConnected.has(groupId) && socketsConnected.get(groupId).size < totalConnected){
//       socket.join(groupId);
//       console.log(groupId, 'added new Client', socket.id)
//     }

//     // Lưu thông tin socket theo groupId
//     if (!socketsConnected.has(groupId)) {
//       socketsConnected.set(groupId, new Set());
//     }
//     socketsConnected.get(groupId).add(socket.id);

//     // Emit số lượng client sau khi thêm mới
//     io.to(groupId).emit('clients-total', socketsConnected.get(groupId).size);
//   });

//   //Nhan tin nhan va gui lai client khac tru client gui
//   socket.on('message', (data) => {
//     const groupId = data.groupId;

//     if (socketsConnected.has(groupId)) {
//       const groupSockets = socketsConnected.get(groupId);
//       groupSockets.forEach((socketId) => {
//         if (socket.id !== socketId) {
//           io.to(socketId).emit('chat-message', data);
//         }
//       });
//     }
//   });

//   //Client ngat ket noi
//   socket.on('disconnect', () => {
//     // Lấy groupId
//     let groupId;
//     socketsConnected.forEach((groupSockets, key) => {
//       if (groupSockets.has(socket.id)) {
//         groupId = key;
//       }
//     });

//     if (groupId) {
//       console.log(groupId, 'Socket disconnected', socket.id);
//       socketsConnected.get(groupId).delete(socket.id);
//       io.to(groupId).emit('clients-total', socketsConnected.get(groupId).size);
//     }
//   });

//   socket.on('feedback', (data) => {
//     socket.broadcast.emit('feedback', data)
//   })
// })