// Import thư viện mssql
const sql = require('mssql');

// Thông tin cấu hình kết nối đến SQL Server
const config = {
  user: 'sa', 
  password: '123456789', 
  server: 'localhost', 
  database: 'web_chat',
  options: {
    trustServerCertificate: true // Thêm tùy chọn này để chấp nhận chứng chỉ tự ký
  }
};

// Hàm kết nối đến SQL Server và trả về một pool kết nối
const connectToDB = async () => {
  try {
    const pool = await sql.connect(config);
    console.log('Đã kết nối đến SQL Server');
    return pool;
  } catch (err) {
    console.error('Lỗi kết nối đến SQL Server:', err);
    throw err;
  }
};

module.exports = { connectToDB };