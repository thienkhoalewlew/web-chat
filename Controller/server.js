const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sql = require('mssql');
const { connectToDB } = require('../Models/database');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Endpoint để xác thực thông tin người dùng từ form
app.post('/authenticate', async (req, res) => {
  try {
    const { email, password } = req.body;

    const pool = await connectToDB();
    const request = pool.request();
    request.input('email', sql.VarChar, email);
    request.input('password', sql.VarChar, password);

    const query = `
      SELECT id
      FROM user_in4
      WHERE email = @email AND password = @password`
    ;

    const result = await request.query(query);

    if (result.recordset.length > 0) {
      const userId = result.recordset[0].id;
      // Nếu xác thực thành công, trả về id của người dùng
      res.status(200).json({ userId });
    } else {
      // Nếu thông tin không chính xác
      res.status(401).json({ message: 'Email hoặc password không đúng' });
    }
  } catch (error) {
    console.error('Lỗi xác thực:', error);
    res.status(500).json({ message: 'Lỗi xác thực' });
  }
});
io.on('connection', (socket) => {
  console.log('A client connected');
  // Lắng nghe tin nhắn từ client và gửi lại tới tất cả các client khác
  socket.on('chatMessage', (msg) => {
    io.emit('chatMessage', msg); // Gửi lại tin nhắn tới tất cả các client
  });

  socket.on('disconnect', () => {
    console.log('A client disconnected');
  });
});

app.listen(3000, () => {
  console.log('Server đang lắng nghe trên cổng 3000');
});

