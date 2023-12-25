const express = require("express");
const http = require("http");
const socketIo = require('socket.io'); 

const path = require("path");
const app = express();
const PORT = process.env.PORT || 4000;
const server = app.listen(PORT, () => console.log(`💬 server on port ${PORT}`));
const io = socketIo(server);

app.use(express.static(path.join(__dirname, "public")));


let groupIds = new Set();
io.on('connection', (socket) => {
  console.log(socket.id,' connected');

  // Xử lý sự kiện từ formNewGroup và formGroup
  socket.on("newGroupSubmission", (data) => {
    // Kiểm tra số lượng tham số nhận được từ form
    if (Object.keys(data).length === 4) {
      // Nhận 4 tham số từ formNewGroup
      const { username, groupId, totalClient, password } = data;

      // Kiểm tra xem groupId đã tồn tại hay chưa
      if (!groupIds.has(groupId)) {
        // Nếu groupId chưa tồn tại, thêm mới groupId vào danh sách
        groupIds.add(groupId);
        console.log(socket.id, 'added new group: ', groupId)
        // Tạo các thuộc tính cho groupId
        // Tạo một object để lưu trữ thông tin của groupId
        const groupData = {
          clientConnected: new Set(),
          maxLength: totalClient,
          password: password,
        };

        // Thêm groupId và thông tin tương ứng vào groupIds
        groupIds[groupId] = groupData;

        // Thêm id của client vào group và kết nối client vào group đó
        groupIds[groupId].clientConnected.add(socket.id);

        // Redirect đến chat.html và truyền username thông qua URL query parameter
      const url = `../html/chat.html?username=${encodeURIComponent(username)}`;
      socket.emit("redirect", url);

        // Kết nối client vào group
        socket.join(groupId);
      }
    } else if (Object.keys(data).length === 3) {
      // Nhận 3 tham số từ formGroup
      const { username, groupId, password } = data;

      // Kiểm tra xem groupId có tồn tại trong danh sách hay không
      if (groupIds.has(groupId)) {
        const groupData = groupIds[groupId];

        // Kiểm tra xem số lượng clientConnected của group có nhỏ hơn maxLength hay không
        if (groupData.clientConnected.size < groupData.maxLength) {
          // Kiểm tra mật khẩu
          if (groupData.password === password) {
            // Kết nối client vào group
            socket.join(groupId);

            // Thêm id của client vào group
            groupData.clientConnected.add(socket.id);

            // Emit thông tin username của client để mở file chat.html
            socket.emit("open-chat", { username });
          }
        }
      }
    }
    socket.on("feedback", (data) => {
      socket.broadcast.emit("feedback", data);
    });
  });
})
